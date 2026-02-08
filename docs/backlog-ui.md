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
- [x] `supporters.ts` — email/telefon hozzáadás/törlés/elsődleges a create/edit formban
- IPC: `supporters:addEmail`, `supporters:removeEmail`, `supporters:addPhone`, `supporters:removePhone`

## 2. FÁZIS: Adományok oldal

### 2.1 — Lista + törlés ✅
- [x] `src/renderer/pages/donations.ts` — táblázat (támogató, összeg, pénznem, dátum, fizetési mód, hivatkozás)
- [x] `formatters.ts` bővítés — formatCurrency()
- IPC: `donations:list`, `donations:delete`

### 2.2 — Létrehozás + szerkesztés ✅
- [x] `form-helpers.ts` bővítés — createSelect(), createDateInput(), createNumberInput()
- [x] `donations.ts` — modal form (támogató dropdown, összeg, pénznem, dátum, fizetési mód, hivatkozás, megjegyzés)
- IPC: `donations:create`, `donations:get`, `donations:update`, `supporters:list`

### 2.3 — Szűrés ✅
- [x] `donations.ts` — szűrő sáv (támogató + dátum tartomány), összesítő sor
- IPC: `donations:bySupporter`, `donations:byDateRange`

## 3. FÁZIS: CSV Import

### 3.1 — CSV feltöltés és megjelenítés ✅
- [x] `src/shared/types/import.ts` — ParsedTransaction típus
- [x] `src/main/services/csv-parser.ts` — parseTransactionCSV()
- [x] `src/main/ipc/import.ipc.ts` — import:selectFile, import:parseCSV handlerek
- [x] `ipc-channels.ts` bővítés — import csatornák
- [x] `main.ts` — import IPC regisztráció
- [x] `src/renderer/pages/import.ts` — file input, tranzakciós táblázat
- Szűrés: csak "Forint átutalás" és "Elektronikus bankon belüli átutalás", pozitív összegek

### 3.2 — Kiválasztás ✅
- [x] `import.ts` — egyszerű checkbox kiválasztás (drag & drop helyett)
- [x] Összes kijelölése / törlése gombok

### 3.3 — Párosítás + importálás ✅
- [x] `import.ts` — támogató dropdown soronként, "Új támogató..." opció inline modal-lal
- [x] Importálás gomb: donations:create hívás minden kijelölt+hozzárendelt sorra
- IPC: `supporters:list`, `supporters:create`, `donations:create`

## 4. FÁZIS: Export

### 4.1 — CSV export
- [x] `src/shared/types/export.ts` — ExportOptions típus
- [x] `src/main/services/csv-export.ts` — exportToCSV() (UTF-8 BOM)
- [x] `src/main/ipc/export.ipc.ts` — export:csv handler
- [x] `ipc-channels.ts` bővítés — export csatornák
- [x] `main.ts` — export IPC regisztráció
- [x] `src/renderer/pages/export.ts` — dátum tartomány form, Electron save dialog

### 4.2 — XLSX export
- [x] `src/main/services/xlsx-export.ts` — ExcelJS workbook, formázott fejléc, oszlopszélességek
- [x] `export.ipc.ts` bővítés — export:xlsx handler

## 5. FÁZIS: Jelentések

### 5.1 — Statisztika kártyák
- [x] `src/renderer/components/stat-card.ts` — createStatCard()
- [x] `src/renderer/pages/reports.ts` — összes támogató, összes adomány, összesített összeg, legutóbbi

### 5.2 — Top lista + megoszlás
- [ ] `reports.ts` — Top 10 támogató összeg szerint, fizetési módok megoszlása
