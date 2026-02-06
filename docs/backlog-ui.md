# UI Implementációs Backlog — Támogatás Nyilvántartó

A backend kész (DB, repo-k, IPC). Ez a backlog a frontend oldalak implementálását tartalmazza.

## 1. FÁZIS: Támogatók oldal

### 1.1 — Lista + törlés ✅
- [x] `src/renderer/lib/dom-helpers.ts` — el(), clearElement(), showError(), showEmpty()
- [x] `src/renderer/lib/formatters.ts` — formatDate(), formatPhoneList(), formatEmailList()
- [x] `src/renderer/pages/supporters.ts` — táblázat (név, cím, emailek, telefonok, műveletek), törlés confirm
- IPC: `supporters:list`, `supporters:delete`

### 1.2 — Létrehozás + szerkesztés form ✅
- [x] `src/renderer/components/modal.ts` — showModal(), hideModal(), ESC + overlay kezelés
- [x] `src/renderer/components/form-helpers.ts` — createTextInput(), createTextarea(), createFormGroup(), createFormButtons()
- [x] `supporters.ts` — "Új támogató" modal form (név, cím, megjegyzés), szerkesztés gomb
- IPC: `supporters:create`, `supporters:get`, `supporters:update`

### 1.3 — Email/telefon kezelés ✅
- [x] `form-helpers.ts` bővítés — createContactEditor() (create form), createLiveContactList() (edit form)
- [ ] `supporters.ts` — email/telefon hozzáadás/törlés/elsődleges a create/edit formban
- IPC: `supporters:addEmail`, `supporters:removeEmail`, `supporters:addPhone`, `supporters:removePhone`

## 2. FÁZIS: Adományok oldal

### 2.1 — Lista + törlés
- [ ] `src/renderer/pages/donations.ts` — táblázat (támogató, összeg, pénznem, dátum, fizetési mód, hivatkozás)
- [ ] `formatters.ts` bővítés — formatCurrency()
- IPC: `donations:list`, `donations:delete`

### 2.2 — Létrehozás + szerkesztés
- [ ] `form-helpers.ts` bővítés — createSelect(), createDateInput(), createNumberInput()
- [ ] `donations.ts` — modal form (támogató dropdown, összeg, pénznem, dátum, fizetési mód, hivatkozás, megjegyzés)
- IPC: `donations:create`, `donations:get`, `donations:update`, `supporters:list`

### 2.3 — Szűrés
- [ ] `donations.ts` — szűrő sáv (támogató + dátum tartomány), összesítő sor
- IPC: `donations:bySupporter`, `donations:byDateRange`

## 3. FÁZIS: CSV Import

### 3.1 — CSV feltöltés és megjelenítés
- [ ] `src/shared/types/import.ts` — ParsedTransaction, TransactionMatch típusok
- [ ] `src/main/services/csv-parser.ts` — parseCSV()
- [ ] `src/main/ipc/import.ipc.ts` — import:parseCSV handler
- [ ] `ipc-channels.ts` bővítés — import csatornák
- [ ] `main.ts` — import IPC regisztráció
- [ ] `src/renderer/pages/import.ts` — file input, tranzakciós táblázat

### 3.2 — Kiválasztás + drag & drop
- [ ] `import.ts` — két paneles layout, checkbox + drag&drop, kiválasztott lista

### 3.3 — Párosítás + importálás
- [ ] `import.ts` — támogató select per tranzakció, új támogató inline, importálás gomb
- IPC: `supporters:list`, `supporters:create`, `donations:create`

## 4. FÁZIS: Export

### 4.1 — CSV export
- [ ] `src/shared/types/export.ts` — ExportOptions típus
- [ ] `src/main/services/csv-export.ts` — exportToCSV() (UTF-8 BOM)
- [ ] `src/main/ipc/export.ipc.ts` — export:csv handler
- [ ] `ipc-channels.ts` bővítés — export csatornák
- [ ] `main.ts` — export IPC regisztráció
- [ ] `src/renderer/pages/export.ts` — dátum tartomány form, Electron save dialog

### 4.2 — XLSX export
- [ ] `src/main/services/xlsx-export.ts` — ExcelJS workbook, formázott fejléc, oszlopszélességek
- [ ] `export.ipc.ts` bővítés — export:xlsx handler

## 5. FÁZIS: Jelentések

### 5.1 — Statisztika kártyák
- [ ] `src/renderer/components/stat-card.ts` — createStatCard()
- [ ] `src/renderer/pages/reports.ts` — összes támogató, összes adomány, összesített összeg, legutóbbi

### 5.2 — Top lista + megoszlás
- [ ] `reports.ts` — Top 10 támogató összeg szerint, fizetési módok megoszlása
