export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isMaintenanceActive } from "@/lib/maintenance";
import { MaintenancePoller } from "@/components/MaintenancePoller";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // @ts-ignore
  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  // @ts-ignore
  if (session.user.status === "SUSPENDED") {
    redirect("/dashboard/pending");
  }

  // Check Maintenance Mode
  const active = await isMaintenanceActive();
  if (active) {
    redirect("/maintenance");
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden theme-bg-purple text-white">
      <MaintenancePoller />
      {children}
    </div>
  );
}
