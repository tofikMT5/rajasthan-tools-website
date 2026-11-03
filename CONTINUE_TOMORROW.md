# Continue Tomorrow - Start Here

## Boot Sequence
1. Open project folder `rt-billing-system`
2. Read `PROJECT_MEMORY.md`
3. Read this file
4. Run:
   - `npm run dev`
   - check `http://127.0.0.1:3000/login`
5. For desktop:
   - `npm run electron:dev`
   - or run `dist-installer/win-unpacked/RT Billing System.exe`

## Tomorrow first tasks (in order)
0. ✅ Fixed the Electron packaging issues (Windows path limit, lock files, symlink errors). The clean `.exe` is ready in `dist-final2/`.
1. ✅ **Website Phase Completed:** The Website is successfully deployed. Vercel routing conflicts have been resolved via middleware.
2. ✅ **Auto-Login and Logout caching fixed.**
3. ✅ **Vercel UI Cache Bug Fixed:** Fixed the input field visibility bug where the Vercel-deployed app was caching CSS classes, causing input texts to appear light gray. We hardcoded `text-black` to bypass it.
4. ✅ **Edit Product Translation Fix:** Added English to Arabic auto-translate functionality directly to the Edit Product modal (`products/[id]/page.tsx`), similar to the Add Product modal, with smart handling to avoid overwriting existing names on load.
5. ✅ **Purchase Invoice Product Add Bug Fixed:** Fixed an issue where adding a product to a new purchase invoice prematurely submitted the form. Added `type="button"` to prevent it and pushed to `rt-billing-system`.
21. ✅ **Purchase Invoice Edit Feature:** Added an Edit Invoice button and backend PUT route to safely update items in an existing purchase order, reverting stock appropriately and recalculating supplier balance.
22. ✅ **Supplier UI Fixes:** Removed the confusing '0 Products' badge and added a 'Purchases' count badge to cleanly display the number of purchase orders made to a supplier.
23. ✅ **Delete Invoice Features:** Added functionality to delete Sales Invoices and Purchase Invoices with automated stock restoration and balance recalculations. Fixed the database schema mismatch safely.
24. ✅ **Petty Cash Management Module Added:** Added `/petty-cash` module with sidebar item below Settings, sequential voucher generation, running cash balance, receipt/payment entries, print format, and Excel export.
25. ✅ **Edit Sales Invoice Feature Added:** Added `Edit Invoice` button on `/invoices/[id]` and table, `/invoices/[id]/edit` full editor, and backend stock-safe `PUT /api/invoices/[id]` route.
26. ✅ **Paid & Unpaid Status Filters Added:** Added dynamic toggle pills `[ All | Paid | Unpaid ]` to both Purchases (`/purchases`) and Invoices (`/invoices`) with server-side query filtering.
27. ✅ **Purchase Discount, Payment Modes (Cash/K-Net/Partial), & Printable Invoice Added:** Integrated Bill Discount (KD), Paid / Partially / Unpaid status toggles, payment methods (Cash, K-Net, Card, Cheque), dynamic typed paid amount on Partial with remaining balance calculation, backend columns & transactions, and A4 print / PDF download layout matching client requirements.
28. ✅ **POS Dummy Summary Sales & Editable Invoice Number Added:** In POS (`/pos`), typing "dummy" triggers special 'Previous Summary Sales (Dummy)' card with customizable description and manual Net Amount input (real inventory untouched). Added `[ Dummy ]` filter in `/invoices`. In `/invoices/[id]/edit`, made Invoice Number `#RT-{invoiceNo}` editable with duplicate conflict error detection.
29. ✅ **Supplier Price Comparison & Purchase History by Product Added:** Added dedicated API and modal to search any product and see all suppliers who supplied it, their prices, who gave the lowest price (🏆 Best Rate), latest purchase date/price, and chronological order timeline. Integrated into `/purchases`, `/purchases/new`, `/purchases/[id]/edit`, and `/products`.
30. ✅ **Customer Account Statement & Date-Range PDF Export Added:** Added dedicated `Statement` button on `/customers` table row (matching screenshot) and `/customers/[id]`. Added date-range filtering (Presets: Last 2 Months, This Month, Last Month, Last 30 Days, All Time, Custom), total invoices count, total paid, remaining due balance, payment breakdown (Cash, K-Net, Card, etc.), chronological transactions ledger, and high-quality A4 printable/PDF export component. Fixed paidAmount calculation for PAID status invoices.
31. ✅ **Supplier Account Statement & Date-Range PDF Export Added:** Added dedicated `Statement` button on every supplier card on `/suppliers` (matching client screenshot). Added date-range filtering, total purchases value, total amount paid, total balance due to supplier, payment method breakdown, detailed purchases ledger table, and high-quality A4 printable/PDF export component.
32. **Send the latest `RT-Billing-Setup-1.0.0.exe` (from `dist-final2/`) to the client and ensure they can install/open it.**
33. **Client Request Backlog:** Proceed with remaining changes requested by the client.

## Do NOT do tomorrow unless asked
- Full rewrite
- DB schema reset
- Deleting features
- Changing design system randomly

## Handover Goal
Client wants Windows software (.exe) where he can:
- add customers
- add machines/products with photo/model/price/category
- create/print/save/pdf bills
- manage users/passwords
- keep history for future
