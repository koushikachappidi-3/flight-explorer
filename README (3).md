# Flight Explorer

## Table of Contents
- [Purpose](#purpose)
- [System Requirements](#system-requirements)
- [Installation Guide](#installation-guide)
- [Features and Project Walkthrough](#features-and-project-walkthrough)
- [Design Decisions](#design-decisions)
- [Testing](#testing)

---

## Purpose
Flight Explorer is a REST API and web application to explore airlines, airports, routes, and real-time weather data. Built with Node.js, Express, and PostgreSQL, it demonstrates backend development, API integration, and frontend visualization with an interactive map.

---

## System Requirements

**Prerequisite:**  
Before running the project locally, make sure the following dependencies are installed and configured:

- **Node.js (v18 or later)** – Required for running the backend server with Express.
- **npm (v9 or later)** – Comes bundled with Node.js and is used to install project dependencies.
- **PostgreSQL (v13 or later)** – Relational database used to store airlines, airports, and route data.  
  - Ensure PostgreSQL is running locally or remotely.  
  - Create a database named `flight_explorer` (or update the `.env` file with your own DB name).
- **Git** – Required to clone the repository and manage version control.

👉 To install Node.js on Windows/Mac/Linux, go to the official [Node.js download page](https://nodejs.org/). Download the LTS version executable and run it on your machine.

---

## Installation Guide

### Clone the Repository
```bash
git clone https://github.com/koushikachappidi-3/flight-explorer.git
cd flight-explorer
```

### Install Dependencies
Make sure you have Node.js and npm installed. If not, run:
```bash
npm install
```

### Set Up PostgreSQL Database
Create a new PostgreSQL database (default name: `flight_explorer`).  
Update your `.env` file with your PostgreSQL credentials:
```env
PORT=8001
PGHOST=localhost
PGPORT=5432
PGDATABASE=flight_explorer
PGUSER=your_username
PGPASSWORD=your_password
```

### Run Locally
```bash
npm start
```
Access at: [http://localhost:8001](http://localhost:8001)

### Test the API
Use Postman or curl to test endpoints such as:
- `GET /airlines`
- `POST /airlines`
- `DELETE /airlines/:id`

---

## Features and Project Walkthrough

### Airline Management
| Endpoint             | Method | Description                         |
|----------------------|--------|-------------------------------------|
| `/airlines`          | GET    | Retrieve all airlines or filter by name |
| `/airlines`          | POST   | Add a new airline record |
| `/airlines/:id`      | DELETE | Remove an airline by its unique ID |

---

### Airport and Route Data Access
- Fetch airport details such as code, name, city, and country.
- Retrieve route information including source airport, destination airport, and airline operator.
- Data stored and managed in PostgreSQL relational database.

---

### Real-Time Weather Integration
| Endpoint | Description |
|----------|-------------|
| `/weather?lat=<latitude>&lon=<longitude>` | Returns current and forecasted weather data powered by the Open-Meteo API (temperature, wind speed, etc.) |

---

### RESTful API Architecture
- Built with **Node.js** and **Express**, ensuring clear separation of concerns between routes, controllers, and database services.
- Implements proper **HTTP methods** (GET, POST, DELETE) and **status codes** for reliable client-server communication.

---

### Project Demo
The homepage provides an organized interface with dropdown menus to explore countries, airlines, airports, routes, and distances.  
At the bottom, an interactive map visualizes airport locations and flight paths in real time.

Examples include:
- Selecting a country to list airlines/airports.
- Selecting an airline to display operated routes.
- Viewing airport details (codes, weather, etc.).
- Calculating distances between two airports.

---

## Design Decisions

### Technology Stack
- **Node.js + Express** – Lightweight, event-driven REST API framework.
- **PostgreSQL** – Relational database with robust query support.
- **Python** – Used for automated testing with pytest.

### Data Organization
- Airlines, airports, and routes stored in normalized PostgreSQL tables.
- Primary keys (IDs, IATA, ICAO) ensure uniqueness and efficient lookups.

### API Design
- RESTful principles with consistent endpoints: `/airlines`, `/airports`, `/routes`, `/weather`.
- Clear use of HTTP methods and status codes.

### Weather Integration
- Real-time temperature data from **Open-Meteo API**.

### Frontend Visualization
- Dropdown menus for structured interaction.
- **Leaflet.js** (or equivalent) for interactive map visualization.

### System Reliability & Deployment
- `.env` variables for configuration portability.
- Deployable on **AWS EC2** with optional **Docker support**.
- Error handling and input validation for robustness.

---

## Testing

This project includes a **comprehensive test suite** to ensure the reliability of API endpoints.

### Running the Test Suite
Navigate to the tests directory:
```bash
cd tests/
pytest
```
This will execute:
- `test_airlines.py`
- `test_airports.py`
- `test_routes.py`

**Output:** Displays pass/fail summary for all tests.

### Smoke Test
A lightweight health check for critical endpoints:
```bash
pytest smoke_test.py
```
Validates that `/airports`, `/airlines`, `/routes` are responding correctly.

---
