# Támogatás nyilvántartó

Asztali alkalmazás alapítványi támogatók és adományok nyilvántartásához. Pénzügyi adminisztrátorok számára készült, adományozói nyilvántartás kezelésére, banki tranzakciók importálására és riportok exportálására.

## Funkciók

- Támogatók kezelése (név, cím, email, telefon, megjegyzés)
- Adományok rögzítése és listázása támogatónként
- Banki tranzakciós CSV importálás automatikus támogató-felismeréssel
- Exportálás CSV és XLSX formátumban
- Statisztikai riportok (összesítők, top 10 támogató, fizetési mód eloszlás)

## Telepítés

### Windows

1. Töltsd le a legújabb `.exe` telepítőt a [Releases](https://github.com/gallz/reg-of-grants/releases) oldalról
2. Futtasd a telepítőt — az alkalmazás automatikusan elindul

### Linux (Debian/Ubuntu)

```bash
sudo dpkg -i tamogatas-nyilvantarto_1.0.0_amd64.deb
```

### Linux (Fedora/RHEL)

```bash
sudo dnf install tamogatas-nyilvantarto-1.0.0-1.x86_64.rpm
```

## Fejlesztőknek

### Tech stack

- **Electron Forge + Vite + TypeScript** — asztali alkalmazás keretrendszer
- **better-sqlite3** — lokális adatbázis (WAL mód, foreign key-ek)
- **Tailwind CSS v4** — megjelenés
- **ExcelJS** — XLSX export
- **Vanilla DOM** — nincs frontend keretrendszer, tiszta TypeScript

### Előfeltételek

- **Node.js** (v18+) és **npm**
- Linux: a `better-sqlite3` natív modul fordításához szükséges build eszközök:

```bash
# Debian/Ubuntu
sudo apt install build-essential python3

# Fedora/RHEL
sudo dnf groupinstall "Development Tools"
sudo dnf install python3
```

### Fejlesztés

```bash
npm install
npx electron-rebuild -f -w better-sqlite3
npm start
```

### Telepítő készítése

```bash
# Linux (.deb, .rpm)
npm run make

# A telepítők az out/make/ könyvtárban jönnek létre
```

## Licenc

MIT
