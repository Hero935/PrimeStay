import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/**
 * GET /api/landlord/organization
 * 獲取房東擁有的組織資訊
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "LANDLORD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const userId = (session.user as any).id;
    const organization = await prisma.organization.findFirst({
      where: { ownerId: userId },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({ data: organization });
  } catch (error) {
    console.error("[Landlord Organization GET] 失敗:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PATCH /api/landlord/organization
 * 更新組織資訊 (名稱, Logo, 電話, Email)
 */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "LANDLORD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const userId = (session.user as any).id;
    const body = await req.json();
    const { name, logoUrl, phone, email } = body;

    const organization = await prisma.organization.findFirst({
      where: { ownerId: userId },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: organization.id },
      data: {
        name: name || organization.name,
        logoUrl: logoUrl !== undefined ? logoUrl : (organization as any).logoUrl,
        phone: phone !== undefined ? phone : (organization as any).phone,
        email: email !== undefined ? email : (organization as any).email,
      },
    });

    // 記錄 Audit Log
    await prisma.auditLog.create({
      data: {
        userId: userId,
        organizationId: organization.id,
        action: "UPDATE_ORGANIZATION",
        targetType: "ORGANIZATION",
        targetId: organization.id,
        metadata: { updatedFields: body },
      },
    });

    return NextResponse.json({ success: true, data: updatedOrg });
  } catch (error) {
    console.error("[Landlord Organization PATCH] 失敗:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}