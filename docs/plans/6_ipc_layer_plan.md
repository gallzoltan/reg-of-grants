# Terv: 6. lépés - IPC réteg

## Kontextus

A backlog.md 6. lépése az IPC réteg felépítését írja le. A renderer process-nek szüksége van arra, hogy a main process-ben lévő adatbázis repo-kat elérje. Ehhez tipizált IPC csatornákat, main process handler-eket és egy preload contextBridge API-t kell létrehozni.

Az 5. lépésben elkészült a teljes adatbázis réteg (supporters.repo.ts, donations.repo.ts), most ezeket kell IPC-n keresztül elérhetővé tenni a renderer számára.

## Megközelítés

Típusbiztos IPC channel map mint single source of truth, `ipcMain.handle` a main process-ben, `contextBridge.exposeInMainWorld` a preload-ban.

## Létrehozandó/módosítandó fájlok

### 1. `src/shared/types/ipc-channels.ts` — Típusos channel map (ÚJ)

Egyetlen helyen definiáljuk az összes IPC csatornát, az input és output típusokkal:

```
supporters:create   → (CreateSupporterInput) → SupporterWithContacts
supporters:get      → (number) → SupporterWithContacts | null
supporters:list     → () → SupporterWithContacts[]
supporters:update   → (UpdateSupporterInput) → Supporter
supporters:delete   → (number) → void
supporters:addEmail    → ({supporter_id, email, is_primary?}) → SupporterEmail
supporters:removeEmail → (number) → void
supporters:addPhone    → ({supporter_id, phone, is_primary?}) → SupporterPhone
supporters:removePhone → (number) → void

donations:create        → (CreateDonationInput) → Donation
donations:get           → (number) → DonationWithSupporter | null
donations:list          → () → DonationWithSupporter[]
donations:update        → (UpdateDonationInput) → Donation
donations:delete        → (number) → void
donations:bySupporter   → (number) → Donation[]
donations:byDateRange   → ({from, to}) → DonationWithSupporter[]
```

A típus definíció egy `IpcChannelMap` interface lesz `[channel]: { input: T; output: R }` formában, amiből a preload és a handler is le tudja deriválni a típusokat.

### 2. `src/main/ipc/supporters.ipc.ts` — Supporters IPC handlers (ÚJ)

- `registerSupporterHandlers()` függvény
- Minden `supporters:*` csatornára `ipcMain.handle` regisztráció
- Meghívja a `supporters.repo` megfelelő függvényeit

### 3. `src/main/ipc/donations.ipc.ts` — Donations IPC handlers (ÚJ)

- `registerDonationHandlers()` függvény
- Minden `donations:*` csatornára `ipcMain.handle` regisztráció
- Meghívja a `donations.repo` megfelelő függvényeit

### 4. `src/preload/preload.ts` — contextBridge API (MÓDOSÍTÁS)

- `contextBridge.exposeInMainWorld('electronAPI', { invoke })`
- A `invoke` egy tipizált wrapper az `ipcRenderer.invoke` körül
- A renderer process `window.electronAPI.invoke('channel', data)` formában hívja

### 5. `src/main/main.ts` — IPC handler regisztráció (MÓDOSÍTÁS)

- Import és hívás: `registerSupporterHandlers()`, `registerDonationHandlers()` az `app.on('ready')` callback-ben

### 6. `src/shared/types/electron-env.d.ts` — Window típus kiegészítés (ÚJ)

- `window.electronAPI` típus deklaráció a renderer process számára

## Nem szükséges módosítani

- `vite.preload.config.ts` — nem kell `@shared` alias, mert a preload nem importálja közvetlenül a típusokat runtime-ban (csak type-level)
- Repo fájlok — változatlanok maradnak

## Verifikáció
- `npm start` → alkalmazás elindul hiba nélkül
- DevTools console-ban: `window.electronAPI` elérhető, `invoke` metódussal
- Teszt hívás console-ból: `await window.electronAPI.invoke('supporters:list')` → üres tömb (`[]`)
