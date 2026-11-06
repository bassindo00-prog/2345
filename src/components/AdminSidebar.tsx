"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, Music, CheckCircle, BarChart, Activity,
  DollarSign, Settings, LayoutDashboard, Menu, X, Mail, Library, BookOpen, Disc, Globe, Upload, CloudLightning
} from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

const links = [
  { name: "Overview",           href: "/admin",            icon: LayoutDashboard },
  { name: "Streaming Analytics", href: "/admin/streaming",  icon: Activity },
  { name: "Website CMS",        href: "/admin/website-cms", icon: Globe },
  { name: "Gerbang R2",         href: "/admin/r2-gate", icon: CloudLightning },
  { name: "Katalog Musik", href: "/admin/catalog", icon: Library },
  { name: "Publisher Catalog", href: "/admin/publisher-catalog", icon: BookOpen },
  { name: "Message Center", href: "/admin/messages", icon: Mail },
  { name: "Identity Verif", href: "/admin/registrations", icon: CheckCircle },
  { name: "Music Review", href: "/admin/releases", icon: CheckCircle },
  { name: "My Releases", href: "/admin/my-releases", icon: Music },
  { name: "Existing Release", href: "/admin/existing-releases", icon: Disc },
  { name: "Artists", href: "/admin/all-artists", icon: Users },
  { name: "Import Streaming", href: "/admin/import-streaming", icon: Upload },
  { name: "Royalties", href: "/admin/royalties", icon: DollarSign },
  { name: "Royalty Per Song", href: "/admin/royalty-per-song", icon: DollarSign },
  { name: "Withdrawals", href: "/admin/withdrawals", icon: DollarSign },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart },
  { name: "Settings", href: "/admin/settings", icon: Settings },
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

export function AdminSidebar({ artists = [], brandLogo = "/logo.png" }: { artists?: any[], brandLogo?: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#2a1b38]/90 backdrop-blur-xl border-b border-white/15 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2.5">
          <img src={brandLogo} alt="Breakout Logo" className="w-8 h-8 object-contain" />
          <span className="font-extrabold tracking-wider text-white text-base">BREAKOUT</span>
          <span className="px-2 py-0.5 rounded-full bg-[#c8f560] text-[#1a1024] text-[10px] font-bold">ADMIN</span>
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
          <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
            <img src={brandLogo} alt="Breakout Logo" className="w-8 h-8 object-contain" />
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-wider text-white">BREAKOUT</span>
              <span className="text-[10px] text-[#c8f560] font-semibold tracking-widest uppercase">Admin Panel</span>
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
          {links.map((link) => {
            const Icon = link.icon;
            
            if (link.subLinks) {
              const isActive = link.subLinks.some(sub => pathname === sub.href) || pathname === link.href;
              const [isExpanded, setIsExpanded] = useState(isActive);
              
              return (
                <div key={link.name} className="flex flex-col gap-1">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`flex items-center justify-between px-3.5 py-2.5 font-medium text-xs rounded-xl transition-all duration-200 ${
                      isActive 
                        ? "bg-[#c8f560] text-[#1a1024] font-bold shadow-lg shadow-[#c8f560]/20" 
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${isActive ? 'text-[#1a1024]' : 'text-[#c8f560]'} p-1 rounded-lg`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {link.name}
                    </div>
                    <svg className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  {isExpanded && (
                    <div className="flex flex-col pl-10 pr-2 py-1 gap-1">
                      {link.subLinks.map(sub => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={() => setIsOpen(false)}
                          className={`py-1.5 px-2 rounded-lg text-xs transition-colors ${pathname === sub.href ? "bg-white/15 text-[#c8f560] font-bold" : "text-white/60 hover:text-white"}`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

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

        <div className="p-4 border-t border-white/10">
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}
