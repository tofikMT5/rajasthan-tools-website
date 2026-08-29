# RT Billing System - Project Memory

## Project
- Name: RT Billing System
- Client: Rajasthan Tools Q8 (Kuwait)
- Owner contact: Dinesh, +965 9099 7484
- Business: Tools / Hardware retail + wholesale
- Currency: KWD (3 decimals)
- Languages: English + Arabic

## Tech Stack
- Next.js + TypeScript + Tailwind + Prisma + Supabase
- Auth: NextAuth
- Desktop: Electron (.exe)
- Hosting target: local desktop + future website connected to same DB

## Current Status (as of today)
- Web app exists with dashboard modules:
  Dashboard, POS/New Invoice, Invoices, Products, Categories, Customers, Suppliers, Purchases, Reports, Users, Settings
- Purchases module was fixed from 404
- Login/runtime errors fixed
- Electron desktop build generated in dist-installer/win-unpacked and dist-final2 (to bypass locks)
- Electron UI styling & host binding fixed (127.0.0.1:3000)
- NextAuth session redirects forcefully route to correct origin (Vercel/Local) instead of localhost
- Enforced session login requirement upon every new Electron app launch via sessionStorage
- Website module is live and connected. Product edit/image upload synced to Live Vercel.

## Important Paths
- Project path: `E:\Downloads chrome\Antigravity Project\Rajasthan Tools Software\rt-billing-system`
- Desktop output: `dist-installer/`
- Main app: Next.js on `http://127.0.0.1:3000`
- Database: Supabase Postgres

## Credentials / Env
- `.env.local` / `.env.production` contains `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`
- Default app logins:
  - Super Admin: `superadmin` / `SUPERADMIN_RAJASTHAN_2026`
  - Secondary Super Admin: `admin` / `RAJASTHAN`
  - Store Admin (Client): `dinesh` / `RAJASTHAN2026`
- `NEXTAUTH_URL` for desktop set to `http://127.0.0.1:3000`

## What is DONE
- Billing software core screens
- Purchases list/new/detail routes
- Electron packaging & 127.0.0.1 spawner integration
- Sidebar routes fully active
- WIPE test data API and super admin permissions lockdown

## What is PENDING (next priorities)
1. Confirm Electron styled UI 100% in client runtime
2. Final installer package (.exe) generation for client distribution
3. Production hardening (roles, validations)
4. Website (EN/AR) connected to same product database
5. Client handover + training

## Rules for AI
- First read `PROJECT_MEMORY.md` and `CONTINUE_TOMORROW.md` before any work
- Do not break existing working features
- Make surgical changes only
- Keep KWD 3 decimals across all screens
- Keep bilingual direction in mind (English/Arabic)
- Prefer fix over rewrite

## Known Issues Log
- 404 on purchases (fixed)
- missing required error components / bootstrap script issues (fixed)
- Electron default demo page issue (fixed)
- Unstyled Electron UI due to CSS/static loading (fixed via 127.0.0.1 binding & session cache clear)
- Electron Builder packaging failure due to EBUSY locks and files array overriding (fixed by outputting to dist-final2)
- NextAuth logout redirecting to localhost on Vercel and persisting sessions in Electron (fixed by dynamic origin tracking and sessionStorage session enforcer)
- Next.js 15 Vercel build failures due to `params` and `searchParams` types not being Promises (fixed by converting them to Promises and awaiting them, validated via `npx tsc --noEmit` before push).

## Client Live Change Requests (Direct Workflow)
**Trigger Phrase:** "PRODUCT ME CHANGES KIYE THE WESA HI STEP BA MUJEH ISME BHI CHAGES KRWNA HAI"
**Action Plan when triggered:**
1. Make the requested changes surgically in the Next.js code without breaking the billing system.
2. The user specifically wants **DIRECT LIVE DEPLOYMENT ("no local host")**.
3. **CRITICAL PRE-FLIGHT:** Run `npx tsc --noEmit` locally to catch any Next.js 15 typescript errors (especially `params`/`searchParams` promise signatures or empty API files).
4. **Push immediately to GitHub:** `git add src`, `git commit -m "update"`, `git push`. 
5. Inform the user the code is pushed and Vercel will make it live in 1-2 minutes. No need to show local host previews unless specifically asked.
