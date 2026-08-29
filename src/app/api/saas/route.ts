import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const toggles = await db.featureToggles.upsert({
      where: { id: 'main' },
      update: {},
      create: {
        id: 'main',
        enablePos: true,
        enableInvoices: true,
        enableProducts: true,
        enableCategories: true,
        enableCustomers: true,
        enableSuppliers: true,
        enablePurchases: true,
        enableReports: true,
        enableUsers: true,
        enableSettings: true,
        enableQuotations: true,
        enableProfitReport: true,
        enablePdfExport: true,
        enableWhatsapp: true,
      },
    });

    return NextResponse.json({ success: true, toggles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const togglesData = {
      enablePos: Boolean(body.enablePos ?? true),
      enableInvoices: Boolean(body.enableInvoices ?? true),
      enableProducts: Boolean(body.enableProducts ?? true),
      enableCategories: Boolean(body.enableCategories ?? true),
      enableCustomers: Boolean(body.enableCustomers ?? true),
      enableSuppliers: Boolean(body.enableSuppliers ?? true),
      enablePurchases: Boolean(body.enablePurchases ?? true),
      enableReports: Boolean(body.enableReports ?? true),
      enableUsers: Boolean(body.enableUsers ?? true),
      enableSettings: Boolean(body.enableSettings ?? true),
      enableQuotations: Boolean(body.enableQuotations ?? true),
      enableProfitReport: Boolean(body.enableProfitReport ?? true),
      enablePdfExport: Boolean(body.enablePdfExport ?? true),
      enableWhatsapp: Boolean(body.enableWhatsapp ?? true),
    };

    const toggles = await db.featureToggles.upsert({
      where: { id: 'main' },
      update: togglesData,
      create: {
        id: 'main',
        ...togglesData,
      },
    });

    return NextResponse.json({ success: true, toggles });
  } catch (error: any) {
    console.error("CRITICAL SAAS TOGGLES SAVE ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save toggles in DB" },
      { status: 500 }
    );
  }
}

