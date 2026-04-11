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
          include: { owner: true }
        });
        flatData = organizations.map((org: any) => ({
          id: `org-${org.id}`,
          originalId: org.id,
          name: org.name,
          type: "organization",
          subtitle: `Owner: ${org.owner.name || org.owner.email}`,
          status: "ACTIVE",
          hasChildren: true,
          metadata: { plan: org.plan, ownerEmail: org.owner.email }
        }));
      } else if (parentType === "organization") {
        // 取得組織下的房東
        const orgId = parentId.replace("org-", "");
        const org = await prisma.organization.findUnique({
          where: { id: orgId },
          include: { owner: true }
        });
        if (org) {
          flatData = [{
            id: `landlord-${org.owner.id}`,
            originalId: org.owner.id,
            name: org.owner.name || org.owner.email,
            type: "landlord",
            status: org.owner.status,
            subtitle: "Organization Owner",
            hasChildren: true,
            metadata: { orgId: org.id }
          }];
        }
      } else if (parentType === "landlord") {
        // 取得房東下的房源
        const ownerId = parentId.replace("landlord-", "");
        const properties = await prisma.property.findMany({
          where: {
            organization: { ownerId: ownerId }
          }
        });
        flatData = properties.map((p: any) => ({
          id: p.id,
          name: `${p.address} (${p.roomNumber})`,
          type: "property",
          status: p.status,
          hasChildren: true
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
        // Manager 初次取得所屬房東(透過房源)
        const managedProperties = await prisma.property.findMany({
          where: { managerId: userId },
          include: { organization: { include: { owner: true } } }
        });
        const landlordMap = new Map();
        managedProperties.forEach((p: any) => {
          const owner = p.organization.owner;
          if (!landlordMap.has(owner.id)) {
            landlordMap.set(owner.id, {
              id: `landlord-${owner.id}`,
              name: owner.name || owner.email,
              type: "landlord",
              subtitle: p.organization.name,
              hasChildren: true
            });
          }
        });
        flatData = Array.from(landlordMap.values());
      } else if (parentType === "landlord") {
        const ownerId = parentId.replace("landlord-", "");
        const properties = await prisma.property.findMany({
          where: { managerId: userId, organization: { ownerId: ownerId } }
        });
        flatData = properties.map((p: any) => ({
          id: p.id,
          name: `${p.address} (${p.roomNumber})`,
          type: "property",
          status: p.status,
          hasChildren: true
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
        // Landlord 初次取得旗下房源
        const orgs = await prisma.organization.findMany({
          where: { ownerId: userId },
          include: { properties: true }
        });
        flatData = orgs.flatMap((org: any) => org.properties.map((p: any) => ({
          id: `property-${p.id}`,
          name: `${p.address} (${p.roomNumber})`,
          subtitle: org.name,
          type: "property",
          status: p.status,
          hasChildren: true,
          metadata: { orgName: org.name }
        })));
      } else if (parentType === "property") {
        const propId = parentId.replace("property-", "");
        const p = await prisma.property.findUnique({
          where: { id: propId },
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