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
5. **Send the latest `RT-Billing-Setup-1.0.0.exe` (from `dist-final2/`) to the client and ensure they can install/open it.**
6. **Client Request Backlog:** Proceed with the next changes the client requested.

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
