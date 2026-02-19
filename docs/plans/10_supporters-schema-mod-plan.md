# Terv: supporters tábla bővítése

## Kontextus
A `supporters` adatbázis-táblát ki kell egészíteni két új mezővel (`cid`, `nickname`) és az eddigi egyetlen `address` szöveges mezőt fel kell bontani négy részre: `country`, `postcode`, `city`, `address`. Ez szükséges ahhoz, hogy a pénzügyi adminisztrátor részletesebb, strukturált lakcím-adatokat tárolhasson.

---

## Módosítandó fájlok

1. `src/main/database/schema.ts`
2. `src/shared/types/supporter.ts`
3. `src/main/database/supporters.repo.ts`
4. `src/renderer/pages/supporters.ts`

---

## 1. Migráció – `schema.ts`

Hozzáadni a `migrations` tömbhöz egy 2-es verziójú migrációt:

```sql
ALTER TABLE supporters ADD COLUMN cid TEXT;
ALTER TABLE supporters ADD COLUMN nickname TEXT;
ALTER TABLE supporters ADD COLUMN country TEXT;
ALTER TABLE supporters ADD COLUMN postcode TEXT;
ALTER TABLE supporters ADD COLUMN city TEXT;
```

> Az `address` oszlop megmarad, innentől csak az utca/házszám adatot tárolja.

---

## 2. TypeScript típusok – `supporter.ts`

**`Supporter` interface** – új mezők hozzáadása:
```typescript
cid: string | null;
nickname: string | null;
country: string | null;
postcode: string | null;
city: string | null;
```

**`CreateSupporterInput`** – új opcionális mezők:
```typescript
cid?: string;
nickname?: string;
country?: string;
postcode?: string;
city?: string;
```

**`UpdateSupporterInput`** – ugyanazok opcionálisan:
```typescript
cid?: string;
nickname?: string;
country?: string;
postcode?: string;
city?: string;
```

---

## 3. Repository – `supporters.repo.ts`

**`create()`** – INSERT bővítése:
```sql
INSERT INTO supporters (name, cid, nickname, country, postcode, city, address, notes)
VALUES (@name, @cid, @nickname, @country, @postcode, @city, @address, @notes)
```
A `transaction()` callback-ben az új mezők `?? null` értékkel kerülnek átadásra.

**`update()`** – a dinamikus `fields` építésnél az új mezők (`cid`, `nickname`, `country`, `postcode`, `city`) ugyanúgy kezelendők, mint a meglévő `address` és `notes`.

A `findById()` és `findAll()` `SELECT *`-ot használ, ezért automatikusan visszaadja az új oszlopokat – nincs változtatás szükséges.

---

## 4. Renderer oldal – `supporters.ts`

### Tábla fejléc
A „Cím" fejléc megmarad. A sorban `supporter.address || '—'` helyett formázott cím jelenik meg:
```
{postcode} {city}, {address}
```
(üres részek kihagyva)

### Create / Edit modal formok

Az egyetlen „Cím" mezőt lecseréli **5 mező**:
| Label | Input id | Megjegyzés |
|---|---|---|
| Azonosító (CID) | `supporter-cid` | opcionális |
| Becenév | `supporter-nickname` | opcionális |
| Ország | `supporter-country` | opcionális |
| Irányítószám | `supporter-postcode` | opcionális |
| Város | `supporter-city` | opcionális |
| Utca, házszám | `supporter-address` | opcionális (marad) |

A `createFormGroup` + `createTextInput` segédfüggvények újrafelhasználva (már használatban vannak a fájlban).

### Submit handler (create + edit)
Az IPC hívásban az új mezők átadása:
```typescript
cid: cidInput.value.trim() || undefined,
nickname: nicknameInput.value.trim() || undefined,
country: countryInput.value.trim() || undefined,
postcode: postcodeInput.value.trim() || undefined,
city: cityInput.value.trim() || undefined,
address: addressInput.value.trim() || undefined,
```

---

## Ellenőrzés

1. `npm start` – az app elindul, a migráció automatikusan lefut
2. Új támogató felvitelénél az összes új mező kitölthető és mentésre kerül
3. Szerkesztéskor a meglévő támogató adatai betöltődnek az új mezőkbe
4. A listában a cím formázottan jelenik meg
5. Meglévő adatok (migráció előtti sorok) `NULL` értékekkel szerepelnek az új oszlopokban – ez helyes viselkedés
