# Adományok és Export oldalak összevonása

## Kontextus

Az export oldal (`src/renderer/pages/export.ts`, 72 sor) minimális funkcionalitást tartalmaz: 2 dátum mező és 2 gomb (CSV/XLSX). Az adományok oldal (`src/renderer/pages/donations.ts`) már rendelkezik dátumtól/dátumig szűrőkkel. Az összevonás természetesebb workflow-t ad (szűrés → átnézés → export) és egyszerűsíti a navigációt.

## Változtatások

### 1. `src/renderer/pages/donations.ts` — Export gombok hozzáadása a szűrősávba

- A szűrősáv gombjai (`Szűrés` / `Törlés`) mellé kerül egy **"CSV export"** és egy **"XLSX export"** gomb
- Az export az aktuális `filterFromInput` és `filterToInput` értékekkel hívja az `export:csv` / `export:xlsx` IPC channelt
- Az `export.ts`-ből átemeljük a `doExport()` logikát (channel hívás, success/error feedback)
- A feedback az összesítő sor (`summaryContainer`) alá kerül egy ideiglenes status div-be

Szűrősáv gombok elrendezése:
```
[Szűrés] [Törlés]  |  [CSV export] [XLSX export]
```
A két csoportot vizuálisan elválasztjuk (pl. `ml-auto` vagy `border-l`).

### 2. `src/renderer/pages/export.ts` — Törlés

- A fájl teljes törlése.

### 3. `src/renderer/renderer.ts` — Export route eltávolítása

- Törölni: `import { renderExportPage }` és az `export` route regisztráció

### 4. `src/renderer/components/navigation.ts` — Export menüpont eltávolítása

- Törölni: `{ id: 'export', label: 'Exportálás', icon: '&#8680;' }` a `navItems` tömbből

## Érintett fájlok

| Fájl | Művelet |
|------|---------|
| `src/renderer/pages/donations.ts` | Módosítás (export gombok + logika) |
| `src/renderer/pages/export.ts` | Törlés |
| `src/renderer/renderer.ts` | Módosítás (export route eltávolítás) |
| `src/renderer/components/navigation.ts` | Módosítás (menüpont eltávolítás) |

## Ellenőrzés

1. `npm start` — Az app elindul, a navigációban 4 menüpont van (Támogatók, Adományok, Importálás, Jelentések)
2. Adományok oldal — A szűrősávban megjelennek a CSV/XLSX export gombok
3. Export teszt — Dátum szűrőket beállítani, CSV/XLSX exportra kattintani → fájl mentés dialog, sikeres üzenet
4. Export szűrő nélkül — Üresen hagyott dátumokkal is működik (összes adomány exportálása)
