# 2. Fázis: Adományok oldal - Implementációs terv

## Összefoglaló

Az adományok oldal teljes implementálása a meglévő supporters page mintái alapján. A backend (IPC, repo) már kész, csak a frontend szükséges.

## Módosítandó fájlok

| Fájl | Művelet | Leírás |
|------|---------|--------|
| `src/renderer/lib/formatters.ts` | Bővítés | `formatCurrency()` hozzáadása |
| `src/renderer/components/form-helpers.ts` | Bővítés | `createSelect()`, `createDateInput()`, `createNumberInput()` |
| `src/renderer/pages/donations.ts` | Új fájl | Teljes donations oldal |

## Részletes terv

### 1. lépés: formatters.ts bővítése

```typescript
formatCurrency(amount: number, currency: string): string
// Példa: 50000, 'HUF' → '50 000 HUF'
```
- Ezres elválasztó szóközzel
- Pénznem a végén

### 2. lépés: form-helpers.ts bővítése

**createSelect(id, options, opts)**
- Dropdown komponens
- Options: `{ value: string, label: string }[]`
- Opts: `value`, `required`, `placeholder`
- Tailwind: ugyanaz mint az input, de select elemre

**createDateInput(id, opts)**
- HTML5 date input (`type="date"`)
- Opts: `value`, `required`
- Tailwind: input stílus

**createNumberInput(id, opts)**
- HTML5 number input (`type="number"`)
- Opts: `value`, `required`, `min`, `step`
- Tailwind: input stílus

### 3. lépés: donations.ts - Lista megjelenítés

**Struktúra:**
```
┌─────────────────────────────────────────────────────┐
│ [Szűrő sáv]                                         │
│ Támogató: [dropdown] Dátum: [from] - [to] [Szűrés] │
├─────────────────────────────────────────────────────┤
│ Adományok                        [+ Új adomány]     │
├─────────────────────────────────────────────────────┤
│ Támogató │ Összeg │ Dátum │ Fiz.mód │ Hivatkozás │ │
├──────────┼────────┼───────┼─────────┼────────────┼─│
│ Kiss J.  │ 50 000 │ 2025. │ Átutalás│ ABC123     │ │
│          │   HUF  │ 01.15 │         │            │ │
└─────────────────────────────────────────────────────┘
│ Összesen: 150 000 HUF (3 adomány)                   │
└─────────────────────────────────────────────────────┘
```

**Oszlopok:** Támogató, Összeg, Dátum, Fizetési mód, Hivatkozás, Műveletek

**Funkciók:**
- `renderDonationsPage(container)` - fő belépési pont
- `loadDonations()` - adatok betöltése
- `renderTable(donations)` - táblázat renderelése
- `handleDelete(id)` - törlés confirm-mal

### 4. lépés: donations.ts - Create/Edit modal

**Create form mezők:**
- Támogató (select, required) - `supporters:list`-ből töltve
- Összeg (number, required)
- Pénznem (select: HUF, EUR, USD - default HUF)
- Dátum (date, required)
- Fizetési mód (select: Átutalás, Készpénz, Egyéb)
- Hivatkozás (text, optional)
- Megjegyzés (textarea, optional)

**Edit form:**
- Ugyanaz mint create, de előtöltve az adatokkal
- `donations:get` az adatok lekéréséhez

### 5. lépés: donations.ts - Szűrés

**Szűrő elemek:**
- Támogató dropdown (+ "Összes" opció)
- Dátum tartomány (from, to date inputok)
- Szűrés gomb + Törlés gomb

**Logika:**
- Ha támogató kiválasztva: `donations:bySupporter`
- Ha dátum tartomány: `donations:byDateRange`
- Ha mindkettő: kliens oldali szűrés a byDateRange eredményén
- Ha egyik sem: `donations:list`

**Összesítő sor:**
- Összes adomány száma
- Teljes összeg pénznemenként csoportosítva

## Használt IPC csatornák

- `donations:list` - összes adomány
- `donations:create` - új adomány
- `donations:get` - egy adomány lekérése
- `donations:update` - adomány módosítása
- `donations:delete` - adomány törlése
- `donations:bySupporter` - támogató adományai
- `donations:byDateRange` - dátum szerinti szűrés
- `supporters:list` - támogatók a dropdownhoz

## Verifikáció

1. `npm start` - alkalmazás indítása
2. Navigálás az "Adományok" oldalra
3. Tesztelendő:
   - Üres állapot megjelenik
   - Új adomány létrehozása (támogató kiválasztásával)
   - Lista frissül a létrehozás után
   - Szerkesztés modal megnyitása, adatok módosítása
   - Törlés confirm dialógussal
   - Szűrés támogató szerint
   - Szűrés dátum tartomány szerint
   - Összesítő sor helyes értékeket mutat
