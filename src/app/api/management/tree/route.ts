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
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "未經授權" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  try {
    let flatData: FlatManagementNode[] = [];

    if (role === "ADMIN") {
      /**
       * AIC v3: Admin 視圖從組織層級切入 (Nexus 模式)
       */
      const organizations = await prisma.organization.findMany({
        include: {
          owner: true,
          properties: {
            include: {
              manager: true,
              contracts: {
                where: { status: "OCCUPIED" },
                include: { tenant: true }
              }
            }
          }
        }
      });

      flatData = organizations.map((org: any) => ({
        id: `org-${org.id}`,
        name: org.name,
        type: "organization",
        subtitle: `Owner: ${org.owner.name || org.owner.email}`,
        status: "ACTIVE", // 組織目前無狀態位，預設 ACTIVE
        metadata: { plan: org.plan, ownerEmail: org.owner.email },
        children: [
          // 房東節點 (Root 之下第一層)
          {
            id: `landlord-${org.owner.id}`,
            name: org.owner.name || org.owner.email,
            type: "landlord",
            status: org.owner.status,
            subtitle: "Organization Owner",
            children: org.properties.map((p: any) => ({
              id: p.id,
              name: `${p.address} (${p.roomNumber})`,
              type: "property",
              status: p.status,
              children: [
                ...(p.manager ? [{
                  id: p.manager.id,
                  name: p.manager.name,
                  type: "manager",
                  status: p.manager.status,
                  metadata: { email: p.manager.email }
                }] : []),
                ...p.contracts.map((c: any) => ({
                  id: c.tenant.id,
                  name: c.tenant.name,
                  type: "tenant",
                  status: c.tenant.status,
                  metadata: { email: c.tenant.email }
                }))
              ]
            }))
          }
        ]
      }));

    } else if (role === "MANAGER") {
      const managedProperties = await prisma.property.findMany({
        where: { managerId: userId },
        include: {
          manager: true,
          contracts: {
            where: { status: "OCCUPIED" },
            include: { tenant: true }
          },
          organization: {
            include: { owner: true }
          }
        }
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
            metadata: { email: owner.email, orgName: p.organization.name },
            children: []
          });
        }
        landlordMap.get(owner.id).children.push({
          id: p.id,
          name: `${p.address} (${p.roomNumber})`,
          type: "property",
          status: p.status,
          children: [
            ...(p.manager ? [{ id: p.manager.id, name: p.manager.name, type: "manager", metadata: { email: p.manager.email } }] : []),
            ...p.contracts.map((c: any) => ({ id: c.tenant.id, name: c.tenant.name, type: "tenant", metadata: { email: c.tenant.email } }))
          ]
        });
      });
      flatData = Array.from(landlordMap.values());

    } else if (role === "LANDLORD") {
      const orgs = await prisma.organization.findMany({
        where: { ownerId: userId },
        include: {
          properties: {
            include: {
              manager: true,
              contracts: {
                where: { status: "OCCUPIED" },
                include: { tenant: true }
              }
            }
          }
        }
      });

      flatData = orgs.flatMap(org => 
        org.properties.map((p: any) => ({
          id: `property-${p.id}`,
          name: `${p.address} (${p.roomNumber})`,
          subtitle: org.name,
          type: "property",
          status: p.status,
          metadata: { orgName: org.name },
          children: [
            ...(p.manager ? [{ id: p.manager.id, name: p.manager.name, type: "manager", metadata: { email: p.manager.email } }] : []),
            ...p.contracts.map((c: any) => ({ id: c.tenant.id, name: c.tenant.name, type: "tenant", metadata: { email: c.tenant.email } }))
          ]
        }))
      );
    }

    return NextResponse.json(flatData);
  } catch (error) {
    console.error("[Management API Error]:", error);
    return NextResponse.json({ error: "伺服器內部錯誤" }, { status: 500 });
  }
}