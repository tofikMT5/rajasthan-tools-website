import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const productSchema = z.object({
  itemCode: z.string().min(1, 'Item Code is required'),
  barcode: z.string().optional(),
  nameEn: z.string().min(1, 'English name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().optional().nullable(),
  model: z.string().optional(),
  unit: z.string().default('PCS'),
  costPrice: z.number().min(0, 'Cost price cannot be negative'),
  salePrice: z.number().min(0.001, 'Sale price must be greater than 0'),
  wholesalePrice: z.number().min(0).optional().nullable(),
  stockQty: z.number().int().min(0, 'Stock cannot be negative'),
  minStockAlert: z.number().int().min(0).default(5),
  warranty: z.string().optional(),
  origin: z.string().optional(),
  showOnWebsite: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  images: z.array(z.string()).optional().default([]),
});

export const customerSchema = z.object({
  nameEn: z.string().min(1, 'English name is required'),
  nameAr: z.string().optional(),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  altPhone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  companyName: z.string().optional(),
  civilId: z.string().optional(),
  address: z.string().optional(),
  addressAr: z.string().optional(),
  area: z.string().optional(),
  type: z.enum(['RETAIL', 'WHOLESALE', 'CONTRACTOR']).default('RETAIL'),
  creditLimit: z.number().min(0).default(0),
  openingBalance: z.number().default(0),
  tradeLicense: z.string().optional(),
  notes: z.string().optional(),
  referredBy: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const categorySchema = z.object({
  nameEn: z.string().min(1, 'English name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  slug: z.string().min(1, 'Slug is required'),
  icon: z.string().optional(),
  parentId: z.string().optional().nullable(),
  showOnWebsite: z.boolean().default(true),
});

export const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'CASHIER', 'SALESMAN', 'VIEWER']),
  isActive: z.boolean().default(true),
});

export const posCartItemSchema = z.object({
  productId: z.string(),
  itemCodeSnap: z.string(),
  nameEnSnap: z.string(),
  nameArSnap: z.string(),
  qty: z.number().int().min(1),
  price: z.number().min(0),
  lineDiscount: z.number().min(0).default(0),
  amount: z.number().min(0),
});

export const invoiceCreateSchema = z.object({
  type: z.enum(['CASH', 'CREDIT', 'QUOTATION', 'RETURN', 'DELIVERY_NOTE']).default('CASH'),
  customerId: z.string().optional().nullable(),
  customerNameSnap: z.string().min(1),
  customerPhoneSnap: z.string().optional().nullable(),
  salesmanId: z.string().optional().nullable(),
  narration: z.string().optional().nullable(),
  items: z.array(posCartItemSchema).min(1, 'At least 1 product is required'),
  payments: z.array(z.object({
    mode: z.string(),
    amount: z.number().min(0),
    reference: z.string().optional().nullable(),
  })),
  grossAmount: z.number().min(0),
  discountAmount: z.number().min(0).default(0),
  extraAmount: z.number().min(0).default(0),
  netAmount: z.number().min(0),
  paidAmount: z.number().min(0),
  dueAmount: z.number().min(0),
});
