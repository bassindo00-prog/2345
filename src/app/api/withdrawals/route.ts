import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const amount = Number(body.amount);

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Jumlah penarikan harus lebih dari Rp 0" },
        { status: 400 }
      );
    }

    const withdrawal = await prisma.withdrawRequest.create({
      data: {
        userId,
        amount,
        bankName: body.method || "Bank BCA",
        accountNumber: body.accountNumber || "-",
        accountName: body.accountHolder || session?.user?.name || "Musisi",
        status: "PENDING",
      },
    });

    return NextResponse.json({ ok: true, withdrawal });
  } catch (error) {
    console.error("POST withdrawal error:", error);
    return NextResponse.json(
      { error: "Failed to create withdrawal request" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ids, allPending, status } = body;

    const targetStatus = status === "Approved" ? "APPROVED" : "REJECTED";

    if (allPending) {
      await prisma.withdrawRequest.updateMany({
        where: { status: "PENDING" },
        data: { status: targetStatus },
      });
      return NextResponse.json({ ok: true });
    }

    if (Array.isArray(ids) && ids.length > 0) {
      await prisma.withdrawRequest.updateMany({
        where: { id: { in: ids } },
        data: { status: targetStatus },
      });
      return NextResponse.json({ ok: true });
    }

    if (id) {
      await prisma.withdrawRequest.update({
        where: { id },
        data: { status: targetStatus },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "No target specified" }, { status: 400 });
  } catch (error) {
    console.error("PATCH withdrawal error:", error);
    return NextResponse.json(
      { error: "Failed to update withdrawal" },
      { status: 500 }
    );
  }
}
