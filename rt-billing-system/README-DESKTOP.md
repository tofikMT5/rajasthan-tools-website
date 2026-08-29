# 🖥️ RT Billing System — Desktop App & Installer Guide

## 🚀 How to Run Desktop App (Development Mode)
Run the following command from `rt-billing-system`:

```bash
npm run electron:dev
```
This automatically starts the Next.js local server on `http://localhost:3000` and launches the Electron desktop application window displaying your real RT Billing login/dashboard.

---

## 📦 How to Generate Windows `.exe` Installer
To build the standalone Windows installer (`.exe`):

```bash
npm run electron:pack
```

The generated installer will be saved to:
`rt-billing-system/dist-installer/RT-Billing-Setup-1.0.0.exe`

---

## ⚡ Quick One-Click Launcher
Double-click `start-rt-billing.bat` in the project root to launch the desktop application instantly!
