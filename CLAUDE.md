# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Támogatás nyilvántartó" (Donation Tracker) - An Electron desktop application for tracking foundation supporters and donations. Built for a financial administrator to manage donor records, import bank transactions, and export reports.

## Tech Stack

- **Electron Forge + Vite + TypeScript** - Desktop app framework
- **better-sqlite3** - Local database (WAL mode, foreign keys enforced)
- **Tailwind CSS v4** - Styling (via @tailwindcss/vite plugin)
- **ExcelJS** - XLSX export functionality
- **Vanilla DOM** - No frontend framework, plain TypeScript

## Build Commands

```bash
npm start          # Development mode
npm run package    # Package for distribution
npm run make       # Create distributable installers
npx electron-rebuild -f -w better-sqlite3  # Rebuild native modules
```

## Architecture

### Process Structure
```
src/
├── main/           # Electron main process
│   ├── database/   # connection.ts, schema.ts, *.repo.ts
│   ├── services/   # csv-import, csv-export, xlsx-export
│   └── ipc/        # IPC handlers (domain:action pattern)
├── preload/        # contextBridge typed API
├── renderer/       # UI layer
│   ├── components/ # DOM components
│   ├── lib/        # router, dom-helpers, formatters
│   └── pages/      # Page orchestrators
└── shared/types/   # Shared types across processes
```

### Key Patterns

- **IPC channels**: Follow `domain:action` naming (e.g., `supporters:list`, `donations:create`)
- **Database**: Singleton connection in userData directory, migrations via schema_migrations table
- **Routing**: Hash-based page router for SPA navigation
- **Path alias**: `@shared/*` maps to `src/shared/*`

### Data Model

- **supporters**: id, name, address, email, phone, notes, timestamps
- **donations**: id, supporter_id (FK), amount, currency, donation_date, payment_method, reference, notes, source, timestamps

## Build Configuration Notes

- `forge.config.ts`: ASAR unpack for `.node` files, rebuildConfig for better-sqlite3
- `vite.main.config.ts`: Mark `better-sqlite3` as external in rollupOptions
- `vite.renderer.config.ts`: Include `@tailwindcss/vite` plugin
