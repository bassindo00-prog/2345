"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginClient({ bgUrl }: { bgUrl: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await loginAction(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        const targetUrl = res?.role === "ADMIN" ? "/admin" : "/dashboard";
        window.location.href = targetUrl;
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat masuk. Silakan coba lagi.");
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[100dvh] w-full flex items-center justify-center p-4 overflow-hidden">
      <div className="fixed inset-0 -z-20" style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />
      <div className="fixed inset-0 bg-black/30 -z-10" />

      {/* Glass Card - transparent like real glass, no blur */}
      <div className="relative z-10 w-full max-w-[390px] sm:max-w-[430px] rounded-[32px] p-7 sm:p-10 flex flex-col my-8"

      >
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-6 mt-2">
          <h1 className="font-extrabold text-white text-2xl sm:text-3xl tracking-widest uppercase text-center drop-shadow-lg">
            BREAKOUT<br/>
            <span className="text-white/80 text-lg sm:text-xl mt-1 block tracking-[0.3em]">MUSIC RECORD</span>
          </h1>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-red-500/20 border border-red-400/40 text-red-100 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/90 ml-1">Email address</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-2xl px-4 py-3.5 text-white text-sm outline-none transition-all"
      
              onFocus={e => { e.target.style.background = "rgba(255,255,255,0.2)"; e.target.style.borderColor = "#C77DFF"; }}
              onBlur={e => { e.target.style.background = "rgba(255,255,255,0.12)"; e.target.style.borderColor = "rgba(255,255,255,0.3)"; }}
              placeholder=""
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/90 ml-1">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-2xl px-4 py-3.5 text-white text-sm outline-none transition-all"
      
              onFocus={e => { e.target.style.background = "rgba(255,255,255,0.2)"; e.target.style.borderColor = "#C77DFF"; }}
              onBlur={e => { e.target.style.background = "rgba(255,255,255,0.12)"; e.target.style.borderColor = "rgba(255,255,255,0.3)"; }}
              placeholder=""
            />
          </div>

          <div className="flex justify-start">
            <Link
              href="#"
              onClick={(e) => { e.preventDefault(); alert("Silakan hubungi Admin untuk reset password."); }}
              className="text-xs text-white/60 hover:text-white transition ml-1"
            >
              Forget Password ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-gradient-to-b from-[#A370F7] via-[#8B44F7] to-[#7322EA] hover:from-[#B184F9] hover:to-[#7E33ED] text-white font-bold text-base py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(139,68,247,0.5)] border border-white/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-white/80">
          Are You New Member?{" "}
          <Link href="/register" className="font-extrabold text-white hover:text-[#C77DFF] transition ml-1">
            Sign UP
          </Link>
        </div>
      </div>
    </main>
  );
}



