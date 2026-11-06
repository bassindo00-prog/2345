const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Memeriksa dan memvalidasi tabel Catalog di database PostgreSQL...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Catalog" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "songId" TEXT UNIQUE NOT NULL,
      "title" TEXT NOT NULL,
      "artist" TEXT NOT NULL,
      "publisher" TEXT NOT NULL,
      "status" TEXT DEFAULT 'Aktif',
      "youtubeLink" TEXT,
      "driveLink" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_catalog_publisher" ON "Catalog" ("publisher")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_catalog_title" ON "Catalog" ("title")`);

  const countRes = await prisma.$queryRawUnsafe(`SELECT count(*) as c FROM "Catalog"`);
  console.log(`✅ Sukses! Total lagu terdaftar di tabel Catalog: ${countRes[0].c}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
