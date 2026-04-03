import { DashboardShell } from "@/components/layout/DashboardShell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * 房客後台佈局
 * 套用通用 DashboardShell (行動端優先)
 */
export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "TENANT") {
    redirect("/landlord");
  }

  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}