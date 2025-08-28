# Flight Explorer ✈️🌍

## Purpose
Flight Explorer is a **REST API** and **web application** to explore airlines, airports, routes, and real-time weather data.  
Built with **Node.js**, **Express**, and **PostgreSQL**, it demonstrates backend development, API integration, and frontend visualization with an interactive map.

---

## 🚀 System Requirements
Before running the project locally, ensure the following dependencies are installed:

- **Node.js (v18 or later)** – Backend server runtime
- **npm (v9 or later)** – Package manager (comes with Node.js)
- **PostgreSQL (v13 or later)** – Relational database
- **Git** – For cloning the repository

Database setup:
- Create a database named `flight_explorer` (or update the `.env` file with your DB details).

---

## ⚙️ Installation Guide

### 1. Clone the Repository
```bash
git clone https://github.com/koushikachappidi-3/flight-explorer.git
cd flight-explorer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up PostgreSQL Database
Update your `.env` file with PostgreSQL credentials:
```env
PORT=8001
PGHOST=localhost
PGPORT=5432
PGDATABASE=flight_explorer
PGUSER=your_username
PGPASSWORD=your_password
```

### 4. Run Locally
```bash
npm start
```
Access at: [http://localhost:8001](http://localhost:8001)

---

## 🌐 API Endpoints

### Airlines
- `GET /airlines` → Retrieve all airlines or filter by name.
- `POST /airlines` → Add a new airline record.
- `DELETE /airlines/:id` → Remove an airline by ID.

### Airports & Routes
- Fetch airport details (code, name, city, country).
- Retrieve routes (source → destination + airline).

### Weather
- `GET /weather?lat=<latitude>&lon=<longitude>` → Current + forecasted weather data.

---

## 🖥️ Features & Walkthrough
1. **Explore Countries** → Shows airlines & airports by region.  
2. **Select an Airline** → Displays its routes.  
3. **Select an Airport** → Provides details + real-time weather.  
4. **Routes Originating/Arriving** → Lists connected destinations.  
5. **Airlines Flying Between Airports** → Shows operators on specific routes.  
6. **Distance Calculation** → Computes km between airports + plots on map.  

Interactive **map visualization** is built using **Leaflet.js**.

---

## 🛠️ Design Decisions
- **Backend:** Node.js + Express (REST API, async handling)
- **Database:** PostgreSQL (normalized tables, relational integrity)
- **Testing:** Python + pytest (unit, integration, and smoke tests)
- **Weather Data:** Open-Meteo API
- **Frontend:** Dropdown menus + interactive map visualization
- **Deployment:** `.env` configuration, AWS EC2, optional Docker

---

## ✅ Testing

### Run Full Test Suite
```bash
cd tests/
pytest
```

### Run Smoke Test
```bash
pytest smoke_test.py
```
Confirms server is up + core endpoints are working.

---

## 📸 Project Demo
The homepage provides:
- Dropdown menus to explore countries, airlines, airports, routes, and distances.  
- An **interactive map** showing airport locations & flight paths in real time.  

---

## 📌 Author
👤 **Koushika Chappidi**  
GitHub: [koushikachappidi-3](https://github.com/koushikachappidi-3)

