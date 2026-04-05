import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * 驗證邀請碼 API
 * GET /api/invitations/verify/[code]
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code: rawCode } = await params;
    const code = rawCode.toUpperCase();

    const invitation = await prisma.invitation.findUnique({
      where: { code },
      include: {
        organization: {
          select: { name: true }
        },
        property: {
          select: { address: true, roomNumber: true }
        }
      }
    });

    if (!invitation) {
      return NextResponse.json({ error: "邀請碼無效" }, { status: 404 });
    }

    if (invitation.isUsed) {
      return NextResponse.json({ error: "邀請碼已被使用" }, { status: 400 });
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: "邀請碼已逾期" }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      role: invitation.targetRole,
      organizationName: invitation.organization?.name || null,
      propertyAddress: invitation.property
        ? `${invitation.property.address} - ${invitation.property.roomNumber}`
        : null
    });

  } catch (error) {
    console.error("驗證邀請碼錯誤:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}