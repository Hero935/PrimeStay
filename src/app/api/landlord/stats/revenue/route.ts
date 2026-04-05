import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

/**
 * 獲取最近 6 個月的營收統計數據
 * 僅計算已完成 (COMPLETED) 的帳單金額
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role === "TENANT") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  const orgId = (session.user as any).organizationId;

  // 權限過濾：Manager 僅能看到自己管轄的房源營收，Landlord 看到整個組織
  const propertyFilter = (role as string) === "MANAGER" ? { managerId: userId } : { organizationId: orgId };

  try {
    const lastSixMonths = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      lastSixMonths.push({
        start: startOfMonth(monthDate),
        end: endOfMonth(monthDate),
        label: format(monthDate, "MMM"),
      });
    }

    const stats = await Promise.all(
      lastSixMonths.map(async (month) => {
        const result = await prisma.billing.aggregate({
          where: {
            status: "COMPLETED",
            periodEnd: {
              gte: month.start,
              lte: month.end,
            },
            contract: {
              property: propertyFilter,
            },
          },
          _sum: {
            totalAmount: true,
          },
        });

        return {
          month: month.label,
          amount: result._sum.totalAmount ? Number(result._sum.totalAmount) : 0,
        };
      })
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[REVENUE_STATS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}