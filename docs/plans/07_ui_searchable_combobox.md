# Kereshető támogató-választó (Searchable Combobox)

## Kontextus

A támogató kiválasztás az adományok oldalon sima HTML `<select>` elemet használ. Sok támogató esetén a lista nehezen áttekinthető és lassú a keresés benne. Megoldás: kereshető legördülő lista (combobox), ahol a felhasználó gépelve szűrhet a támogatók neve alapján.

## Módosítandó fájlok

1. **`src/renderer/components/form-helpers.ts`** — Új `createSearchableSelect()` függvény és `SearchableSelect` interface
2. **`src/renderer/pages/donations.ts`** — 3 helyen csere: szűrősáv, új adomány modal, szerkesztés modal

## Megvalósítás

### 1. `SearchableSelect` interface (`form-helpers.ts`)

```typescript
export interface SearchableSelect {
  element: HTMLElement;       // Wrapper div — átadható createFormGroup()-nak
  get value(): string;        // Kiválasztott érték lekérése
  set value(val: string);     // Érték programozott beállítása
  onChange(cb: () => void): void;  // Változás callback
}
```

### 2. `createSearchableSelect()` függvény (`form-helpers.ts`)

**API** — kompatibilis a `createSelect()`-tel:
```typescript
export function createSearchableSelect(
  id: string,
  options: SelectOption[],
  opts?: { value?: string; required?: boolean; placeholder?: string }
): SearchableSelect
```

**DOM struktúra:**
```
div.relative                          ← wrapper (element)
  input[type="text"]                  ← keresőmező (+ pr-8 a chevronnak)
  span                                ← ▼ chevron ikon (pointer-events-none)
  ul.absolute.z-[60].hidden           ← legördülő lista (max-h-48, overflow-auto)
    li                                ← opciók
    li                                ← "Nincs találat" üzenet (ha nincs match)
```

**Működés:**
- **Megnyitás**: kattintás vagy fókusz a szövegmezőre → dropdown megjelenik, szöveg kijelölve
- **Szűrés**: gépelés → case-insensitive substring keresés a `label`-ekben → lista újrarajzolása
- **Kiválasztás**: kattintás egy opcióra VAGY Enter a kijelölt elemen → érték beállítása, dropdown bezárás
- **Billentyűzet**: ↑/↓ navigáció, Enter kiválasztás, Escape bezárás (stopPropagation, hogy a modal ne záródjon be), Tab bezárás
- **Kívülre kattintás**: document mousedown listener → bezárás (listener csak nyitott dropdown esetén él)
- **Opció mousedown**: `preventDefault()` a blur megakadályozásáért (hogy ne záródjon be mielőtt a kattintás érvényesül)
- **"Nincs találat"**: ha a szűrő nem ad eredményt, `"Nincs találat"` üzenet jelenik meg italic szürke szöveggel

**Fontos részletek:**
- `z-[60]` a dropdown-on, mert a modal overlay `z-50` — a lista a modal felett kell legyen
- Edit modálban (ahol van előre kiválasztott érték): az első fókusznál ne nyíljon meg automatikusan a dropdown, csak kattintásra vagy gépelésre
- A `value` setter megkeresi a megfelelő opciót és frissíti a megjelenített szöveget is

### 3. Csere a `donations.ts`-ben

**a) Szűrősáv (55. sor környéke):**
- `filterSupporterSelect: HTMLSelectElement` → `filterSupporterCombobox: SearchableSelect`
- `createSelect(...)` → `createSearchableSelect(...)` az "Összes támogató" opcióval
- A filter bar DOM-ban: `filterSupporterSelect` → `filterSupporterCombobox.element`
- `applyFilter()` (142. sor): `filterSupporterSelect.value` → `filterSupporterCombobox.value`
- `clearFilter()` (177. sor): `filterSupporterSelect.value = ''` → `filterSupporterCombobox.value = ''`

**b) Új adomány modal (251. sor):**
- `createSelect(...)` → `createSearchableSelect(...)`
- `createFormGroup('Támogató *', supporterSelect, ...)` → `createFormGroup('Támogató *', supporterCombobox.element, ...)`
- `supporterSelect.value` (278. sor) → `supporterCombobox.value`

**c) Szerkesztés modal (321. sor):**
- Ugyanaz mint az új adomány, de `value: String(donation.supporter_id)` opcióval az előre kiválasztáshoz

**Import frissítés (6-15. sor):**
- `createSelect` mellé: `createSearchableSelect, SearchableSelect`
- `createSelect` megmarad a currency és payment method select-ekhez

## Tesztelés

1. `npm start` — alkalmazás indítása
2. Adományok oldal → szűrősáv támogató mező: gépelés szűr, kiválasztás működik, "Törlés" gomb visszaállít
3. "+ Új adomány" → támogató mező: keresés, kiválasztás, form beküldés
4. Meglévő adomány "Szerkesztés" → támogató előre ki van választva, módosítható
5. Billentyűzet: ↑/↓/Enter/Escape működik, Escape nem zárja be a modalt ha a dropdown nyitva van
