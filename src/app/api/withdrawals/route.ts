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

    const newId = `cmw${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const todayStr = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
    const methodStr = body.method || "Bank BCA";
    const holderStr = body.accountHolder || session?.user?.name || "Musisi";
    const accNumberStr = body.accountNumber || "-";

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Withdrawal" ("id", "userId", "amount", "method", "accountNumber", "accountHolder", "status", "date", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      newId,
      userId,
      amount,
      methodStr,
      accNumberStr,
      holderStr,
      "Pending",
      todayStr
    ).catch((err) => console.warn("Failed to insert into Withdrawal table:", err));

    let withdrawal: any = { id: newId, amount, status: "PENDING" };
    try {
      withdrawal = await prisma.withdrawRequest.create({
        data: {
          userId,
          amount,
          bankName: methodStr,
          accountNumber: accNumberStr,
          accountName: holderStr,
          status: "PENDING",
        },
      });
    } catch {}

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
    const statusDb = status === "Approved" ? "Approved" : "Rejected";

    if (allPending) {
      await prisma.$executeRawUnsafe(
        `UPDATE "Withdrawal" SET "status" = $1 WHERE UPPER("status") = 'PENDING'`,
        statusDb
      ).catch(() => {});
      await prisma.withdrawRequest.updateMany({
        where: { status: "PENDING" },
        data: { status: targetStatus },
      }).catch(() => {});
      return NextResponse.json({ ok: true });
    }

    if (Array.isArray(ids) && ids.length > 0) {
      for (const singleId of ids) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Withdrawal" SET "status" = $1 WHERE "id" = $2`,
          statusDb,
          singleId
        ).catch(() => {});
      }
      await prisma.withdrawRequest.updateMany({
        where: { id: { in: ids } },
        data: { status: targetStatus },
      }).catch(() => {});
      return NextResponse.json({ ok: true });
    }

    if (id) {
      await prisma.$executeRawUnsafe(
        `UPDATE "Withdrawal" SET "status" = $1 WHERE "id" = $2`,
        statusDb,
        id
      ).catch(() => {});
      await prisma.withdrawRequest.update({
        where: { id },
        data: { status: targetStatus },
      }).catch(() => {});
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

