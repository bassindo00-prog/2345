import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserSettingsForm } from "@/components/UserSettingsForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UserSettingsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-gray-400">Manage your profile and security preferences.</p>
      </div>

      <div className="glass-card p-8">
        <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
        <UserSettingsForm user={user} />
      </div>
    </div>
  );
}
