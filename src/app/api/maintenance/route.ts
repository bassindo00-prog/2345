import { NextResponse } from "next/server";
import { isMaintenanceActive } from "@/lib/maintenance";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const active = await isMaintenanceActive();
  return NextResponse.json(
    { active },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
