export const COMPANY_DETAILS = {
  nameEn: 'Rajasthan Retail Co. for Woodworking and Blacksmithing Tools',
  nameAr: 'شركة راجستان للبيع بالتجزئة لأدوات النجارة والحدادة',
  shortName: 'Rajasthan Tools Q8 / RT',
  addressEn: 'Shuwaikh Industrial Area 2, Block 1, St. 17, Tara Center, Shop 11, Kuwait',
  addressAr: 'الشويخ الصناعية ٢، قطعة ١، شارع ١٧، مجمع تارا، محل ١١، الكويت',
  poBox: 'P.O.Box 26952, Pin 13130',
  phone: '+965 9099 7484',
  email: 'rajasthantools.q8@gmail.com',
  currency: 'KD',
  decimals: 3,
  themeColors: {
    primary: '#1e3a8a',
    accent: '#f97316',
    success: '#10b981',
    danger: '#ef4444',
    backgroundLight: '#f8fafc',
    backgroundDark: '#0f172a',
  },
};

export const KUWAIT_AREAS = [
  'Shuwaikh',
  'Salmiya',
  'Hawally',
  'Farwaniya',
  'Ahmadi',
  'Jahra',
  'Mubarak Al-Kabeer',
  'Capital',
  'Fahaheel',
  'Sharq',
  'Other',
];

export const PAYMENT_MODES = [
  { id: 'CASH', nameEn: 'Cash', nameAr: 'نقدي' },
  { id: 'KNET', nameEn: 'K-Net', nameAr: 'كي نت' },
  { id: 'VISA', nameEn: 'Visa / Mastercard', nameAr: 'فيزا / ماستر' },
  { id: 'ONLINE', nameEn: 'Online / Link', nameAr: 'أون لاين / رابط' },
  { id: 'CHEQUE', nameEn: 'Cheque', nameAr: 'شيك' },
] as const;

export const PRODUCT_UNITS = ['PCS', 'BOX', 'SET', 'KG', 'METER', 'ROLL', 'PACK', 'PAIR'] as const;

export const CUSTOMER_TYPES = [
  { id: 'RETAIL', labelEn: 'Retail', labelAr: 'مفرق' },
  { id: 'WHOLESALE', labelEn: 'Wholesale', labelAr: 'جملة' },
  { id: 'CONTRACTOR', labelEn: 'Contractor', labelAr: 'مقاول' },
] as const;

export const INVOICE_TYPES = [
  { id: 'CASH', labelEn: 'Cash Invoice', labelAr: 'فاتورة نقداً' },
  { id: 'CREDIT', labelEn: 'Credit Invoice', labelAr: 'فاتورة آجل' },
  { id: 'QUOTATION', labelEn: 'Quotation', labelAr: 'عرض سعر' },
  { id: 'RETURN', labelEn: 'Sales Return', labelAr: 'مرتجع مبيعات' },
  { id: 'DELIVERY_NOTE', labelEn: 'Delivery Note', labelAr: 'إذن تسليم' },
] as const;
