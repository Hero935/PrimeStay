import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/management/search?q=...
 * 全域快速搜尋
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "未經授權" }, { status: 401 });
  }

  try {
    // 同時搜尋組織、房源與使用者
    const [orgs, props, users] = await Promise.all([
      prisma.organization.findMany({
        where: { name: { contains: query, mode: "insensitive" } },
        take: 5
      }),
      prisma.property.findMany({
        where: { 
          OR: [
            { address: { contains: query, mode: "insensitive" } },
            { roomNumber: { contains: query, mode: "insensitive" } }
          ]
        },
        take: 5
      }),
      prisma.user.findMany({
        where: { 
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } }
          ]
        },
        take: 5
      })
    ]);

    const results = [
      ...orgs.map(o => ({ id: `org-${o.id}`, name: o.name, type: "organization", subtitle: "Organization" })),
      ...props.map(p => ({ id: p.id, name: `${p.address} (${p.roomNumber})`, type: "property", subtitle: "Property" })),
      ...users.map(u => ({ id: u.id, name: u.name || u.email, type: u.systemRole.toLowerCase(), subtitle: u.systemRole }))
    ];

    return NextResponse.json(results);
  } catch (error) {
    console.error("[Search API Error]:", error);
    return NextResponse.json({ error: "搜尋失敗" }, { status: 500 });
  }
}