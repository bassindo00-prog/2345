import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        title: m.subject || "Pemberitahuan",
        content: m.content || "",
        sender: "Admin Breakout",
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

