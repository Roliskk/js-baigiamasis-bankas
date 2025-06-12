
# 💳 Baigiamasis JavaScript projektas – Bankinė sistema

Šis projektas sukurtas kaip **baigiamasis darbas** Ilguosiuose JavaScript kursuose (Vilnius Coding School).  
Tai paprasta **banko valdymo sistema**, sukurta naudojant **Node.js, Express, MongoDB ir HTML/CSS/JS**.

## 🔗 GitHub Repo
https://github.com/Roliskk/js-baigiamasis-bankas.git

## 🧩 Funkcionalumas

✅ Registracija ir prisijungimas su vartotojo vaidmenimis:  
- **admin** – gali kurti vartotojus ir sąskaitas bei pildyti jas.  
- **user** – gali matyti transakcijų istoriją (kai sistema pilnai veikia).

 Admin gali:
- Prisijungti.
- Sukurti naujus vartotojus, suvedant jų duomenis ir įkeliant pas kopiją
- Kurti banko sąskaitas, priskiriant jas konkrečiam vartotojui.

⚠️ Kol kas nebaigta:
- Vartotojas **nemato savo sąskaitų**, todėl **negali atlikti pavedimų**.

## Naudotos technologijos

- **Frontend:** HTML, CSS, JS
- **Backend:** Node.js + Express
- **Duomenų bazė:** MongoDB
- **Autentifikacija:** JWT tokenai ir localStorage

##  Paleidimo instrukcija (lokaliai)

1. **Klonuoti repozitoriją:**
   ```bash
   git clone https://github.com/Roliskk/js-baigiamasis-bankas.git
   ```

2. **Įeiti į projekto katalogą:**
   ```bash
   cd js-baigiamasis-bankas
   ```

3. **Įdiegti priklausomybes:**
   ```bash
   npm install
   ```

4. **Paleisti serverį:**
   ```bash
   npm start
   ```

5. **Atsidaryti naršyklėje:**
   ```
   http://localhost:8000
   ```

## 📂 Failų struktūra

## ✨ Kūrėjas

Autorius: **Rolandas Jasilionis**  
Kursas: **JavaScript (Vilnius Coding School)**  
Data: **2025 m. birželis**

---

> Pastaba: tai mokomasis projektas. Kai kurios funkcijos dar kuriamos.  
> Tikslas – išmokti pilną „stacką“: nuo registracijos iki duomenų bazės ir API naudojimo.
