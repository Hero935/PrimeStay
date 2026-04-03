import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/**
 * 更新單一維修單狀態與回覆
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== "LANDLORD" && (session.user as any).role !== "MANAGER")) {
      return NextResponse.json({ error: "只有房東或代管可以更新維修狀態" }, { status: 403 });
    }

    const { status, landlordReply } = await req.json();

    const updated = await prisma.maintenance.update({
      where: { id: params.id },
      data: {
        status,
        landlordReply,
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("更新維修單失敗:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}