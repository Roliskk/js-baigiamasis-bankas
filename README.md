## Banko valdymo sistema

**Baigiamasis darbas – JavaScript programa (Vilnius Coding School)**  
Autorius: **Rolandas Jasilionis**  
Data: 2025-05-29

---

## Projekto paskirtis

Banko valdymo sistema, leidžianti:

- Kurti vartotojus ir klientus
- Saugoti klientų duomenis MongoDB duomenų bazėje
- Užtikrinti saugumą naudojant slaptažodžių šifravimą (`bcrypt`)
- Siųsti ir gauti duomenis naudojant `Express.js` REST API

---

## Naudotos technologijos

- **Node.js** – JavaScript vykdymo aplinka serveryje
- **Express.js** – įrankis kurti API maršrutus
- **MongoDB** – dokumentinė duomenų bazė
- **Mongoose** – leidžia lengviau kurti schemas ir jungtis prie MongoDB
- **Postman** – API testavimui (pvz., POST /api/register)
- **bcrypt** – slaptažodžių šifravimui
- **Git + GitHub** – versijų valdymui ir kodo dalijimuisi

---

## Paleidimas

1. Įsitikink, kad įdiegtas **Node.js** ir **MongoDB**
2. Terminale vykdyk šias komandas:

```bash
npm install
node index.js
---

## Neužbaigti darbai / Klaidų žurnalas

- POST `/api/register` maršrutas grąžina `Cannot POST /api/register`
  - Galimos priežastys: netinkamai įtrauktas `userRoutes.js` maršrutas, neaktyvus `registerUser` kontroleris, netikslus URL.
  - Būtina patikrinti: `app.use('/api', userRoutes)` ir ar `userRoutes.js` yra teisingai struktūruotas.

-  Neįgyvendintos funkcijos:
  - Kliento prisijungimas ir autentifikacija (login)
  - JWT ar kita saugi autentifikavimo sistema
  - Kliento informacijos atnaujinimas ir ištrynimas
  - Sąskaitų likučių peržiūra, pervedimai tarp klientų