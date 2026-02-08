# Telepíthető csomag készítése + dokumentáció

## Context

Az alkalmazás fejlesztése befejeződött (1-5. fázis kész). A program jelenleg csak `npm start`-tal futtatható fejlesztői módban. A cél: működő telepítők készítése Linux (.deb, .rpm) és Windows (Squirrel) platformokra, valamint a README frissítése telepítési útmutatóval.

**Fontos felfedezés:** Az `exceljs` csomag a `vite.main.config.ts`-ben `external`-ként van jelölve, de a `packageAfterCopy` hook nem másolja be a csomagolt alkalmazásba. Ez azt jelenti, hogy az XLSX export jelenleg NEM működik csomagolt buildben. Javítandó.

## Módosítandó fájlok

### 1. `vite.main.config.ts` — exceljs bundling javítás
- Az `exceljs` eltávolítása az `external` tömbből (pure JS modul, Vite simán bundleli)
- Csak `better-sqlite3` marad external (natív modul, szükségszerűen)

### 2. `package.json` — metaadatok frissítése
- `productName`: `"barbi-szta"` → `"Támogatás nyilvántartó"`
- `author`: `"Gáll Zoltán"` hozzáadása
- `name` marad `"barbi-szta"` (npm/Squirrel belső azonosító, ASCII kell)

> **Megjegyzés:** A `productName` változtatás megváltoztatja a `userData` könyvtárat (`~/.config/barbi-szta/` → `~/.config/Támogatás nyilvántartó/`). Mivel friss alkalmazásról van szó, ez elfogadható.

### 3. `forge.config.ts` — maker konfiguráció
**packagerConfig** kiegészítés:
- `executableName: 'tamogatas-nyilvantarto'` (fájlrendszer-biztos név)

**MakerSquirrel:**
- `authors`, `description` megadása

**MakerDeb:**
- `name`, `productName`, `genericName`, `description`, `productDescription`
- `categories: ['Office', 'Utility']`, `section: 'utils'`
- `maintainer`, `homepage`

**MakerRpm:**
- Hasonló mezők mint a MakerDeb + `license: 'MIT'`

### 4. `README.md` — átírás magyar nyelven
- Funkciók leírása (felül)
- **Telepítés** szekció: Windows (.exe), Linux .deb (`dpkg`), Linux .rpm (`dnf`)
- **Fejlesztőknek** szekció: tech stack, előfeltételek, fejlesztés, telepítő készítése
- Licenc

## Ellenőrzés
1. `npm start` — fejlesztői mód továbbra is működik
2. XLSX export tesztelése fejlesztői módban
3. `npm run make` — .deb telepítő elkészül az `out/make/deb/x64/` könyvtárban
4. Telepítés tesztelése: `sudo dpkg -i <fájl>.deb`, alkalmazás indul, export működik
