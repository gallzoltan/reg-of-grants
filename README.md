# Támogatás nyilvántartó

Electron asztali alkalmazás alapítványi támogatók és adományok nyilvántartásához.

## Tech stack

- Electron Forge + Vite + TypeScript
- better-sqlite3 (lokális adatbázis, WAL mód)
- Tailwind CSS v4
- ExcelJS (XLSX export)

## Fejlesztés

```bash
npm start          # Alkalmazás indítása fejlesztői módban
npm run package    # Csomagolás terjesztéshez
npm run make       # Telepítő készítése
```

## Funkciók

- Támogatók rögzítése és listázása (név, cím, email, telefon)
- Adományok rögzítése és listázása támogatónként
- Banki tranzakciós CSV importálás
- Exportálás CSV és XLSX formátumban
