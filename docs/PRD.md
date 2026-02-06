# Termékfejlesztési Dokumentáció (PRD)
## 1. Termék áttekintése
### Termék neve: "Támogatás nyílvántartó"
### Rövid leírás
A termék célja egy alapítvány pénzügyi támogatóinak és támogatásaiknak a nyílvántartása. 
### Célközönség: 
A programot a pénzügyi adminisztrátor fogja használni.

## 2. Célok
### Fő célok: 
időtakarékosság, automatizálás, egyszerűsítés

## 3. Funkcionális követelmények
### Fő funkciók: 
Támogatók rögzítése/listázása, Támogatások rögzítése/listázása, exportálás (csv, xlsx) formátumban
### Használati esetek: 
- A felhasználó feltölt egy banki tranzakciós CSV-t, amit megjeleník egy listában, 
rendszer lehetővé teszi, hogy a felhasználó kiválassza a releváns támogatásokat és a kiválasztott támogatást drag and drop belehúzza egy kiválasztott listába.
A kiválasztott listában levő támogatásokat a felhasználó egyesével össze tudja rendelni egy támogatóval.
- A felhasználó egy űrlapon rögzít egy támogatót (név, cím, email, telefon).
- A felhasználó egy űrlapon rögzít egy támogatást egy támogatóhoz időpont adatokkal.
- A felhasználó kiválaszt egy időszakot és exportálja egy csv, vagy excel fájlba.

## 4. Nem funkcionális követelmények
### Technikai korlátok: 
Electron + better-sqlite3
### Teljesítmény: 
Várható terhelés havi 50-100 tranzakció, 
Napi-heti listázás

## 5. Felhasználói felület (UI) követelmények
### Fontos UI elemek: 
Tailwind CSS
