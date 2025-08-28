**Purpose**

Flight Explorer is a REST API and web application to explore airlines, airports, routes, and** real-time weather data. Built with Node.js, Express, and PostgreSQL, it demonstrates backend development, API integration, and frontend visualization with an interactive map.

**System\_Requirements:**

**Prerequisite:** 

Before running the project locally, make sure the following dependencies are installed and configured:

- **Node.js (v18 or later)** – Required for running the backend server with Express.
- **npm (v9 or later)** – Comes bundled with Node.js and is used to install project dependencies.
- **PostgreSQL (v13 or later)** – Relational database used to store airlines, airports, and route data.
  - Ensure PostgreSQL is running locally or remotely.
  - Create a database named flight\_explorer (or update the .env file with your own DB name).
- **Git** – Required to clone the repository and manage version control.

To install Node.js on Windows/Mac/Linux, go to the official Node.js download page. Download the LTS version executable and run it on your machine.

**Installation Guide**.

1. **Clone the Repository**

   git clone https://github.com/koushikachappidi-3/flight-explorer.git

   cd flight-explorer

1. **Install Dependencies**\
   Make sure you have Node.js and npm installed. If not, then run:

   npm install.

1. **Set Up PostgreSQL Database**

   Create a new PostgreSQL database (default name: flight\_explorer).

   Update your .env file with your PostgreSQL credentials:

   PORT=8001

   PGHOST=localhost

   PGPORT=5432

   PGDATABASE=flight\_explorer

   PGUSER=your\_username

   PGPASSWORD=your\_password

1. ` `**Run locally with** 

   ` `npm start 

   Access at: [**http://localhost:8001**](http://localhost:8001/)

   Test the API:

   Use Postman, or curl to test endpoints such as:

- GET /airlines
- POST /airlines
- DELETE /airlines/:id

**Features\_and\_project\_walkthrough:**

- **Airline Management**
  - GET /airlines → Retrieve all airlines or filter by name.
  - POST /airlines → Add a new airline record.
  - DELETE /airlines/:id → Remove an airline by its unique ID.
- **Airport and Route Data Access**
  - Fetch airport details such as code, name, city, and country.
  - Retrieve route information including source airport, destination airport, and airline operator.
  - Data stored and managed in a **PostgreSQL** relational database.
- **Real-Time Weather Integration**
  - GET /weather?lat=<latitude>&lon=<longitude> → Returns current and forecasted weather data.
  - Powered by the Open-Meteo API to provide real-time airport weather conditions (temperature, wind speed, etc.).
- **RESTful API Architecture**
  - Built with Node.js and Express, ensuring clear separation of concerns between routes, controllers, and database services.
  - Implements proper HTTP methods (GET, POST, DELETE) and status codes for reliable client-server communication.

**Project Demo**

1. The homepage provides an organized interface with dropdown menus to explore countries, airlines, airports, routes, and distances. At the bottom, an interactive map visualizes airport locations and flight paths in real time.

![A screenshot of a computer

Description automatically generated](Aspose.Words.1b819c71-f3c5-4a8d-af8a-8a3014237ecd.001.png)

**2) Select a Country**

Selecting a country displays all registered airlines and airports operating in that region. This helps users quickly filter available aviation data by geography.

\
*Example: Albania → shows Ada Air, Albanian Airlines, and Tirana International Airport.*

![A screenshot of a computer

Description automatically generated](Aspose.Words.1b819c71-f3c5-4a8d-af8a-8a3014237ecd.002.png)

![A map of a mountain range

Description automatically generated](Aspose.Words.1b819c71-f3c5-4a8d-af8a-8a3014237ecd.003.png)

**3) Select an Airline**

Choosing an airline shows all the routes it operates.

\
*Example: Albanian Airlines → routes connecting Malé, Beijing, and Shanghai airports.*

![A screenshot of a computer

Description automatically generated](Aspose.Words.1b819c71-f3c5-4a8d-af8a-8a3014237ecd.004.png)

![Uploaded image](Aspose.Words.1b819c71-f3c5-4a8d-af8a-8a3014237ecd.005.png)

**4) Select an Airport**

Selecting an airport displays details such as city, country, IATA/ICAO codes, and real-time weather.

\
*Example: Madang Airport, Papua New Guinea → High Temp: 31°C, Low Temp: 21.8°C.*

![A white screen with a blue background

Description automatically generated](Aspose.Words.1b819c71-f3c5-4a8d-af8a-8a3014237ecd.006.png)![A map of the united states

Description automatically generated](Aspose.Words.1b819c71-f3c5-4a8d-af8a-8a3014237ecd.007.png)

**5) Routes Originating From an Airport**

Lists all destinations reachable from the selected airport.

\
*Example: Madang Airport → routes to Goroka, Mount Hagen, Port Moresby, and more.*

![A screenshot of a computer

Description automatically generated](Aspose.Words.1b819c71-f3c5-4a8d-af8a-8a3014237ecd.008.png)

![A map with blue lines and points

Description automatically generated](Aspose.Words.1b819c71-f3c5-4a8d-af8a-8a3014237ecd.009.png)

**6) Routes Arriving At an Airport**

Shows all inbound routes to the chosen airport.

\
*Example: Flights arriving at Madang Airport from Goroka, Mount Hagen, and Nadzab.*

![A white and blue screen

Description automatically generated with medium confidence](Aspose.Words.1b819c71-f3c5-4a8d-af8a-8a3014237ecd.010.png)

![A map with blue points

Description automatically generated](Aspose.Words.1b819c71-f3c5-4a8d-af8a-8a3014237ecd.011.png)

**7) Airlines Flying To/From an Airport**

Displays both departing and arriving routes for a chosen airport.

\
*Example: Goroka Airport → outbound flights to Madang and inbound flights from Port Moresby.*

![A screenshot of a computer

Description automatically generated](Aspose.Words.1b819c71-f3c5-4a8d-af8a-8a3014237ecd.012.png)


**8) Airlines Flying Between Two Airports**

Check which airlines operate between two selected airports.

\
*Example: Mumbai (Chhatrapati Shivaji) ↔ Newark Liberty → operated by Air India and United Airlines.*

![A screenshot of a computer

Description automatically generated](Aspose.Words.1b819c71-f3c5-4a8d-af8a-8a3014237ecd.013.png)

![A map of the world with a point on it

Description automatically generated](Aspose.Words.1b819c71-f3c5-4a8d-af8a-8a3014237ecd.014.png)

**9) Distance Between Two Airports**

Calculates the distance (in km) between two airports and plots the route on the map.

\
*Example: Cambridge Bay Airport → Reykjavik Airport → Distance: 3427.32 km.*

![A map with blue points and a route

Description automatically generated with medium confidence](Aspose.Words.1b819c71-f3c5-4a8d-af8a-8a3014237ecd.015.png)

**Design Decisions**

- **Technology Stack**
  - **Node.js + Express** was chosen for building the REST API due to its lightweight, event-driven architecture and ease of handling asynchronous requests.
  - **PostgreSQL** was selected as the database because of its relational nature, robust query support, and reliability for structured aviation data.

  - **Python**  – Used for automated testing, ensuring API reliability through both comprehensive test suites and smoke tests.
- **Data Organization**
  - Airlines, airports, and routes data are stored in normalized PostgreSQL tables to ensure efficient querying and maintainability.
  - Primary keys (IDs, IATA, ICAO codes) ensure uniqueness and enable fast lookups.
- **API Design**
  - Endpoints follow RESTful principles with clear separation of responsibilities (/airlines, /airports, /routes, /weather).
  - Consistent use of HTTP methods (GET, POST, DELETE) and status codes improves reliability and clarity for consumers.
- **Weather Integration**
  - The **Open-Meteo API** was integrated for real-time temperature data at airports.
- **Frontend Visualization**
  - Dropdown menus provide structured interaction for exploring data step by step.
  - **Leaflet.js** (or equivalent map library) was used to visualize airport locations and routes on an interactive map.
- **System Reliability & Deployment**
  - Environment variables (.env) are used for configuration, improving portability across local and cloud environments.
  - The system is deployable on AWS EC2 for real-world hosting, with Docker support as an optional containerized deployment method.
  - Error handling and input validation ensure robustness against invalid requests.
- `        `**Testing**
  - ` `Comprehensive Test Suite – Built with pytest, the suite validates endpoint functionality, error handling, and data validation. This ensures that new features or changes do not introduce regressions.
  - Smoke Test – A lightweight test suite performs a quick health check to confirm the server is accessible and that core endpoints respond correctly, providing a fast “go/no-go” signal after deployment.


**Tests:**

This project includes a comprehensive test suite to ensure the reliability and correctness of the API endpoints. The tests are written using pytest and the requests library.

**Running the Test Suite**

1. Navigate to the tests/ directory in the project:

cd tests/

1. Run the tests using the pytest command. This will execute all tests in test\_airlines.py, test\_airports.py, and test\_routes.py.

   Pytest

1. The output will show a summary of the test run, including the number of tests passed, failed, and skipped. A successful run will display a report with all tests passing.

**Smoke Test:**

A separate smoke test suite is included to provide a quick, high-level verification of the most critical endpoints.

1. To run the smoke test, execute the following command from the tests/ directory:

pytest smoke\_test.py

1. The smoke test confirms that the server is up and the core endpoints (/airports, /airlines, /routes) are responding as expected.
