# Electron Forge Maker Options

A `forge.config.ts` fájlban a `makers` tömb elemeinél konfigurálhatók.

---

## MakerSquirrel (Windows)

`new MakerSquirrel({...})`

| Opció | Tipus | Leiras |
|---|---|---|
| `name` | string | Windows App Model ID |
| `title` | string | NuGet csomag cime |
| `authors` | string | Szerzo(k) |
| `owners` | string | Tulajdonos(ok) |
| `description` | string | Leiras |
| `version` | string | Verzio |
| `copyright` | string | Szerzoi jog |
| `exe` | string | Fo `.exe` fajlnev |
| `setupExe` | string | A generalt Setup.exe neve |
| `setupMsi` | string | A generalt Setup.msi neve |
| `setupIcon` | string | ICO fajl a Setup.exe-hez |
| `iconUrl` | string | Publikus URL egy ICO fajlhoz (Vezerlopult ikon) |
| `loadingGif` | string | GIF fajl a telepites kozben |
| `noMsi` | boolean | Ne generaljon MSI-t |
| `noDelta` | boolean | Ne generaljon delta csomagokat |
| `certificateFile` | string | Kodaleiro tanusitvany |
| `certificatePassword` | string | Tanusitvany jelszo |
| `windowsSign` | object | Reszletes kodaleiras konfig |
| `remoteReleases` | string | URL a delta frissitesekhez |
| `fixUpPaths` | boolean | Reszletesebb installer fajlnev |
| `frameworkVersion` | string | .NET framework verzio |

---

## MakerDeb (Linux .deb)

`new MakerDeb({ options: {...} })` — az opciokat az `options` objektumba kell csomagolni.

| Opcio | Tipus | Leiras |
|---|---|---|
| `name` | string | Csomagnev (kisbetus, pl. `barbi-szta`) |
| `productName` | string | Alkalmazasnev (pl. `Tamogatas Nyilvantarto`) |
| `genericName` | string | Altalanos nev (pl. `Database Application`) |
| `description` | string | Rovid leiras |
| `productDescription` | string | Hosszu leiras |
| `version` | string | Verzio |
| `revision` | string | Revizio |
| `section` | string | Szekcio (pl. `utils`, `office`, `database`) |
| `priority` | string | `optional`, `standard`, `important`, `required` |
| `depends` | string[] | Fuggosegek |
| `maintainer` | string | Karbantarto |
| `homepage` | string | Honlap URL |
| `icon` | string | Ikon fajl eleresi ut |
| `categories` | string[] | Pl. `['Office', 'Utility']` |
| `mimeType` | string[] | MIME tipusok |
| `bin` | string | Futtathato fajl eleresi utja |
| `scripts` | object | `preinst`, `postinst`, `prerm`, `postrm` scriptek |
| `desktopTemplate` | string | Egyedi `.desktop` sablon |

---

## MakerRpm (Linux .rpm)

`new MakerRpm({ options: {...} })` — az opciokat az `options` objektumba kell csomagolni.

| Opcio | Tipus | Leiras |
|---|---|---|
| `name` | string | Csomagnev |
| `productName` | string | Alkalmazasnev |
| `genericName` | string | Altalanos nev |
| `description` | string | Rovid leiras |
| `productDescription` | string | Hosszu leiras |
| `version` | string | Verzio |
| `revision` | string | Revizio |
| `license` | string | Licensz |
| `group` | string | Csoport |
| `requires` | string[] | Fuggosegek |
| `homepage` | string | Honlap URL |
| `icon` | string | Ikon fajl eleresi ut |
| `categories` | string[] | Pl. `['Office']` |
| `mimeType` | string[] | MIME tipusok |
| `bin` | string | Futtathato fajl eleresi utja |
| `compressionLevel` | 0-9 | Tomoritesi szint |
