# 3. Fázis: CSV Import - Implementációs terv

## Összefoglaló

Banki tranzakciós CSV fájl importálása, ahol a felhasználó kiválasztja a releváns tranzakciókat és hozzárendeli őket támogatókhoz.

## CSV Formátum (elemzés alapján)

```
Típus;Könyvelés dátuma;Értéknap;Azonosító;Összeg;Közlemény/1;Közlemény/2;Közlemény/3;Közlemény/4
```

**Szűrési feltételek:**
- Típus = "Forint átutalás" VAGY "Elektronikus bankon belüli átutalás"
- Összeg pozitív (bevétel, nem kiadás)

**Mező megfeleltetések:**
| CSV mező | Donation mező | Megjegyzés |
|----------|---------------|------------|
| Könyvelés dátuma | donation_date | "2025.11.17., hétfő" → "2025-11-17" |
| Azonosító | reference | GNB25K1700022023 |
| Összeg | amount | "+7 000,00 HUF" → 7000 |
| Közlemény/1 | source | Számlaszám |
| Közlemény/2 | (supporter hint) | Általában a támogató neve |
| Közlemény/3,4 | notes | Összefűzve |
| - | payment_method | Mindig "Átutalás" |
| - | currency | Mindig "HUF" |

## Módosítandó/létrehozandó fájlok

| Fájl | Művelet | Leírás |
|------|---------|--------|
| `src/shared/types/import.ts` | Új | ParsedTransaction típus |
| `src/shared/types/ipc-channels.ts` | Bővítés | import:* csatornák |
| `src/main/services/csv-parser.ts` | Új | parseTransactionCSV() |
| `src/main/ipc/import.ipc.ts` | Új | IPC handlerek |
| `src/main/main.ts` | Bővítés | registerImportHandlers() |
| `src/preload/preload.ts` | - | Nem kell, generikus invoke |
| `src/renderer/pages/import.ts` | Átírás | Teljes import oldal |

## Részletes terv

### 1. lépés: Típusok (src/shared/types/import.ts)

```typescript
interface ParsedTransaction {
  id: string;              // Egyedi ID a CSV sorhoz
  type: string;            // Típus mező
  date: string;            // ISO dátum (YYYY-MM-DD)
  reference: string;       // Azonosító
  amount: number;          // Összeg számként
  source: string;          // Közlemény/1
  supporterHint: string;   // Közlemény/2 (név hint)
  notes: string;           // Közlemény/3+4 összefűzve
  rawLine: string;         // Eredeti sor debughoz
}

interface ImportResult {
  success: boolean;
  donationId?: number;
  error?: string;
}
```

### 2. lépés: CSV Parser (src/main/services/csv-parser.ts)

```typescript
parseTransactionCSV(filePath: string): ParsedTransaction[]
```

**Működés:**
1. CSV betöltésekor lekérdezi a már létező reference értékeket az adatbázisból
2. Kiszűri a már importált tranzakciókat a listából
3. Az összesítőben mutatja: "Már importált: X"
4. Ha minden tranzakció már importálva van: "Minden tranzakció már importálva van (X kihagyva)"

  Így a felhasználó bármikor újratöltheti a CSV-t és folytathatja az importálást onnan, ahol abbahagyta.

**Logika:**
1. Fájl beolvasása (UTF-8, lehet BOM)
2. `;` elválasztó
3. Header sor kihagyása
4. Szűrés: csak "Forint átutalás" és "Elektronikus bankon belüli átutalás"
5. Szűrés: csak pozitív összegek
6. Dátum parse: "2025.11.17., hétfő" → "2025-11-17"
7. Összeg parse: "+7 000,00 HUF" → 7000

### 3. lépés: IPC Handler (src/main/ipc/import.ipc.ts)

**Csatornák:**
- `import:parseCSV` - fájl útvonal → ParsedTransaction[]
- `import:selectFile` - Electron dialog → fájl útvonal vagy null

### 4. lépés: Import oldal UI

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│ CSV Fájl: [________________] [Tallózás...]                 │
├────────────────────────────────────────────────────────────┤
│ Tranzakciók (45 db, ebből 42 importálható)                 │
├────────────────────────────────────────────────────────────┤
│ ☑ │ Dátum     │ Összeg    │ Név hint        │ Támogató ▼  │
├───┼───────────┼───────────┼─────────────────┼─────────────┤
│ ☑ │ 2025.11.17│ 7 000 HUF │ ADORJÁN RÓBERT  │ [Válassz...│
│ ☑ │ 2025.11.17│ 5 000 HUF │ KISS ZOLTÁN     │ [Válassz...│
│ ☐ │ 2025.11.17│ 10 000 HUF│ CITIBANK...     │ [Válassz...│
└───┴───────────┴───────────┴─────────────────┴─────────────┘
│ [Összes kijelölése] [Kijelölés törlése]                    │
├────────────────────────────────────────────────────────────┤
│ Kiválasztva: 12 tranzakció, 85 000 HUF                     │
│                                    [Importálás indítása]   │
└────────────────────────────────────────────────────────────┘
```

**Funkciók:**
1. **Fájl kiválasztás**: Electron dialog-gal
2. **Táblázat**: Checkbox + dátum + összeg + név hint + támogató dropdown
3. **Támogató dropdown**: Meglévő támogatók + "Új támogató..." opció
4. **Új támogató**: Inline vagy modal, azonnal létrehozza
5. **Importálás**: Végigmegy a kiválasztott sorokon, donations:create

### 5. lépés: Importálás folyamat

1. Felhasználó kijelöli a sorokat (checkbox)
2. Minden kijelölt sorhoz támogatót rendel
3. "Importálás" gombra kattint
4. Rendszer végigmegy a sorokon:
   - Ha nincs támogató kiválasztva → kihagyja/hibaüzenet
   - Ha van → donations:create hívás
5. Eredmény összesítő: X sikeres, Y hibás

## IPC Csatornák bővítése

```typescript
// ipc-channels.ts
'import:selectFile': { input: void; output: string | null };
'import:parseCSV': { input: string; output: ParsedTransaction[] };
```

## Verifikáció

1. `npm start`
2. Navigálás az "Importálás" oldalra
3. Tesztelendő:
   - Tallózás gomb megnyitja a fájl dialogot
   - CSV betöltése után táblázat megjelenik
   - Csak a releváns tranzakciók látszanak (átutalások, pozitív összeg)
   - Checkbox-szal kijelölhetők a sorok
   - Támogató dropdown működik
   - "Új támogató" opció létrehozza a támogatót
   - Importálás létrehozza a donation rekordokat
   - Sikeres import után összesítő jelenik meg
