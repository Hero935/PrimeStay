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
  diagnostics?: {
    utilization: number;
    latency: number;
    insights: string;
    fixable: boolean;
    history: number[];
  };
  children?: any[]; 
}

/**
 * 核心診斷邏輯：根據實體數據計算 DNA 指標
 */
async function getDiagnosticDNA(type: string, id: string, orgId?: string) {
  // 1. 利用率計算 (Utilization)
  let utilization = 0;
  let pendingMaintenanceCount = 0;

  if (type === "organization") {
    const stats = await prisma.organization.findUnique({
      where: { id },
      select: {
        _count: {
          select: { properties: true }
        },
        properties: {
          select: {
            contracts: {
              where: { status: "OCCUPIED" }
            }
          }
        }
      }
    });
    
    const totalProperties = stats?._count.properties || 0;
    const occupiedProperties = stats?.properties.filter(p => p.contracts.length > 0).length || 0;
    utilization = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;
    
    // 取得所有維修單數量作為延遲參考
    pendingMaintenanceCount = await prisma.maintenance.count({
      where: { contract: { property: { organizationId: id } }, status: "PENDING" }
    });

  } else if (type === "property") {
    const p = await prisma.property.findUnique({
      where: { id },
      include: { contracts: { where: { status: "OCCUPIED" } } }
    });
    utilization = p?.contracts.length ? 100 : 0;
    
    pendingMaintenanceCount = await prisma.maintenance.count({
      where: { contract: { propertyId: id }, status: "PENDING" }
    });
  } else {
    // Landlord 或其他角色採隨機與 ID 對插值，模擬連貫性
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    utilization = 70 + (seed % 25);
    pendingMaintenanceCount = seed % 5;
  }

  // 2. 延遲感官 (Latency) - 基於維修積壓與隨機抖動
  const latency = parseFloat((0.2 + (pendingMaintenanceCount * 0.05) + (Math.random() * 0.1)).toFixed(2));

  // 3. 診斷洞察 (Insights) - 中文化實作
  let insights = "基礎架構負載穩定。建議根據子實體增長狀況維持現狀。";
  let fixable = false;

  if (utilization < 70) {
    insights = "診斷警告：檢測到房源閒置率過高。建議重新評估租金策略或增強行銷。";
    fixable = true;
  } else if (pendingMaintenanceCount > 3) {
    insights = "營運警報：報修事項積壓過多，系統反應時間下降。建議立即指派管理員處理。";
    fixable = true;
  } else if (utilization > 95) {
    insights = "效能巔峰：所有房源已滿載使用。建議考慮擴展新的房產投資組合。";
    fixable = false;
  }

  // 4. DNA 歷史波形 (History) - 基於 ID 生成穩定的偽隨機序列
  const history = Array.from({ length: 15 }, (_, i) => {
    const base = utilization + (Math.sin(i + id.length) * 15);
    return Math.min(Math.max(Math.round(base), 10), 100);
  });

  return {
    utilization: parseFloat(utilization.toFixed(1)),
    latency,
    insights,
    fixable,
    history
  };
}

/**
 * GET /api/management/tree
 * 根據角色取得扁平化管理清單
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get("parentId");
  const parentType = searchParams.get("parentType");
  const targetId = searchParams.get("id"); // 單一節點查詢支援
  const targetType = searchParams.get("type");

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "未經授權" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  try {
    let flatData: any[] = [];

    // 支援單一節點精確查詢 (掃描刷新用)
    if (targetId && targetType) {
      const dna = await getDiagnosticDNA(targetType, targetId);
      return NextResponse.json({
        id: targetId,
        type: targetType,
        diagnostics: dna
      });
    }

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
        
        flatData = await Promise.all(organizations.map(async (org: any) => {
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
            diagnostics: await getDiagnosticDNA("organization", org.id),
            metadata: {
              plan: org.plan,
              ownerEmail: org.owner.email,
              propertiesCount: org._count.properties,
              landlordsCount: finalUsers.filter(u => u.role === "LANDLORD").length,
              deepUsers: finalUsers
            }
          };
        }));
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
            diagnostics: await getDiagnosticDNA("landlord", org.owner.id, org.id),
            metadata: {
              orgId: org.id,
              plan: org.plan,
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

        // 需包含組織計畫資訊
        const ownerOrg = await prisma.organization.findFirst({
           where: { ownerId: ownerId },
           select: { plan: true }
        });

        flatData = await Promise.all(properties.map(async (p: any) => ({
          id: p.id,
          name: `${p.address} (${p.roomNumber})`,
          type: "property",
          status: p.status,
          hasChildren: true,
          diagnostics: await getDiagnosticDNA("property", p.id),
          metadata: {
            plan: ownerOrg?.plan,
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
        })));
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
        }) as any;
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
        flatData = await Promise.all(orgs.map(async (org: any) => {
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
            diagnostics: await getDiagnosticDNA("organization", org.id),
            metadata: {
              plan: org.plan,
              deepUsers: Array.from(deepUsersMap.values())
            }
          };
        }));
      } else if (parentType === "organization") {
        // 取得組織下的房東
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
            diagnostics: await getDiagnosticDNA("landlord", org.owner.id, org.id),
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
        flatData = await Promise.all(properties.map(async (p: any) => ({
          id: p.id,
          name: `${p.address} (${p.roomNumber})`,
          type: "property",
          status: p.status,
          hasChildren: true,
          diagnostics: await getDiagnosticDNA("property", p.id),
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
        })));
      } else if (parentType === "property") {
         const p = await prisma.property.findUnique({
           where: { id: parentId },
           include: { manager: true, contracts: { where: { status: "OCCUPIED" }, include: { tenant: true } } }
         }) as any;
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
        flatData = await Promise.all(orgs.map(async (org: any) => {
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
            diagnostics: await getDiagnosticDNA("organization", org.id),
            metadata: {
              plan: org.plan,
              deepUsers: Array.from(deepUsersMap.values())
            }
          };
        }));
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
          const diagnostics = await getDiagnosticDNA("organization", org.id);
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
            diagnostics,
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
          flatData = await Promise.all(properties.map(async (p: any) => ({
            id: p.id,
            name: `${p.address} (${p.roomNumber})`,
            type: "property",
            status: p.status,
            hasChildren: true,
            diagnostics: await getDiagnosticDNA("property", p.id),
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
          })));
        }
      } else if (parentType === "property") {
        const p = await prisma.property.findUnique({
          where: { id: parentId },
          include: { manager: true, contracts: { where: { status: "OCCUPIED" }, include: { tenant: true } } }
        }) as any;
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