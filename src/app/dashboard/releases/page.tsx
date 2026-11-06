import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Disc, Plus } from "lucide-react";
import Link from "next/link";
import UserReleasesClient from "./UserReleasesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MyReleasesPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return (
      <div className="p-10 text-center">
        <h2>Harap login terlebih dahulu</h2>
      </div>
    );
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      artists: {
        include: {
          releases: {
            orderBy: { createdAt: "desc" },
            include: { tracks: true, artist: true }
          }
        }
      }
    }
  });

  const rawReleases = (user?.artists?.flatMap(a => a.releases || []) || []).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const releases = rawReleases.map((r) => ({
    id: r.id,
    title: r.title,
    genre: r.genre,
    type: r.type,
    status: r.status,
    coverArtworkUrl: r.coverArtworkUrl,
    releaseDate: r.releaseDate instanceof Date ? r.releaseDate.toISOString() : String(r.releaseDate),
    upc: r.upc || null,
    tracks: (r.tracks || []).map((t) => ({
      id: t.id,
      title: t.title,
      audioUrl: t.audioUrl,
      isrc: t.isrc || null,
      composer: t.composer || null,
      producer: t.producer || null,
      lyrics: t.lyrics || null,
      featuredArtist: t.featuredArtist || null,
    })),
    artist: r.artist ? { name: r.artist.stageName } : null,
  }));

  const artistName = user?.artists?.[0]?.stageName || user?.name || "Artist";

  return (
    <div className="animate-fade-in w-full pb-10 px-4 md:px-0 text-white">
      <div className="mb-6 md:mb-8 p-6 md:p-8 rounded-3xl shadow-xl border border-white/15 bg-gradient-to-br from-[#3b274e] via-[#2f1f40] to-[#1e132b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Katalog Rilisan Musik Saya</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#c8f560] text-[#1a1024] text-[10px] font-black uppercase">Live</span>
          </div>
          <p className="text-white/70 text-xs sm:text-sm font-medium mt-1">{releases.length} rilis terdaftar di sistem</p>
        </div>
        <Link href="/dashboard/upload" className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#c8f560] hover:bg-[#d6ff73] text-[#1a1024] font-bold text-xs shadow-lg shadow-[#c8f560]/20 transition flex items-center justify-center gap-2 active:scale-95">
          <Plus className="w-4 h-4" /> <span>Upload Lagu Baru</span>
        </Link>
      </div>

      {releases.length === 0 ? (
        <div className="rounded-3xl border border-white/15 p-10 md:p-16 flex flex-col items-center justify-center text-center shadow-xl bg-gradient-to-br from-[#3b274e] to-[#1e132b] text-white">
          <Disc className="w-16 h-16 text-white/30 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Belum Ada Rilis Musik</h2>
          <p className="text-white/60 mb-6 max-w-md text-xs sm:text-sm">Anda belum mengunggah lagu. Mulai rilis karya musik pertama Anda sekarang ke 150+ platform digital.</p>
          <Link href="/dashboard/upload" className="px-6 py-3 rounded-2xl bg-[#c8f560] text-[#1a1024] font-bold text-xs hover:bg-[#d6ff73] transition shadow-lg shadow-[#c8f560]/20">
            Upload Musik Sekarang
          </Link>
        </div>
      ) : (
        <div className="mt-4">
          <UserReleasesClient releases={releases} artistName={artistName} />
        </div>
      )}
    </div>
  );
}