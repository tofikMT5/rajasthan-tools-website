import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Accounts
  const passAdmin = await bcrypt.hash('RAJASTHAN', 12);
  const passSuperAdmin = await bcrypt.hash('SUPERADMIN_RAJASTHAN_2026', 12);
  const passDinesh = await bcrypt.hash('RAJASTHAN2026', 12);

  // Super Admin #1 (admin)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: passAdmin, role: Role.SUPER_ADMIN, isActive: true },
    create: {
      username: 'admin',
      email: 'rajasthantools.q8@gmail.com',
      passwordHash: passAdmin,
      fullName: 'Rajasthan Super Admin',
      phone: '+965 9099 7484',
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  // Super Admin #2 (superadmin)
  await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: { passwordHash: passSuperAdmin, role: Role.SUPER_ADMIN, isActive: true },
    create: {
      username: 'superadmin',
      email: 'superadmin@rajasthantools.com',
      passwordHash: passSuperAdmin,
      fullName: 'Super Admin',
      phone: '+965 9099 7484',
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  // Primary Real Client Admin (dinesh)
  await prisma.user.upsert({
    where: { username: 'dinesh' },
    update: { passwordHash: passDinesh, role: Role.ADMIN, isActive: true },
    create: {
      username: 'dinesh',
      email: 'dinesh@rajasthantools.com',
      passwordHash: passDinesh,
      fullName: 'Dinesh Sharma (Store Owner)',
      phone: '+965 9099 7484',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log('✅ Admin accounts seeded (admin, superadmin, dinesh)');

  // 2. Seed Default Settings
  await prisma.settings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      companyNameEn: 'Rajasthan Retail Co. for Woodworking and Blacksmithing Tools',
      companyNameAr: 'شركة راجستان للبيع بالتجزئة لأدوات النجارة والحدادة',
      addressEn: 'Shuwaikh Industrial Area 2, Block 1, St. 17, Tara Center, Shop 11, Kuwait',
      addressAr: 'الشويخ الصناعية ٢، قطعة ١، شارع ١٧، مجمع تارا، محل ١١، الكويت',
      phone: '+965 9099 7484',
      email: 'rajasthantools.q8@gmail.com',
      poBox: 'P.O.Box 26952, Pin 13130',
      logo: '/logo.png',
      declarationEn: 'Goods Sold can be exchanged or returned within 14 days from Invoice date with Original Condition',
      declarationAr: 'يمكن استبدال أو إرجاع البضائع المباعة خلال ١٤ يومًا من تاريخ الفاتورة بحالتها الأصلية',
      invoicePrefix: 'RT-',
      currentInvoiceNo: 1001,
      currency: 'KD',
      decimals: 3,
      taxEnabled: false,
      taxPercent: 0,
      primaryColor: '#1e3a8a',
      accentColor: '#f97316',
    },
  });

  // 3. Seed 10 Default Categories
  const categoriesData = [
    { nameEn: 'Hand Tools', nameAr: 'أدوات يدوية', slug: 'hand-tools', icon: '🔨' },
    { nameEn: 'Power Tools', nameAr: 'أدوات كهربائية', slug: 'power-tools', icon: '🔌' },
    { nameEn: 'Hardware', nameAr: 'معدات وخردوات', slug: 'hardware', icon: '🔧' },
    { nameEn: 'Carpentry', nameAr: 'أدوات النجارة', slug: 'carpentry', icon: '🪚' },
    { nameEn: 'Blacksmithing', nameAr: 'أدوات الحدادة', slug: 'blacksmithing', icon: '⚙️' },
    { nameEn: 'Construction', nameAr: 'أدوات البناء', slug: 'construction', icon: '🏗️' },
    { nameEn: 'Accessories', nameAr: 'ملحقات وإكسسوارات', slug: 'accessories', icon: '📦' },
    { nameEn: 'Safety', nameAr: 'معدات السلامة', slug: 'safety', icon: '🥽' },
    { nameEn: 'Spare Parts', nameAr: 'قطع غيار', slug: 'spare-parts', icon: '⚙️' },
    { nameEn: 'Others', nameAr: 'أخرى', slug: 'others', icon: '📌' },
  ];

  for (let i = 0; i < categoriesData.length; i++) {
    const cat = categoriesData[i];
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        nameEn: cat.nameEn,
        nameAr: cat.nameAr,
        slug: cat.slug,
        icon: cat.icon,
        sortOrder: i + 1,
      },
    });
  }

  // 4. Seed Brands
  const brandsData = ['Makita', 'Bosch', 'Hilti', 'DeWalt', 'Stanley'];
  for (const brandName of brandsData) {
    await prisma.brand.upsert({
      where: { name: brandName },
      update: {},
      create: {
        name: brandName,
        showOnInvoice: true,
      },
    });
  }

  // 5. Seed Default Cash Customer
  await prisma.customer.upsert({
    where: { id: 'cash-customer-default' },
    update: {},
    create: {
      id: 'cash-customer-default',
      nameEn: 'Cash Customer',
      nameAr: 'عميل نقدي',
      phone: '90000000',
      type: 'RETAIL',
      area: 'Shuwaikh',
      address: 'Counter Sale',
    },
  });

  console.log('🚀 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
