import { DashboardShell } from "@/components/layout/DashboardShell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * 房東/代管後台佈局
 * 套用通用 DashboardShell
 */
export default async function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role === "TENANT") {
    redirect("/tenant");
  }

  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}