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

## Előfeltételek

- **Node.js** (v18+) és **npm**
- **Windows** és **Linux** (.deb, .rpm) támogatott

### Linux

A `better-sqlite3` natív modul fordításához szükséges csomagok:

```bash
# Debian/Ubuntu
sudo apt install build-essential python3

# Fedora/RHEL
sudo dnf groupinstall "Development Tools"
sudo dnf install python3
```

Telepítés után a natív modul újrafordítása:

```bash
npx electron-rebuild -f -w better-sqlite3
```

## Funkciók

- Támogatók rögzítése és listázása (név, cím, email, telefon)
- Adományok rögzítése és listázása támogatónként
- Banki tranzakciós CSV importálás
- Exportálás CSV és XLSX formátumban
