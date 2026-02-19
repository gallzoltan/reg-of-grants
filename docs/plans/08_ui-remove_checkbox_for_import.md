# Checkbox eltávolítása az import oldalról

## Kontextus

Az import oldalon jelenleg két lépésben kell kiválasztani az importálandó tranzakciókat: (1) checkbox-szal kijelölni, (2) támogatót hozzárendelni. Ez feleslegesen bonyolult — elég, ha egy tranzakció importálásra kerül, amikor támogató van hozzárendelve.

## Módosítandó fájl

**`src/renderer/pages/import.ts`**

## Változások

### 1. `selectedIds` eltávolítása
- **14. sor**: `let selectedIds: Set<string> = new Set();` — törlés
- **128. sor** (`loadCSV`): `selectedIds.clear();` — törlés

### 2. Táblázat fejléc — checkbox oszlop törlése
- **60. sor**: `el('th', { className: 'px-3 py-3 w-10' }, [])` — törlés
- **115. sor, 155. sor**: `colspan: '6'` → `colspan: '5'` (üres állapot sorok)

### 3. `createTransactionRow()` — checkbox törlése
- **166–178. sor**: Teljes checkbox létrehozás és event listener törlése
- **213. sor**: `el('td', ... [checkbox])` — törlés a return-ből

### 4. Kijelölés gombok és függvények törlése
- **73–86. sor**: `selectAllBtn`, `deselectAllBtn`, `selectionControls` — törlés
- **111. sor**: `container.appendChild(selectionControls)` — törlés
- **`selectAll()`** függvény — törlés
- **`deselectAll()`** függvény — törlés

### 5. `updateSummary()` — logika egyszerűsítés
- Jelenleg: `selectedIds` alapján szűr, külön mutatja a kiválasztottat és a támogatóval rendelkezőt
- Új logika: a támogatóhoz rendelt tranzakciók = importálandó tranzakciók
```typescript
function updateSummary(): void {
  const assignedTransactions = transactions.filter((t) => supporterAssignments.has(t.id));
  const totalAmount = assignedTransactions.reduce((sum, t) => sum + t.amount, 0);

  let text = `Tranzakciók: ${transactions.length}`;
  if (assignedTransactions.length > 0) {
    text += ` | Importálandó: ${assignedTransactions.length}, ${formatCurrency(totalAmount, 'HUF')}`;
  }
  if (skippedCount > 0) {
    text += ` | Már importált: ${skippedCount}`;
  }
  summaryContainer.textContent = text;

  importBtn.disabled = assignedTransactions.length === 0;
}
```

### 6. `startImport()` — selectedIds hivatkozások törlése
- **294. sor**: `selectedIds.has(t.id) && supporterAssignments.has(t.id)` → `supporterAssignments.has(t.id)`
- **296. sor**: Alert szöveg frissítés (nem kell "válassz ki" utalás)
- **326. sor**: `selectedIds.delete(t.id)` — törlés

## Tesztelés

1. `npm start` — alkalmazás indítása
2. Import oldal → CSV betöltés → nincs checkbox oszlop, nincs "Összes kijelölése" / "Kijelölés törlése" gomb
3. Támogató hozzárendelés → summary frissül, import gomb aktívvá válik
4. Importálás → csak a támogatóval rendelkező tranzakciók kerülnek importálásra
