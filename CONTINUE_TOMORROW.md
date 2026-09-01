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
1. ✅ **Website Phase Completed:** The Website is successfully deployed to `rajasthan-tools-website-five.vercel.app` alongside the Software Dashboard (`rt-billing-system.vercel.app`) from a unified codebase! Vercel routing conflicts have been resolved via middleware.
2. ✅ **Auto-Login and Logout caching fixed:** Fixed persistent Electron sessions and NextAuth App Router logout caching issues.
3. **Send the latest `RT-Billing-Setup-1.0.0.exe` (from `dist-final2/`) to the client and ensure they can install/open it.**
4. **Client Request Backlog:** Proceed with the "bahut se changes" (many more changes) the client mentioned they want to do next. Ensure all future changes are strictly tested so the Website and Software routing remains perfectly isolated.

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
