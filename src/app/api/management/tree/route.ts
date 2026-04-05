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
  type: "landlord" | "property" | "organization";
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
      const landlords = await prisma.user.findMany({
        where: { systemRole: "LANDLORD" },
        include: {
          organizations: { take: 1 },
          userOrganizations: {
            include: {
              organization: {
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
              }
            }
          }
        }
      });

      flatData = landlords.map(u => ({
        id: `landlord-${u.id}`,
        name: u.name || u.email,
        type: "landlord",
        status: u.status,
        subtitle: u.organizations[0]?.name || "個人房東",
        metadata: { email: u.email, orgName: u.organizations[0]?.name },
        children: u.userOrganizations[0]?.organization.properties.map((p: any) => ({
          id: p.id,
          name: `${p.address} (${p.roomNumber})`,
          type: "property",
          status: p.status,
          children: [
            ...(p.manager ? [{ id: p.manager.id, name: p.manager.name, type: "manager", metadata: { email: p.manager.email } }] : []),
            ...p.contracts.map((c: any) => ({ id: c.tenant.id, name: c.tenant.name, type: "tenant", metadata: { email: c.tenant.email } }))
          ]
        }))
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