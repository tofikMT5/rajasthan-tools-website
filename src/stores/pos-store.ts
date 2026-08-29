import { create } from 'zustand';

export interface CartItem {
  productId: string;
  itemCodeSnap: string;
  nameEnSnap: string;
  nameArSnap: string;
  unit: string;
  costPrice: number;
  price: number; // Sale price
  qty: number;
  lineDiscount: number;
  amount: number; // (price * qty) - lineDiscount
  stockQty: number;
}

export interface CustomerSnap {
  id: string;
  nameEn: string;
  nameAr?: string | null;
  phone: string;
  type: string;
  creditLimit?: number;
  currentBalance?: number;
}

export interface PaymentItem {
  mode: 'CASH' | 'KNET' | 'VISA' | 'ONLINE' | 'CHEQUE';
  amount: number;
  reference?: string;
}

interface PosState {
  cart: CartItem[];
  customer: CustomerSnap | null;
  invoiceType: 'CASH' | 'CREDIT' | 'QUOTATION' | 'RETURN' | 'DELIVERY_NOTE';
  discountAmount: number;
  extraAmount: number;
  narration: string;
  salesmanId: string | null;
  payments: PaymentItem[];
  heldBills: Array<{
    id: string;
    timestamp: string;
    customerName: string;
    cart: CartItem[];
  }>;

  // Actions
  addToCart: (product: any, qty?: number) => void;
  updateQty: (productId: string, delta: number) => void;
  setQty: (productId: string, qty: number) => void;
  updatePrice: (productId: string, price: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setCustomer: (customer: CustomerSnap | null) => void;
  setInvoiceType: (type: PosState['invoiceType']) => void;
  setDiscountAmount: (discount: number) => void;
  setExtraAmount: (extra: number) => void;
  setNarration: (notes: string) => void;
  setSalesmanId: (salesmanId: string | null) => void;
  setPaymentAmount: (mode: PaymentItem['mode'], amount: number, reference?: string) => void;
  resetPayments: () => void;
  holdBill: () => void;
  recallBill: (heldBillId: string) => void;
  removeHeldBill: (heldBillId: string) => void;
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  customer: {
    id: 'cash-customer-default',
    nameEn: 'Cash Customer',
    nameAr: 'عميل نقدي',
    phone: '90000000',
    type: 'RETAIL',
  },
  invoiceType: 'CASH',
  discountAmount: 0,
  extraAmount: 0,
  narration: '',
  salesmanId: null,
  payments: [{ mode: 'CASH', amount: 0 }],
  heldBills: [],

  addToCart: (product, qty = 1) => {
    const { cart } = get();
    const existingIndex = cart.findIndex((item) => item.productId === product.id);

    if (existingIndex > -1) {
      const updated = [...cart];
      const current = updated[existingIndex];
      const newQty = current.qty + qty;
      const newAmount = Number((current.price * newQty - current.lineDiscount).toFixed(3));
      updated[existingIndex] = {
        ...current,
        qty: newQty,
        amount: newAmount,
      };
      set({ cart: updated });
    } else {
      const salePrice = Number(product.salePrice);
      const newItem: CartItem = {
        productId: product.id,
        itemCodeSnap: product.itemCode,
        nameEnSnap: product.nameEn,
        nameArSnap: product.nameAr,
        unit: product.unit || 'PCS',
        costPrice: Number(product.costPrice || 0),
        price: salePrice,
        qty: qty,
        lineDiscount: 0,
        amount: Number((salePrice * qty).toFixed(3)),
        stockQty: product.stockQty || 0,
      };
      set({ cart: [...cart, newItem] });
    }
  },

  updateQty: (productId, delta) => {
    const { cart } = get();
    const updated = cart
      .map((item) => {
        if (item.productId === productId) {
          const newQty = item.qty + delta;
          if (newQty <= 0) return null;
          return {
            ...item,
            qty: newQty,
            amount: Number((item.price * newQty - item.lineDiscount).toFixed(3)),
          };
        }
        return item;
      })
      .filter(Boolean) as CartItem[];
    set({ cart: updated });
  },

  setQty: (productId, qty) => {
    const { cart } = get();
    if (qty <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const updated = cart.map((item) => {
      if (item.productId === productId) {
        return {
          ...item,
          qty,
          amount: Number((item.price * qty - item.lineDiscount).toFixed(3)),
        };
      }
      return item;
    });
    set({ cart: updated });
  },

  updatePrice: (productId, price) => {
    const { cart } = get();
    const updated = cart.map((item) => {
      if (item.productId === productId) {
        return {
          ...item,
          price,
          amount: Number((price * item.qty - item.lineDiscount).toFixed(3)),
        };
      }
      return item;
    });
    set({ cart: updated });
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((item) => item.productId !== productId) });
  },

  clearCart: () => {
    set({
      cart: [],
      discountAmount: 0,
      extraAmount: 0,
      narration: '',
      payments: [{ mode: 'CASH', amount: 0 }],
    });
  },

  setCustomer: (customer) => set({ customer }),
  setInvoiceType: (invoiceType) => set({ invoiceType }),
  setDiscountAmount: (discountAmount) => set({ discountAmount }),
  setExtraAmount: (extraAmount) => set({ extraAmount }),
  setNarration: (narration) => set({ narration }),
  setSalesmanId: (salesmanId) => set({ salesmanId }),

  setPaymentAmount: (mode, amount, reference) => {
    const { payments } = get();
    const existingIndex = payments.findIndex((p) => p.mode === mode);
    if (existingIndex > -1) {
      if (amount <= 0) {
        set({ payments: payments.filter((p) => p.mode !== mode) });
      } else {
        const updated = [...payments];
        updated[existingIndex] = { mode, amount, reference };
        set({ payments: updated });
      }
    } else if (amount > 0) {
      set({ payments: [...payments, { mode, amount, reference }] });
    }
  },

  resetPayments: () => set({ payments: [{ mode: 'CASH', amount: 0 }] }),

  holdBill: () => {
    const { cart, customer, heldBills } = get();
    if (cart.length === 0) return;

    const newHeldBill = {
      id: 'HELD-' + Date.now(),
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      customerName: customer?.nameEn || 'Cash Customer',
      cart: [...cart],
    };

    set({
      heldBills: [newHeldBill, ...heldBills],
      cart: [],
      discountAmount: 0,
      extraAmount: 0,
      narration: '',
    });
  },

  recallBill: (heldBillId) => {
    const { heldBills } = get();
    const target = heldBills.find((b) => b.id === heldBillId);
    if (target) {
      set({
        cart: [...target.cart],
        heldBills: heldBills.filter((b) => b.id !== heldBillId),
      });
    }
  },

  removeHeldBill: (heldBillId) => {
    set({ heldBills: get().heldBills.filter((b) => b.id !== heldBillId) });
  },
}));
