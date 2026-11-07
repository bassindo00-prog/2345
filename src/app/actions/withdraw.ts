"use server";

import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { isMaintenanceActive } from "@/lib/maintenance";

const prisma = new PrismaClient();

export async function withdrawAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const active = await isMaintenanceActive();
  if (active && session.user.role !== "ADMIN") {
    return { error: "Sistem sedang dalam pemeliharaan (Maintenance Mode)." };
  }

  const withdrawSetting = await prisma.settings.findUnique({ where: { key: 'withdrawals_enabled' } });
  if (withdrawSetting?.value === "false" && session.user.role !== "ADMIN") {
    return { error: "Penarikan saldo sedang dinonaktifkan sementara oleh Admin." };
  }

  const amount = parseFloat(formData.get("amount") as string);
  const bankName = formData.get("bankName") as string;
  const accountName = formData.get("accountName") as string;
  const accountNumber = formData.get("accountNumber") as string;

  if (!amount || amount < 50 || !bankName || !accountName || !accountNumber) {
    return { error: "Invalid form data or amount too low" };
  }

  const [rawUsers, rawW]: [any[], any[]] = await Promise.all([
    prisma.$queryRawUnsafe(
      `SELECT * FROM "User" WHERE "id" = $1 LIMIT 1`,
      session.user.id
    ).catch(() => []),
    prisma.$queryRawUnsafe(
      `SELECT * FROM "Withdrawal" WHERE "userId" = $1`,
      session.user.id
    ).catch(() => []),
  ]);

  const user = rawUsers?.[0];
  if (!user) {
    return { error: "User tidak ditemukan" };
  }

  const royaltyBalance = Number(user.royaltyBalance ?? user.royaltybalance ?? 0);
  const pendingWithdrawal = (rawW || [])
    .filter((w: any) => String(w.status || "").toUpperCase() === "PENDING" || String(w.status || "").toUpperCase() === "MENUNGGU")
    .reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);

  const availableBalance = Math.max(0, royaltyBalance - pendingWithdrawal);

  if (amount > availableBalance) {
    return { error: `Saldo tidak mencukupi! Saldo tersedia Anda Rp ${availableBalance.toLocaleString("id-ID")}` };
  }

  try {
    const newId = `cmw${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const todayStr = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");

    await prisma.$executeRawUnsafe(
      `INSERT INTO "Withdrawal" ("id", "userId", "amount", "method", "accountNumber", "accountHolder", "status", "date", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      newId,
      user.id,
      amount,
      bankName,
      accountNumber,
      accountName,
      "Pending",
      todayStr
    ).catch((err) => console.warn("Failed to insert into Withdrawal table:", err));

    await prisma.withdrawRequest.create({
      data: {
        userId: user.id,
        amount,
        bankName,
        accountName,
        accountNumber,
        status: "PENDING"
      }
    }).catch(() => {});

    // Notify Admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(a => ({
          userId: a.id,
          title: "New Withdrawal Request",
          message: `${user.name || user.email} requested a withdrawal of Rp ${amount.toLocaleString('id-ID')}.`
        }))
      });
    }

    revalidatePath("/dashboard/withdraw");
    revalidatePath("/admin/withdraw");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to submit request" };
  }
}
