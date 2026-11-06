"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/me", { method: "DELETE" });
    } catch (e) {}
    try {
      await signOut({ callbackUrl: "/login", redirect: false });
    } catch (e) {}
    window.location.href = "/login";
  };

  return (
    <button 
      onClick={handleLogout}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-500/10 text-red-500 font-semibold hover:bg-red-500/20 transition cursor-pointer"
    >
      <LogOut className="w-5 h-5" />
      Log Out
    </button>
  );
}
