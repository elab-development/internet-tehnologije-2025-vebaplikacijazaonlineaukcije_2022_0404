# Auctions Platform

## 📌 Opis aplikacije

Auctions Platform je fullstack web aplikacija za upravljanje online
aukcijama. Korisnici mogu da se registruju kao prodavci ili kupci,
kreiraju aukcije, postavljaju ponude (bids), prate trenutnog lidera
aukcije i upravljaju svojim profilom.

Administratorski deo aplikacije omogućava pregled statistike sistema,
uključujući KPI metrike i grafičke prikaze podataka (broj aukcija,
bidova, prihoda i sl.).

---

## 🛠 Tehnologije

### Frontend

- React (Vite)
- Zustand (state management)
- React Router
- Tailwind CSS
- Recharts (vizualizacija podataka)
- Vitest + React Testing Library (testiranje)

### Backend

- Laravel (PHP 8.2)
- MySQL 8
- REST API (JSON komunikacija)
- Laravel Sanctum (autentifikacija)

### DevOps

- Docker
- Docker Compose
- GitHub Actions (CI/CD)

---

## ▶️ Lokalno pokretanje (bez Dockera)

### 1. Backend

```bash
cd server
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Backend će biti dostupan na: http://localhost:8000

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Frontend će biti dostupan na: http://localhost:5173

---

## 🐳 Pokretanje pomoću Docker-a

Aplikacija je u potpunosti dockerizovana i može se pokrenuti jednom
komandom.

### 1. Build i pokretanje svih servisa

```bash
docker compose up --build -d
```

Servisi koji se pokreću: - MySQL baza (port 3306) - phpMyAdmin
(http://localhost:8080) - Laravel backend (http://localhost:8000) -
React frontend (http://localhost:5173)

### 2. Praćenje logova

```bash
docker compose logs -f
```

### 3. Gašenje servisa

```bash
docker compose down
```

### 4. Gašenje i brisanje baze (reset podataka)

```bash
docker compose down -v
```

---

## 🧪 Pokretanje testova

Frontend testovi se pokreću pomoću Vitest-a:

```bash
cd client
npm run test
```

Za jednokratno pokretanje (CI stil):

```bash
npx vitest run
```

---

## 🔁 CI/CD

CI/CD pipeline je implementiran pomoću GitHub Actions. Na svaki push ili
pull request ka granama `main` i `development`:

1.  Pokreću se frontend testovi
2.  Gradi se Docker image za backend i frontend
3.  Validira se docker-compose konfiguracija

---

## 📦 Struktura projekta

    root/
    │
    ├── client/            # React frontend
    ├── server/            # Laravel backend
    ├── docker-compose.yml
    └── README.md

---
