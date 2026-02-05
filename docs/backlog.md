# Projekt inicializálási terv: "Támogatási nyilvántartás"

## Áttekintés
Inicializáljon egy zöldmezős Electron asztali alkalmazást az alapítványi támogatók és adományok nyomon követéséhez. Tech stack: Electron Forge + Vite + TypeScript + Vanilla DOM + better-sqlite3 + Tailwind CSS v4.

## 1. lépés: Scaffold with electron-forge
- A meglévő `docs/` ideiglenes áthelyezése
- Futtassa az `npx create-electron-app@latest barbi-szta --template=vite-typescript` parancsot
- Helyezze vissza a `docs/` fájlt

## 2. lépés: Függőségek telepítése
- `better-sqlite3` + `@types/better-sqlite3` (adatbázis)
- "exceljs" (XLSX export)
- "tailwindcss" + "@tailwindcss/vite" (Tailwind v4)
- Futtassa az `npx elektron-rebuild -f -w better-sqlite3` parancsot

## Step 3: Restructure source into domain layout
```
src/
├── main/               # Electron main process
│   ├── main.ts
│   ├── database/       # connection.ts, schema.ts, *.repo.ts
│   ├── services/       # csv-import, csv-export, xlsx-export
│   └── ipc/            # IPC handlers per domain
├── preload/
│   └── preload.ts      # Typed contextBridge API
├── renderer/           # UI (vanilla TS + Tailwind)
│   ├── renderer.ts
│   ├── styles/main.css
│   ├── components/     # DOM components
│   ├── lib/            # router, dom-helpers, format utils
│   └── pages/          # Page orchestrators
└── shared/             # Types shared across processes
    └── types/          # ipc-channels.ts, supporter.ts, donation.ts
```

## Step 4: Configure build tooling
- **forge.config.ts**: Update entry paths, ASAR unpack for `.node` files, rebuildConfig for better-sqlite3
- **vite.main.config.ts**: Mark `better-sqlite3` as external in rollupOptions
- **vite.renderer.config.ts**: Add `@tailwindcss/vite` plugin
- **tsconfig.json**: Add `@shared/*` path alias, strict mode

## 5. lépés: Adatbázis réteg
- `connection.ts`: Singleton, WAL mode, FK enforcement, migration runner, DB stored in `app.getPath('userData')`
- `schema.ts`: `supporters` table (id, name, address, email, phone, notes, timestamps), `donations` table (id, supporter_id FK, amount, currency, donation_date, payment_method, reference, notes, source, timestamps), `schema_migrations` table
- `supporters.repo.ts` and `donations.repo.ts`: CRUD queries

## 6. lépés: IPC réteg
- Typed channel map in `src/shared/types/ipc-channels.ts` — single source of truth
- Channels follow `domain:action` pattern (e.g., `supporters:list`, `donations:create`)
- Preload exposes typed `electronAPI.invoke()` via contextBridge
- Main process registers handlers via `ipcMain.handle`

## 7. lépés: Alapszintű alkalmazás shell
- `main.ts`: Ablak létrehozása, életciklus, adatbázis init/close
- "index.html": Oldalsáv + tartalomterület elrendezése Tailwinddel, CSP metacímkével
- `navigation.ts`: Az oldalsáv navigációs összetevője
- `router.ts`: Hash-alapú oldalútválasztó
- Helyőrző oldalak a következőkhöz: támogatók, adományok, import, jelentések, export

## Step 8: Verification
- Futtassa az "npm start" parancsot - Megnyílik az Electron ablak oldalsávos navigációval és Tailwind stílusú shellvel
- A navigációs elemekre kattintva átvált az oldalak között a hash routeren keresztül
- Az adatbázisfájl első indításakor létrejön a userData könyvtárban