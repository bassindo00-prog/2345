import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    const defaultPublisher =
      (formData.get("defaultPublisher") as string)?.trim() || "BREAKOUT Publishing";
    const defaultStatus = (formData.get("defaultStatus") as string)?.trim() || "Aktif";

    const fileName = file.name.toLowerCase();
    const isExcel =
      fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || fileName.endsWith(".csv");
    const isPdf = fileName.endsWith(".pdf");

    if (!isExcel && !isPdf) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Harap unggah file .xlsx, .xls, .csv, atau .pdf" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const validItems: Array<{
      songId: string;
      title: string;
      artist: string;
      publisher: string;
      status: string;
      youtubeLink: string | null;
      driveLink: string | null;
    }> = [];

    const nowPrefix = Date.now().toString(36).toUpperCase();

    if (isExcel) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      if (workbook.SheetNames.length === 0) {
        return NextResponse.json({ error: "File Excel kosong" }, { status: 400 });
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as any[];

      if (rawData.length === 0) {
        return NextResponse.json(
          { error: "Tidak ada baris data dalam sheet pertama file Excel" },
          { status: 400 }
        );
      }

      const getVal = (row: any, keys: string[]) => {
        for (const key of Object.keys(row)) {
          if (keys.some((k) => key.toLowerCase().trim().includes(k.toLowerCase()))) {
            const val = row[key];
            if (val !== undefined && val !== null && String(val).trim() !== "") {
              return String(val).trim();
            }
          }
        }
        return null;
      };

      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row || Object.keys(row).length === 0) continue;

        const title = getVal(row, ["judul", "title", "song", "lagu", "track", "nama lagu", "karya"]);
        const artist = getVal(row, [
          "artis",
          "artist",
          "penyanyi",
          "singer",
          "performer",
          "vokal",
          "band",
          "pencipta",
        ]);
        const publisher =
          getVal(row, [
            "publisher",
            "label",
            "penerbit",
            "publishing",
            "company",
            "hak cipta",
            "owner",
          ]) || defaultPublisher;
        const songId =
          getVal(row, ["song id", "songid", "id lagu", "kode", "code", "isrc", "id"]) ||
          `BRK-${nowPrefix}-${String(i + 1).padStart(5, "0")}`;
        const status = getVal(row, ["status", "keadaan"]) || defaultStatus;
        const youtubeLink = getVal(row, ["youtube", "yt", "video"]);
        const driveLink = getVal(row, ["drive", "link", "url", "audio", "mp3", "download"]);

        if (title || artist) {
          validItems.push({
            songId: String(songId).trim(),
            title: String(title || artist || "Untitled Song").trim(),
            artist: String(artist || "BREAKOUT Artist").trim(),
            publisher: String(publisher).trim(),
            status: String(status).trim() || "Aktif",
            youtubeLink: youtubeLink ? String(youtubeLink).trim() : null,
            driveLink: driveLink ? String(driveLink).trim() : null,
          });
        }
      }
    } else if (isPdf) {
      const pdfParseModule = await import("pdf-parse");
      const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;
      const data = await pdfParse(buffer);
      const text = data.text;

      if (!text || text.trim().length === 0) {
        return NextResponse.json(
          { error: "PDF tidak memiliki teks yang dapat diekstrak atau dibaca" },
          { status: 400 }
        );
      }

      const lines = text
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 2);

      let lineIdx = 0;
      for (const line of lines) {
        if (/^(halaman|page|\d+$)/i.test(line)) continue;

        let parts: string[] = [];
        if (line.includes("\t")) {
          parts = line.split("\t").map((p: string) => p.trim()).filter(Boolean);
        } else if (line.includes("|")) {
          parts = line.split("|").map((p: string) => p.trim()).filter(Boolean);
        } else if (line.includes(" - ")) {
          parts = line.split(" - ").map((p: string) => p.trim()).filter(Boolean);
        } else if (line.includes(";")) {
          parts = line.split(";").map((p: string) => p.trim()).filter(Boolean);
        } else {
          parts = [line];
        }

        if (parts.length > 0 && parts[0]) {
          lineIdx++;
          const title = parts[0];
          const artist = parts[1] || "BREAKOUT Artist";
          const publisher = parts[2] || defaultPublisher;
          const driveLink = parts[3] || null;

          validItems.push({
            songId: `BRK-PDF-${nowPrefix}-${String(lineIdx).padStart(5, "0")}`,
            title: String(title).trim(),
            artist: String(artist).trim(),
            publisher: String(publisher).trim(),
            status: defaultStatus,
            youtubeLink: null,
            driveLink: driveLink ? String(driveLink).trim() : null,
          });
        }
      }
    }

    if (validItems.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada baris data lagu yang valid ditemukan dalam file yang diunggah" },
        { status: 400 }
      );
    }

    // Deduplicate within the uploaded payload based on songId
    const uniqueMap = new Map<string, (typeof validItems)[0]>();
    for (const item of validItems) {
      uniqueMap.set(item.songId, item);
    }
    const deduplicatedItems = Array.from(uniqueMap.values());

    // Batch upsert into prisma.catalog
    let importedCount = 0;
    const BATCH_SIZE = 100;
    for (let i = 0; i < deduplicatedItems.length; i += BATCH_SIZE) {
      const chunk = deduplicatedItems.slice(i, i + BATCH_SIZE);
      await Promise.all(
        chunk.map((item) =>
          prisma.catalog.upsert({
            where: { songId: item.songId },
            update: {
              title: item.title,
              artist: item.artist,
              publisher: item.publisher,
              status: item.status,
              youtubeLink: item.youtubeLink,
              driveLink: item.driveLink,
            },
            create: item,
          })
        )
      );
      importedCount += chunk.length;
    }

    return NextResponse.json({
      ok: true,
      success: true,
      count: importedCount,
      filename: file.name,
    });
  } catch (error: any) {
    console.error("POST /api/catalog/import error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengimpor data file ke katalog" },
      { status: 500 }
    );
  }
}
