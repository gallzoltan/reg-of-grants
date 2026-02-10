# Phase 4: Export (CSV + XLSX)

## Context

The backlog Phase 4 adds CSV and XLSX export for donations. The export page already exists as a placeholder (`src/renderer/pages/export.ts`). ExcelJS is already installed. The donations repo already has `findAll()` and `findByDateRange()` returning `DonationWithSupporter[]`.

## Implementation Steps

### 4.1 — Shared types + IPC channels

**`src/shared/types/export.ts`** (new)
- `ExportOptions` type: `{ from?: string; to?: string; format: 'csv' | 'xlsx' }`
- Export result type: `{ filePath: string; count: number }` or `null` (cancelled)

**`src/shared/types/ipc-channels.ts`** (edit)
- Add `'export:csv'`: input `{ from?: string; to?: string }`, output `{ filePath: string; count: number } | null`
- Add `'export:xlsx'`: input `{ from?: string; to?: string }`, output `{ filePath: string; count: number } | null`

### 4.2 — CSV export service

**`src/main/services/csv-export.ts`** (new)
- `exportToCSV(donations: DonationWithSupporter[], filePath: string): void`
- UTF-8 BOM prefix (`\uFEFF`) for Excel compatibility
- Columns: Támogató, Összeg, Pénznem, Dátum, Fizetési mód, Hivatkozás, Megjegyzés
- Semicolon separator (Hungarian CSV convention)
- Write with `fs.writeFileSync`

### 4.3 — XLSX export service

**`src/main/services/xlsx-export.ts`** (new)
- `exportToXLSX(donations: DonationWithSupporter[], filePath: string): Promise<void>`
- ExcelJS workbook with formatted header (bold, background color)
- Same columns as CSV
- Auto column widths
- Number format for amount column

**`vite.main.config.ts`** (edit)
- Add `exceljs` to `rollupOptions.external` alongside `better-sqlite3`

### 4.4 — Export IPC handlers

**`src/main/ipc/export.ipc.ts`** (new)
- `registerExportHandlers()` function
- `export:csv` handler: fetch donations (by date range or all), show `dialog.showSaveDialog()` with CSV filter, call `exportToCSV()`
- `export:xlsx` handler: same but XLSX filter, call `exportToXLSX()`

**`src/main/main.ts`** (edit)
- Import and call `registerExportHandlers()` in the `ready` event

### 4.5 — Export page UI

**`src/renderer/pages/export.ts`** (rewrite)
- Date range filter (reuse `createDateInput` from form-helpers)
- Two export buttons: "CSV exportálás", "XLSX exportálás"
- Status feedback after export (success message with file path + count)
- Use existing `el()`, `clearElement()`, `createDateInput()`, `createFormGroup()` helpers

## Files to modify/create
1. `src/shared/types/export.ts` — **new**
2. `src/shared/types/ipc-channels.ts` — edit (add 2 channels)
3. `src/main/services/csv-export.ts` — **new**
4. `src/main/services/xlsx-export.ts` — **new**
5. `src/main/ipc/export.ipc.ts` — **new**
6. `src/main/main.ts` — edit (register export handlers)
7. `vite.main.config.ts` — edit (externalize exceljs)
8. `src/renderer/pages/export.ts` — rewrite

## Verification
- `npm start` — open Export page, pick date range, export CSV, export XLSX
- Verify CSV opens correctly in Excel (UTF-8 BOM, semicolons)
- Verify XLSX has formatted header and correct data
