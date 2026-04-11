import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 扁平化管理節點介面
 */
interface FlatManagementNode {
  id: string;
  name: string;
  type: "landlord" | "property" | "organization" | "manager" | "tenant";
  status?: string;
  subtitle?: string;
  metadata?: any;
  children?: any[]; 
}

/**
 * GET /api/management/tree
 * 根據角色取得扁平化管理清單
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get("parentId");
  const parentType = searchParams.get("parentType");

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "未經授權" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  try {
    let flatData: any[] = [];

    if (role === "ADMIN") {
      if (!parentId) {
        // 取得頂層組織 (Nexus Root)
        const organizations = await prisma.organization.findMany({
          include: {
            owner: true,
            members: { include: { user: true } },
            _count: {
              select: { properties: true }
            },
            properties: {
              include: {
                contracts: {
                  where: { status: "OCCUPIED" },
                  include: { tenant: true }
                }
              }
            }
          }
        });
        
        flatData = organizations.map((org: any) => {
          // 1. 提取組織成員 (房東與經理)
          const membersUsers = org.members?.map((m: any) => ({
            id: m.user.id,
            name: m.user.name || m.user.email || "未命名使用者",
            email: m.user.email,
            role: m.memberRole === "OWNER" ? "LANDLORD" : "MANAGER",
            status: m.user.status,
            relatedEntity: m.memberRole === "OWNER" ? "組織擁有者" : "管理人員"
          })) || [];

          // 2. 提取組織下所有房源的現任租客
          const tenantUsers = org.properties.flatMap((p: any) =>
            p.contracts.map((c: any) => ({
              id: c.tenant.id,
              name: c.tenant.name || c.tenant.email || "未命名房客",
              email: c.tenant.email,
              role: "TENANT",
              status: c.tenant.status,
              relatedEntity: `${p.address} (${p.roomNumber || '無房號'})`
            }))
          );

          // 3. 確保組織主要擁有者 (Owner) 也在清單中
          const orgOwner = {
            id: org.owner.id,
            name: org.owner.name || org.owner.email,
            email: org.owner.email,
            role: "LANDLORD",
            status: org.owner.status,
            relatedEntity: "組織持有人"
          };

          // 4. 合併並去重
          const deepUsersMap = new Map();
          [orgOwner, ...membersUsers, ...tenantUsers].forEach(u => {
            if (u.id) deepUsersMap.set(u.id, u);
          });

          const finalUsers = Array.from(deepUsersMap.values());

          return {
            id: `org-${org.id}`,
            originalId: org.id,
            name: org.name,
            type: "organization",
            subtitle: `擁有者: ${org.owner.name || org.owner.email}`,
            status: "ACTIVE",
            hasChildren: true,
            metadata: {
              plan: org.plan,
              ownerEmail: org.owner.email,
              propertiesCount: org._count.properties,
              landlordsCount: finalUsers.filter(u => u.role === "LANDLORD").length,
              deepUsers: finalUsers
            }
          };
        });
      } else if (parentType === "organization") {
        // 取得組織下的房東
        const orgId = parentId.replace("org-", "");
        const org = await prisma.organization.findUnique({
          where: { id: orgId },
          include: {
            owner: true,
            members: { include: { user: true } },
            properties: {
              include: {
                contracts: {
                  where: { status: "OCCUPIED" },
                  include: { tenant: true }
                }
              }
            }
          }
        }) as any;
        if (org) {
          // 1. 彙整組織成員
          const memberUsers = org.members.map((m: any) => ({
            id: m.user.id,
            name: m.user.name || m.user.email,
            email: m.user.email,
            role: m.memberRole === "OWNER" ? "LANDLORD" : "MANAGER",
            status: m.user.status,
            relatedEntity: m.memberRole === "OWNER" ? "組織房東" : "物業經理"
          }));

          // 2. 彙整租客
          const tenantUsers = org.properties.flatMap((p: any) => p.contracts.map((c: any) => ({
            id: c.tenant.id,
            name: c.tenant.name,
            email: c.tenant.email,
            role: "TENANT",
            status: c.tenant.status,
            relatedEntity: `${p.address} (${p.roomNumber})`
          })));

          const deepUsersMap = new Map();
          const orgOwner = org.owner;
          if (orgOwner) {
            deepUsersMap.set(orgOwner.id, { id: orgOwner.id, name: orgOwner.name, email: orgOwner.email, role: "LANDLORD", status: orgOwner.status, relatedEntity: "組織擁有者" });
          }
          [...memberUsers, ...tenantUsers].forEach(u => deepUsersMap.set(u.id, u));

          flatData = [{
            id: `landlord-${org.owner.id}`,
            originalId: org.owner.id,
            name: org.owner.name || org.owner.email,
            type: "landlord",
            status: org.owner.status,
            subtitle: "Organization Owner",
            hasChildren: true,
            metadata: {
              orgId: org.id,
              propertiesCount: org.properties.length,
              landlordsCount: memberUsers.filter((m: any) => m.role === "LANDLORD").length || 1,
              deepUsers: Array.from(deepUsersMap.values())
            }
          }];
        }
      } else if (parentType === "landlord") {
        // 取得房東下的房源
        const ownerId = parentId.replace("landlord-", "");
        const properties = await prisma.property.findMany({
          where: {
            organization: { ownerId: ownerId }
          },
          include: {
            contracts: {
              where: { status: "OCCUPIED" },
              include: { tenant: true }
            }
          }
        });

        // 彙整該房東旗下所有房源的租客
        const allTenants = properties.flatMap(p => p.contracts.map(c => ({
          id: c.tenant.id,
          name: c.tenant.name,
          email: c.tenant.email,
          role: "TENANT",
          status: c.tenant.status,
          relatedEntity: `${p.address} (${p.roomNumber})`
        })));

        flatData = properties.map((p: any) => ({
          id: p.id,
          name: `${p.address} (${p.roomNumber})`,
          type: "property",
          status: p.status,
          hasChildren: true,
          metadata: {
            // 房地產層級：僅顯示該房源的租客與經理
            deepUsers: p.contracts.map((c: any) => ({
              id: c.tenant.id,
              name: c.tenant.name,
              email: c.tenant.email,
              role: "TENANT",
              status: c.tenant.status,
              relatedEntity: "房源租客"
            })),
            tenantsCount: p.contracts.length
          }
        }));
      } else if (parentType === "property") {
        // 取得房源下的管理員與租客
        const p = await prisma.property.findUnique({
          where: { id: parentId },
          include: {
            manager: true,
            contracts: {
              where: { status: "OCCUPIED" },
              include: { tenant: true }
            }
          }
        });
        if (p) {
          if (p.manager) {
            flatData.push({
              id: p.manager.id,
              name: p.manager.name,
              type: "manager",
              status: p.manager.status,
              hasChildren: false,
              metadata: { email: p.manager.email }
            });
          }
          p.contracts.forEach((c: any) => {
            flatData.push({
              id: c.tenant.id,
              name: c.tenant.name,
              type: "tenant",
              status: c.tenant.status,
              hasChildren: false,
              metadata: { email: c.tenant.email }
            });
          });
        }
      }

    } else if (role === "MANAGER") {
      if (!parentId) {
        // Manager 初次取得所屬組織 (Nexus Root)
        const orgs = await prisma.organization.findMany({
          where: { properties: { some: { managerId: userId } } },
          include: {
            owner: true,
            members: { include: { user: true } },
            properties: {
              where: { managerId: userId },
              include: {
                contracts: {
                  where: { status: "OCCUPIED" },
                  include: { tenant: true }
                }
              }
            }
          }
        });
        flatData = orgs.map((org: any) => {
          const memberUsers = org.members.map((m: any) => ({
            id: m.user.id,
            name: m.user.name || m.user.email,
            email: m.user.email,
            role: m.memberRole === "OWNER" ? "LANDLORD" : "MANAGER",
            status: m.user.status,
            relatedEntity: "組織成員"
          }));

          const tenantUsers = org.properties.flatMap((p: any) => p.contracts.map((c: any) => ({
            id: c.tenant.id,
            name: c.tenant.name,
            email: c.tenant.email,
            role: "TENANT",
            status: c.tenant.status,
            relatedEntity: `${p.address} (${p.roomNumber})`
          })));

          const deepUsersMap = new Map();
          [{ id: org.owner.id, name: org.owner.name, email: org.owner.email, role: "LANDLORD", status: org.owner.status }, ...memberUsers, ...tenantUsers].forEach(u => deepUsersMap.set(u.id, u));

          return {
            id: `org-${org.id}`,
            originalId: org.id,
            name: org.name,
            type: "organization",
            subtitle: `擁有者: ${org.owner.name || org.owner.email}`,
            status: "ACTIVE",
            hasChildren: true,
            metadata: {
              plan: org.plan,
              deepUsers: Array.from(deepUsersMap.values())
            }
          };
        });
      } else if (parentType === "organization") {
        // 取得組織下的房東 (對於 Manager 而言，就是該組織的 Owner)
        const orgId = parentId.replace("org-", "");
        const org = await prisma.organization.findUnique({
          where: { id: orgId },
          include: {
            owner: true,
            members: { include: { user: true } },
            properties: {
              where: { managerId: userId },
              include: {
                contracts: {
                  where: { status: "OCCUPIED" },
                  include: { tenant: true }
                }
              }
            }
          }
        }) as any;
        if (org) {
          const memberUsers = org.members.map((m: any) => ({
            id: m.user.id,
            name: m.user.name || m.user.email,
            email: m.user.email,
            role: m.memberRole === "OWNER" ? "LANDLORD" : "MANAGER",
            status: m.user.status,
            relatedEntity: "組織成員"
          }));

          const tenantUsers = org.properties.flatMap((p: any) => p.contracts.map((c: any) => ({
            id: c.tenant.id,
            name: c.tenant.name,
            email: c.tenant.email,
            role: "TENANT",
            status: c.tenant.status,
            relatedEntity: `${p.address} (${p.roomNumber})`
          })));

          const deepUsersTotal = [
            { id: org.owner.id, name: org.owner.name, email: org.owner.email, role: "LANDLORD", status: org.owner.status },
            ...memberUsers,
            ...tenantUsers
          ];

          flatData = [{
            id: `landlord-${org.owner.id}`,
            name: org.owner.name || org.owner.email,
            type: "landlord",
            status: org.owner.status,
            subtitle: "Organization Owner",
            hasChildren: true,
            metadata: {
              deepUsers: deepUsersTotal
            }
          }];
        }
      } else if (parentType === "landlord") {
        const ownerId = parentId.replace("landlord-", "");
        const properties = await prisma.property.findMany({
          where: { managerId: userId, organization: { ownerId: ownerId } },
          include: {
            contracts: {
              where: { status: "OCCUPIED" },
              include: { tenant: true }
            }
          }
        });
        flatData = properties.map((p: any) => ({
          id: p.id,
          name: `${p.address} (${p.roomNumber})`,
          type: "property",
          status: p.status,
          hasChildren: true,
          metadata: {
            deepUsers: p.contracts.map((c: any) => ({
              id: c.tenant.id,
              name: c.tenant.name,
              email: c.tenant.email,
              role: "TENANT",
              status: c.tenant.status,
              relatedEntity: "房源租客"
            }))
          }
        }));
      } else if (parentType === "property") {
         const p = await prisma.property.findUnique({
           where: { id: parentId },
           include: { manager: true, contracts: { where: { status: "OCCUPIED" }, include: { tenant: true } } }
         });
         if (p) {
           if (p.manager) flatData.push({ id: p.manager.id, name: p.manager.name, type: "manager", hasChildren: false });
           p.contracts.forEach((c: any) => flatData.push({ id: c.tenant.id, name: c.tenant.name, type: "tenant", hasChildren: false }));
         }
      }

    } else if (role === "LANDLORD") {
      if (!parentId) {
        // Landlord 初次取得所屬組織 (Nexus Root)
        const orgs = await prisma.organization.findMany({
          where: { ownerId: userId },
          include: {
            owner: true,
            members: { include: { user: true } },
            properties: {
              include: {
                contracts: {
                  where: { status: "OCCUPIED" },
                  include: { tenant: true }
                }
              }
            }
          }
        });
        flatData = orgs.map((org: any) => {
          const memberUsers = org.members.map((m: any) => ({
            id: m.user.id,
            name: m.user.name || m.user.email,
            email: m.user.email,
            role: m.memberRole === "OWNER" ? "LANDLORD" : "MANAGER",
            status: m.user.status,
            relatedEntity: m.memberRole === "OWNER" ? "組織房東" : "物業經理"
          }));

          const allTenants = org.properties.flatMap((p: any) => p.contracts.map((c: any) => ({
            id: c.tenant.id,
            name: c.tenant.name,
            email: c.tenant.email,
            role: "TENANT",
            status: c.tenant.status,
            relatedEntity: `${p.address} (${p.roomNumber})`
          })));

          const deepUsersMap = new Map();
          const orgOwner = org.owner;
          deepUsersMap.set(orgOwner.id, { id: orgOwner.id, name: orgOwner.name, email: orgOwner.email, role: "LANDLORD", status: orgOwner.status, relatedEntity: "組織擁有者" });
          [...memberUsers, ...allTenants].forEach(u => deepUsersMap.set(u.id, u));

          return {
            id: `org-${org.id}`,
            originalId: org.id,
            name: org.name,
            type: "organization",
            subtitle: "Your Organization",
            status: "ACTIVE",
            hasChildren: true,
            metadata: {
              plan: org.plan,
              deepUsers: Array.from(deepUsersMap.values())
            }
          };
        });
      } else if (parentType === "organization") {
        // 取得組織下的房東 (即本人)
        const orgId = parentId.replace("org-", "");
        const org = await prisma.organization.findUnique({
          where: { id: orgId, ownerId: userId },
          include: {
            owner: true,
            properties: {
              include: {
                contracts: {
                  where: { status: "OCCUPIED" },
                  include: { tenant: true }
                }
              }
            }
          }
        });
        if (org) {
          const allTenants = org.properties.flatMap(p => p.contracts.map(c => ({
            id: c.tenant.id,
            name: c.tenant.name,
            email: c.tenant.email,
            role: "TENANT",
            status: c.tenant.status,
            relatedEntity: `${p.address} (${p.roomNumber})`
          })));

          flatData = [{
            id: `landlord-${org.owner.id}`,
            name: org.owner.name || org.owner.email,
            type: "landlord",
            status: org.owner.status,
            subtitle: "You (Landlord)",
            hasChildren: true,
            metadata: {
              deepUsers: [
                { id: org.owner.id, name: org.owner.name, email: org.owner.email, role: "LANDLORD", status: org.owner.status },
                ...allTenants
              ]
            }
          }];
        }
      } else if (parentType === "landlord") {
        // 取得房東下的房源
        const ownerId = parentId.replace("landlord-", "");
        if (ownerId === userId) {
          const properties = await prisma.property.findMany({
            where: { organization: { ownerId: userId } },
            include: {
              contracts: {
                where: { status: "OCCUPIED" },
                include: { tenant: true }
              }
            }
          });
          flatData = properties.map((p: any) => ({
            id: p.id,
            name: `${p.address} (${p.roomNumber})`,
            type: "property",
            status: p.status,
            hasChildren: true,
            metadata: {
              deepUsers: p.contracts.map((c: any) => ({
                id: c.tenant.id,
                name: c.tenant.name,
                email: c.tenant.email,
                role: "TENANT",
                status: c.tenant.status,
                relatedEntity: "房源租客"
              }))
            }
          }));
        }
      } else if (parentType === "property") {
        const p = await prisma.property.findUnique({
          where: { id: parentId },
          include: { manager: true, contracts: { where: { status: "OCCUPIED" }, include: { tenant: true } } }
        });
        if (p) {
          if (p.manager) flatData.push({ id: p.manager.id, name: p.manager.name, type: "manager", hasChildren: false });
          p.contracts.forEach((c: any) => flatData.push({ id: c.tenant.id, name: c.tenant.name, type: "tenant", hasChildren: false }));
        }
      }
    }

    return NextResponse.json(flatData);
  } catch (error) {
    console.error("[Management API Error]:", error);
    return NextResponse.json({ error: "伺服器內部錯誤" }, { status: 500 });
  }
}