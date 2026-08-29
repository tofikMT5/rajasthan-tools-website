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
1. Confirm web UI is fully styled and working
2. Confirm Electron UI matches web UI (styled)
3. If Electron UI broken: fix asset/CSS loading only
4. Build clean client installer .exe
5. Then start WEBSITE phase (connected to same DB):
   - Home, Products, Categories, About, Contact
   - EN/AR toggle + RTL
   - show products where `showOnWebsite = true`

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
