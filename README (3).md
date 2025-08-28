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

 To install Node.js on Windows/Mac/Linux, go to the official [Node.js download page](https://nodejs.org/). Download the LTS version executable and run it on your machine.

---

## Installation Guide

1. *Clone the Repository*
```bash
git clone https://github.com/koushikachappidi-3/flight-explorer.git
```
```bash
cd flight-explorer
```
2.*Install Dependencies*
Make sure you have Node.js and npm installed. If not, run:
```bash
npm install
```

3.*Set Up PostgreSQL Database*
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

4.*Run Locally*
```bash
npm start
```
Access at: [http://localhost:8001](http://localhost:8001)

5.*Test the API*
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
- Built with Node.js and Express, ensuring clear separation of concerns between routes, controllers, and database services.
- Implements proper HTTP methods (GET, POST, DELETE) and status codes for reliable client-server communication.

---

### Project Demo
1. **The homepage** provides an organized interface with dropdown menus to explore countries, airlines, airports, routes, and distances.  
At the bottom, an interactive map visualizes airport locations and flight paths in real time.

<img width="468" height="288" alt="image" src="https://github.com/user-attachments/assets/0c642904-eefb-4640-8555-74070f3c2ca6" />

2. **Select a Country**
Selecting a country displays all registered airlines and airports operating in that region. This helps users quickly filter available aviation data by geography.

Example: Albania → shows Ada Air, Albanian Airlines, and Tirana International Airport.

<img width="468" height="184" alt="image" src="https://github.com/user-attachments/assets/f7f88281-e70c-47d5-a9a4-6e39f205f624" />
<img width="468" height="276" alt="image" src="https://github.com/user-attachments/assets/c3f47dcb-c04c-479d-acf7-97c259548613" />
   
3. **Select an Airline**
Choosing an airline shows all the routes it operates.

Example: Albanian Airlines → routes connecting Malé, Beijing, and Shanghai airports

<img width="370" height="263" alt="image" src="https://github.com/user-attachments/assets/8b3bc4a3-97cd-4046-875a-75412ed9d370" />

4. **Select an Airport**
Selecting an airport displays details such as city, country, IATA/ICAO codes, and real-time weather.

Example: Madang Airport, Papua New Guinea → High Temp: 31°C, Low Temp: 21.8°C.

<img width="377" height="169" alt="image" src="https://github.com/user-attachments/assets/04231249-d0ec-4efd-9864-5971a6a1b744" />
<img width="316" height="196" alt="image" src="https://github.com/user-attachments/assets/69c10282-1155-44ce-bdbd-40c292beb076" />
  
5. **Routes Originating from an Airport**
Lists all destinations reachable from the selected airport.

Example: Madang Airport → routes to Goroka, Mount Hagen, Port Moresby, and more.

<img width="375" height="153" alt="image" src="https://github.com/user-attachments/assets/0e1aac7a-814b-4528-a85f-c7a83ae8cc5f" />
<img width="375" height="219" alt="image" src="https://github.com/user-attachments/assets/bc63974a-f2e8-4caf-824e-e8fd19622743" />
   
6. **Routes Arriving at an Airport**
Shows all inbound routes to the chosen airport.

Example: Flights arriving at Madang Airport from Goroka, Mount Hagen, and Nadzab.

<img width="468" height="120" alt="image" src="https://github.com/user-attachments/assets/333b3464-0550-43a7-9fd7-63b3d913e4b2" />
<img width="359" height="142" alt="image" src="https://github.com/user-attachments/assets/a5ca68fe-dbf1-432f-ac76-6c8712c10af3" />

7. **Airlines Flying To/From an Airport**
Displays both departing and arriving routes for a chosen airport.

Example: Goroka Airport → outbound flights to Madang and inbound flights from Port Moresby.

<img width="398" height="262" alt="image" src="https://github.com/user-attachments/assets/e1a47810-53fc-40e2-94b6-9aa9a2727395" />
  
8. **Airlines Flying Between Two Airports**
Check which airlines operate between two selected airports.

Example: Mumbai (Chhatrapati Shivaji) ↔ Newark Liberty → operated by Air India and United Airlines.

<img width="468" height="191" alt="image" src="https://github.com/user-attachments/assets/8c02ccba-c9fd-4007-b7f2-49f9c3878ced" />
<img width="468" height="278" alt="image" src="https://github.com/user-attachments/assets/21f5aec8-db01-42ed-8ced-bec3114e8be7" />

9. **Distance Between Two Airports**
 Calculates the distance (in km) between two airports and plots the route on the map.

Example: Cambridge Bay Airport → Reykjavik Airport → Distance: 3427.32 km.

<img width="468" height="444" alt="image" src="https://github.com/user-attachments/assets/0779407f-a112-4fc4-b2cd-592e01adae83" />

---

## Design Decisions

### Technology Stack
- **Backend**  
  Built with **Node.js** and **Express.js** for a lightweight, event-driven architecture that efficiently handles API requests.

- **Frontend**  
  Developed using **HTML**, **CSS**, and **JavaScript**, with interactive maps powered by **Leaflet.js**, a popular open-source mapping library.

- **Database**  
  Utilizes **PostgreSQL**, a robust and reliable relational database, to store and manage all structured aviation data.

- **Testing**  
  Test suite implemented in **Python**, using the **pytest** framework and the **requests** library to validate API functionality.

- **API Integration**  
  Incorporates real-time weather data from the **Open-Meteo API**.

- **Deployment**  
  Designed for deployment on **AWS EC2**, with optional **Docker** containerization to ensure consistent and reproducible environments.

### Data Organization
- Airlines, airports, and routes data are stored in normalized PostgreSQL tables to ensure efficient querying and maintainability.
- Primary keys (IDs, IATA, ICAO codes) ensure uniqueness and enable fast lookups.
  
### API Design
- Endpoints follow RESTful principles with clear separation of responsibilities 
: `/airlines`, `/airports`, `/routes`.
- Consistent use of HTTP methods (GET, POST, DELETE) and status codes improves reliability and clarity for consumers.

### Weather Integration
-The Open-Meteo API was integrated for real-time temperature data at airports.


### Frontend Visualization
- Dropdown menus provide structured interaction for exploring data step by step.
- Leaflet.js (or equivalent map library) was used to visualize airport locations and routes on an interactive map.


### System Reliability & Deployment
- Environment variables (.env) are used for configuration, improving portability across local and cloud environments.
-The system is deployable on AWS EC2 for real-world hosting, with Docker support as an optional containerized deployment method.
- Error handling and input validation ensure robustness against invalid requests.
### Testing
- Comprehensive Test Suite – Built with pytest, the suite validates endpoint functionality, error handling, and data validation.
- Smoke Test – A lightweight test suite performs a quick health check to confirm the server is accessible and that core endpoints respond correctly, providing a fast “go/no-go” signal after deployment.

---

## Tests
This project includes a comprehensive test suite to ensure the reliability and correctness of the API endpoints. The tests are written using pytest and the requests library.

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
- `smoke_test.py`

**Output:** Displays pass/fail summary for all tests.

<img width="825" height="172" alt="image" src="https://github.com/user-attachments/assets/1c6ad2a1-80b0-485a-8229-b619a12c47ae" />


### Smoke Test
A lightweight health check for critical endpoints:
Validates that `/airports`, `/airlines`, `/routes` are responding correctly.

---
