import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('Creating PettyCashVoucher table if not exists...');

  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PettyCashVoucher" (
      "id" TEXT NOT NULL,
      "voucherNo" TEXT NOT NULL,
      "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "type" TEXT NOT NULL DEFAULT 'PAYMENT',
      "paidTo" TEXT NOT NULL,
      "paymentMethod" TEXT NOT NULL DEFAULT 'Cash',
      "category" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "amount" DECIMAL(12,3) NOT NULL,
      "runningBalance" DECIMAL(12,3) NOT NULL DEFAULT 0,
      "preparedBy" TEXT,
      "approvedBy" TEXT,
      "receivedBy" TEXT,
      "status" TEXT NOT NULL DEFAULT 'APPROVED',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PettyCashVoucher_pkey" PRIMARY KEY ("id")
    );
  `);

  await db.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "PettyCashVoucher_voucherNo_key" ON "PettyCashVoucher"("voucherNo");
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "PettyCashVoucher_voucherNo_idx" ON "PettyCashVoucher"("voucherNo");
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "PettyCashVoucher_date_idx" ON "PettyCashVoucher"("date");
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "PettyCashVoucher_category_idx" ON "PettyCashVoucher"("category");
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "PettyCashVoucher_type_idx" ON "PettyCashVoucher"("type");
  `);

  try {
    await db.$executeRawUnsafe(`
      ALTER TABLE "FeatureToggles" ADD COLUMN IF NOT EXISTS "enablePettyCash" BOOLEAN DEFAULT true;
    `);
    console.log('FeatureToggles updated.');
  } catch (err: any) {
    console.log('FeatureToggles notice:', err.message);
  }

  const count = await (db as any).pettyCashVoucher.count();
  console.log('SUCCESS: PettyCashVoucher table ready in Supabase database! Row count:', count);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  });
