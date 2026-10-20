import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("per_page") || searchParams.get("length") || "24";
  const search = searchParams.get("search") || "";

  const targetUrl = new URL("https://api.damarlangit.co.id/api/public/katalog");
  targetUrl.searchParams.set("page", page);
  targetUrl.searchParams.set("per_page", perPage);
  if (search.trim()) {
    targetUrl.searchParams.set("search", search.trim());
  }

  try {
    const res = await fetch(targetUrl.toString(), {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Upstream error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Damarlangit API proxy error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch Damarlangit catalog" },
      { status: 500 }
    );
  }
}
