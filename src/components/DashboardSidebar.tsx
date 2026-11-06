"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Music, User, UploadCloud, Disc, BarChart2, LineChart, Activity,
  DollarSign, CreditCard, Bell, Settings, LogOut, Menu, X, Mail, Library, FileText, BookOpen
} from "lucide-react";
import { signOut } from "next-auth/react";

const links = [
  { name: "Dasbor",                href: "/dashboard",            icon: BarChart2  },
  { name: "Analytics Streaming",   href: "/dashboard/streaming",  icon: Activity   },
  { name: "Analytics",             href: "/dashboard/analytics",  icon: LineChart  },
  { name: "Inbox", href: "/dashboard/inbox", icon: Mail },
  { name: "Katalog Musik", href: "/dashboard/catalog", icon: Library },
  { name: "Publisher Catalog", href: "/dashboard/publisher-catalog", icon: BookOpen },
  { name: "Katalog Damarlangit", href: "/dashboard/katalog-damarlangit", icon: BookOpen },
  { name: "Upload Music", href: "/dashboard/upload", icon: UploadCloud },
  { name: "My Releases", href: "/dashboard/releases", icon: Disc },
  { name: "MyLink", href: "/dashboard/mylink", icon: Music },
  { name: "Royalties", href: "/dashboard/royalties", icon: DollarSign },
  { name: "Royalty Per Song", href: "/dashboard/royalty-per-song", icon: DollarSign },
  { name: "Withdraw", href: "/dashboard/withdraw", icon: CreditCard },
  { name: "Kontrak Saya", href: "/dashboard/contracts", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

// macOS Dock-style wave effect: returns scale based on distance from hovered index
function getScale(hoveredIndex: number | null, currentIndex: number): number {
  if (hoveredIndex === null) return 1;
  const distance = Math.abs(hoveredIndex - currentIndex);
  if (distance === 0) return 1.12;
  if (distance === 1) return 1.06;
  if (distance === 2) return 1.02;
  return 1;
}

export function DashboardSidebar({ 
  brandLogo = "/logo.png",
  enableRph = true,
  enableKhana = true,
  enableHalo = true
}: { 
  brandLogo?: string;
  enableRph?: boolean;
  enableKhana?: boolean;
  enableHalo?: boolean;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const filteredLinks = links;

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#2a1b38]/90 backdrop-blur-xl border-b border-white/15 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2.5">
          <img src={brandLogo} alt="Breakout Logo" className="w-8 h-8 object-contain" />
          <span className="font-extrabold tracking-wider text-white text-base">BREAKOUT</span>
          <span className="px-2 py-0.5 rounded-full bg-[#c8f560] text-[#1a1024] text-[10px] font-bold">ARTIST</span>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 text-white/80 hover:text-white focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`w-64 bg-[#231730]/95 backdrop-blur-2xl flex flex-col h-full fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out border-r border-white/15 shadow-2xl
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="h-24 flex items-center justify-between px-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
            <img src={brandLogo} alt="Breakout Logo" className="w-8 h-8 object-contain" />
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-wider text-white">BREAKOUT</span>
              <span className="text-[10px] text-[#c8f560] font-semibold tracking-widest uppercase">Artist Suite</span>
            </div>
          </Link>
          <button 
            className="md:hidden text-white/60 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-1.5 scrollbar-thin">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 font-medium text-xs rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-[#c8f560] text-[#1a1024] font-bold shadow-lg shadow-[#c8f560]/20" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className={`${isActive ? 'text-[#1a1024]' : 'text-[#c8f560]'} p-1 rounded-lg`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/10 flex justify-center">
          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-red-500/20 hover:text-red-300 border border-white/15 transition w-full shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
}
