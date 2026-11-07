import { auth } from "@/auth";
import { LogOut, ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

export default async function PendingPage() {
  const session = await auth();

  // @ts-ignore
  if (session?.user?.status === 'APPROVED') {
    redirect("/dashboard");
  }

  // @ts-ignore
  const isSuspended = session?.user?.status === "SUSPENDED";

  return (
    <div className="min-h-screen bg-[#1b1226] text-white flex flex-col items-center justify-center p-6">
      <div className="p-8 sm:p-10 rounded-3xl max-w-md w-full text-center border border-white/15 bg-white/5 backdrop-blur-md shadow-2xl space-y-4">
        {isSuspended ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-600/20 text-red-400 mx-auto flex items-center justify-center border border-red-500/40 shadow-lg">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-red-400">Akun Ditangguhkan (Suspended)</h1>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Akun musisi Anda telah dinonaktifkan (di-suspend) oleh manajemen BREAKOUT. Seluruh hak akses dashboard telah dibekukan sementara.
            </p>
            <p className="text-[11px] text-white/50">
              Silakan hubungi pihak admin / manajemen Breakout Record jika Anda merasa ini adalah sebuah kekeliruan.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-yellow-400">Pendaftaran Menunggu Persetujuan</h1>
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
              Pendaftaran akun musisi Anda telah kami terima dan sedang dalam proses verifikasi oleh tim Admin. Anda akan dapat mengakses dashboard segera setelah akun disetujui (ACC).
            </p>
          </>
        )}
        <div className="pt-4 border-t border-white/10 flex justify-center">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
