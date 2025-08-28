const express = require('express');
const app = express(); 
const { Pool } = require('pg'); // PostgreSQL client
const axios = require('axios');

const PORT = 8001;
app.use(express.static('public'));
app.use(express.json());


// PostgreSQL connection setup
const pool = new Pool({
  user: 'postgres',
  password: 'mypacepostgresql',
  host: 'my-pace-postgresql.c34coqsu6hd1.us-east-2.rds.amazonaws.com',
  port: 5432,
  database: 'hw1', 
  ssl: {
    rejectUnauthorized: false,
  },
});

// Airlines endpoint
app.get('/airlines', async (req, res) => {
    const countryCodes = req.query.country_code;
    if (!countryCodes) {
        return res.status(400).json({ error: 'country_code parameter is required' });
    }

    const countryList = countryCodes.split(',').map(code => code.trim());
    if (countryList.length === 0) {
        return res.status(400).json({ error: 'Invalid country_code parameter' });
    }

    const placeholders = countryList.map((_, index) => `$${index + 1}`).join(', ');
    const query = `SELECT airlines.* FROM airlines join countries on airlines.country = countries.name  where countries.code in (${placeholders})`;

    try {
        console.log('Executing query:', query, 'with values:', countryList);
        const results = await pool.query({ text: query, values: countryList });
        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'No airlines found for the given country codes' });
        }
        res.json(results.rows);
    } catch (err) {
        console.error('Database query failed:', err);
        res.status(500).json({ error: 'Internal server error' });
    }});

// Search airline by ICAO or IATA
app.get('/airlines/search', async (req, res) => {
    const { icao, iata } = req.query;
    if (!icao && !iata) {
        return res.status(400).json({ error: 'At least one of ICAO or IATA code must be provided' });
    }

    let query = 'SELECT * FROM airlines WHERE ';
    let conditions = [];
    let values = [];

    if (icao) {
        conditions.push(`icao = $${values.length + 1}`);
        values.push(icao);
    }
    if (iata) {
        conditions.push(`iata = $${values.length + 1}`);
        values.push(iata);
    }

    query += conditions.join(' OR ');
    
    try {
        console.log('Executing query:', query, 'with values:', values);
        const results = await pool.query({ text: query, values });
        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'No airline found for the given ICAO/IATA code' });
        }
        res.json(results.rows);
    } catch (err) {
        console.error('Database query failed:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a new airline
app.post('/airlines', async (req, res) => {
   console.log('inside func');
    const { name, iata, icao, country, callsign } = req.body;
    if (!name || !country) {
        return res.status(400).json({ error: 'Airline name and country are required' });
    }

    const query = `INSERT INTO airlines (name, iata, icao, country, callsign) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [name, iata || null, icao || null, country, callsign];

    try {
        console.log('Executing query:', query, 'with values:', values);
        const result = await pool.query({ text: query, values });
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Database insert failed:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete an airline by ICAO or IATA
app.delete('/airlines', async (req, res) => {
    const { icao, iata } = req.query;
    if (!icao && !iata) {
        return res.status(400).json({ error: 'ICAO or IATA code is required for deletion' });
    }

    let query = 'DELETE FROM airlines WHERE ';
    let conditions = [];
    let values = [];

    if (icao) {
        values.push(icao);
        conditions.push(`icao = $${values.length}`);
    }
    if (iata) {
        values.push(iata);
        conditions.push(`iata = $${values.length}`);
    }

    query += conditions.join(' OR ');

    try {
        console.log('Executing query:', query, 'with values:', values);
        const result = await pool.query({ text: query, values });
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'No airline found to delete' });
        }
        res.json({ message: 'Airline deleted successfully' });
    } catch (err) {
        console.error('Database delete failed:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Airports endpoint
// Airports - search by country codes
app.get('/airports', async (req, res) => {
    const countryCodes = req.query.country_code;
    if (!countryCodes) {
        return res.status(400).json({ error: 'country_code parameter is required' });
    }

    const countryList = countryCodes.split(',').map(code => code.trim());
    const placeholders = countryList.map((_, index) => `$${index + 1}`).join(', ');

   const query = `
        SELECT DISTINCT ON (airports.icao, airports.iata) airports.* FROM airports
        JOIN countries ON airports.country = countries.name
        WHERE countries.code IN (${placeholders})
    `; 

    try {
        console.log('Executing query:', query, 'with values:', countryList);
        const results = await pool.query({ text: query, values: countryList });
        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'No airports found for the given country codes' });
        }
        res.json(results.rows);
    } catch (err) {
        console.error('Database query failed:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Search airport by ICAO and/or IATA
app.get('/airports/search', async (req, res) => {
    const { icao, iata } = req.query;
    if (!icao && !iata) {
        return res.status(400).json({ error: 'At least one of ICAO or IATA code must be provided' });
    }

    let query = 'SELECT * FROM airports WHERE ';
    let conditions = [];
    let values = [];

    if (icao) {
        values.push(icao);
        conditions.push(`icao = $${values.length}`);
    }
    if (iata) {
        values.push(iata);
        conditions.push(`iata = $${values.length}`);
    }

    query += conditions.join(' OR ');

    try {
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No airport found for the given ICAO/IATA code' });
        }

        const airport = result.rows[0];

        const { latitude, longitude } = airport;
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;

        const weatherRes = await axios.get(weatherUrl);
        const weatherData = weatherRes.data;

        airport.high = weatherData.daily.temperature_2m_max[0];
        airport.low = weatherData.daily.temperature_2m_min[0];

        res.json(airport);
    } catch (err) {
        console.error('Error in /airports/search with weather:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a new airport
app.post('/airports', async (req, res) => {
    const { name, city, country, iata, icao } = req.body;
    if (!name || !country) {
        return res.status(400).json({ error: 'Airport name and country are required' });
    }

    const query = `INSERT INTO airports (name, city, country, iata, icao) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [name, city || null, country, iata || null, icao || null];

    try {
        console.log('Executing query:', query, 'with values:', values);
        const result = await pool.query({ text: query, values });
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Database insert failed:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete an airport by ICAO and/or IATA
app.delete('/airports', async (req, res) => {
    const { iata, icao } = req.query;

    if (!iata && !icao) {
        return res.status(400).json({ error: 'ICAO or IATA code is required for deletion' });
    }

    let query = 'DELETE FROM airports WHERE ';
    const values = [];

    if (iata) {
        query += 'iata = $1';
        values.push(iata);
    } else if (icao) {
        query += 'icao = $1';
        values.push(icao);
    }

    try {
        const result = await pool.query(query, values);
        
        // This is the key fix: check if any rows were actually deleted
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'No airport found to delete' });
        }

        res.status(200).json({ message: 'Airport deleted successfully' });
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'Failed to delete airport' });
    }
});
// Routes endpoint
// Route: Haversine distance + airlines/aircrafts on route
app.get('/routes', async (req, res) => {
    const { from, to } = req.query;
    if (!from || !to) {
        return res.status(400).json({ error: 'Both departure (from) and arrival (to) IATA codes are required' });
    }

    try {
        // 1. Get coordinates for both airports
        const coordQuery = `
            SELECT iata, latitude, longitude FROM airports
            WHERE iata = $1 OR iata = $2
        `;
        const coordResult = await pool.query(coordQuery, [from, to]);

        if (coordResult.rows.length !== 2) {
            return res.status(404).json({ error: 'Could not find both airports with given IATA codes' });
        }

        const coords = {};
        for (const row of coordResult.rows) {
            coords[row.iata] = { lat: parseFloat(row.latitude), lon: parseFloat(row.longitude) };
        }

        const { lat: lat1, lon: lon1 } = coords[from];
        const { lat: lat2, lon: lon2 } = coords[to];

        // Haversine formula to calculate distance (in kilometers)
        const toRad = angle => angle * Math.PI / 180;
        const R = 6378;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distanceKm = R * c;

        // 2. Get list of airlines and aircraft types for the route
        const routeQuery = `
            SELECT r.airline, r.planes AS aircraft, a.name AS airline_name
            FROM routes r
            LEFT JOIN airlines a ON r.airline = a.iata
            WHERE r.departure = $1 AND r.arrival = $2
        `;
        const routeResult = await pool.query(routeQuery, [from, to]);

        res.json({
            distance_km: parseFloat(distanceKm.toFixed(2)),
            airlines_and_aircrafts: routeResult.rows
        });
    } catch (err) {
        console.error('Error in /routes:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route: Find all arrival airports from a given departure airport (by IATA)
app.get('/routes/arrivals', async (req, res) => {
    const { from } = req.query;
    if (!from) {
        return res.status(400).json({ error: 'Departure airport IATA code is required' });
    }

    try {
        const query = `
            SELECT DISTINCT arrival
            FROM routes
            WHERE departure = $1
        `;
        const result = await pool.query(query, [from]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No arrivals found for the given departure airport' });
        }

        res.json(result.rows);
    } catch (err) {
        console.error('Error in /routes/arrivals:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route: Search routes by airline and aircraft type
app.get('/routes/search', async (req, res) => {
    const { airline, aircraft } = req.query;
    if (!airline || !aircraft) {
        return res.status(400).json({ error: 'Both airline and aircraft codes are required' });
    }

    try {
        const query = `
            SELECT departure, arrival
            FROM routes
            WHERE airline = $1 AND planes = $2
        `;
        const result = await pool.query(query, [airline, aircraft]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No routes found for given airline and aircraft type' });
        }

        res.json(result.rows);
    } catch (err) {
        console.error('Error in /routes/search:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route: Add a new route with validations
app.post('/routes', async (req, res) => {
    const { airline, departure, arrival, aircraft } = req.body;

    if (!airline || airline.length !== 2) {
        return res.status(400).json({ error: 'A valid 2-character IATA airline code is required' });
    }
    if (!departure || departure.length !== 3 || !arrival || arrival.length !== 3) {
        return res.status(400).json({ error: 'Valid 3-character IATA codes for both departure and arrival airports are required' });
    }
    if (!aircraft || aircraft.length !== 3) {
        return res.status(400).json({ error: 'A valid 3-character aircraft type code is required' });
    }

    try {
        // Validate airline
        const airlineCheck = await pool.query('SELECT 1 FROM airlines WHERE iata = $1', [airline]);
        if (airlineCheck.rows.length === 0) {
            return res.status(400).json({ error: 'Airline code does not exist in the airlines table' });
        }

        // Validate airports
        const airportCheck = await pool.query(
            'SELECT iata FROM airports WHERE iata IN ($1, $2)', [departure, arrival]
        );
        const codesFound = airportCheck.rows.map(r => r.iata);
        if (!codesFound.includes(departure) || !codesFound.includes(arrival)) {
            return res.status(400).json({ error: 'One or both airport codes are invalid or not found in airports table' });
        }

        // Validate aircraft
        const aircraftCheck = await pool.query('SELECT 1 FROM planes WHERE code = $1', [aircraft]);
        if (aircraftCheck.rows.length === 0) {
            return res.status(400).json({ error: 'Aircraft code does not exist in the planes table' });
        }

        // Insert the route
        const insertQuery = `
            INSERT INTO routes (airline, departure, arrival, planes)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const insertResult = await pool.query(insertQuery, [airline, departure, arrival, aircraft]);

        res.status(201).json(insertResult.rows[0]);
    } catch (err) {
        console.error('Error adding route:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Route: Delete a route by airline, departure, and arrival
app.delete('/routes', async (req, res) => {
    const { airline, departure, arrival } = req.body;
    if (!airline || airline.length !== 2) {
        return res.status(400).json({ error: 'A valid 2-character IATA airline code is required' });
    }
    if (!departure || departure.length !== 3 || !arrival || arrival.length !== 3) {
        return res.status(400).json({ error: 'Valid 3-character IATA codes for both departure and arrival airports are required' });
    }

    try {
        // Validate airline
        const airlineCheck = await pool.query('SELECT 1 FROM airlines WHERE iata = $1', [airline]);
        if (airlineCheck.rows.length === 0) {
            return res.status(400).json({ error: 'Airline code does not exist in the airlines table' });
        }

        // Validate airports
        const airportCheck = await pool.query(
            'SELECT iata FROM airports WHERE iata IN ($1, $2)', [departure, arrival]
        );
        const codesFound = airportCheck.rows.map(r => r.iata);
        if (!codesFound.includes(departure) || !codesFound.includes(arrival)) {
            return res.status(400).json({ error: 'One or both airport codes are invalid or not found in airports table' });
        }

        // Delete the route
        const deleteQuery = `
            DELETE FROM routes
            WHERE airline = $1 AND departure = $2 AND arrival = $3
            RETURNING *
        `;
        const result = await pool.query(deleteQuery, [airline, departure, arrival]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'No matching route found to delete' });
        }

        res.json({ message: 'Route deleted successfully', deleted: result.rows[0] });
    } catch (err) {
        console.error('Error deleting route:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route: Update a route's aircraft types (append if needed)
app.put('/routes', async (req, res) => {
    const { airline, departure, arrival, aircraft } = req.body;

    if (!airline || airline.length !== 2 || !departure || !arrival || !aircraft || aircraft.length !== 3) {
        return res.status(400).json({ error: 'Valid airline, departure, arrival, and aircraft code (3-char) are required' });
    }

    try {
        // Check if route exists
        const routeCheck = await pool.query(
            'SELECT planes FROM routes WHERE airline = $1 AND departure = $2 AND arrival = $3',
            [airline, departure, arrival]
        );

        if (routeCheck.rows.length === 0) {
            return res.status(404).json({ error: 'No matching route found to update' });
        }

        const existingPlanes = routeCheck.rows[0].planes ? routeCheck.rows[0].planes.split(' ') : [];

        if (existingPlanes.includes(aircraft)) {
            return res.json({ message: 'Aircraft type already exists for this route. No changes made.' });
        }

        const updatedPlanes = [...existingPlanes, aircraft].sort().join(' ');

        const updateQuery = `
            UPDATE routes
            SET planes = $1
            WHERE airline = $2 AND departure = $3 AND arrival = $4
            RETURNING *
        `;
        const result = await pool.query(updateQuery, [updatedPlanes, airline, departure, arrival]);

        res.json({ message: 'Aircraft type appended successfully.', updated: result.rows[0] });
    } catch (err) {
        console.error('Error updating route:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/airports/all', async (req, res) => {
  try {
    const query = 'SELECT * FROM airports';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error in /airports/all:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// new  Get list of all countries
app.get('/countries', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT code, name FROM countries ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching countries:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);

});

// New route: Search routes by airline only (no aircraft required)
app.get('/routes/by-airline', async (req, res) => {
  const { airline } = req.query;

  if (!airline) {
    return res.status(400).json({ error: 'Airline code is required' });
  }

  try {
    const query = `
      SELECT departure, arrival
      FROM routes
      WHERE airline = $1
    `;
    const result = await pool.query(query, [airline]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No routes found for this airline' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error in /routes/by-airline:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// New route: Find all departure airports for a given arrival airport
app.get('/routes/departures', async (req, res) => {
  const { to } = req.query;
  if (!to) {
    return res.status(400).json({ error: 'Arrival airport IATA code is required' });
  }

  try {
    const query = `
      SELECT DISTINCT departure
      FROM routes
      WHERE arrival = $1
    `;
    const result = await pool.query(query, [to]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No departures found for the given arrival airport' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error in /routes/departures:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// New route: Get airlines flying to or from a given airport
app.get('/airlines/at-airport', async (req, res) => {
  const { iata } = req.query;
  if (!iata) {
    return res.status(400).json({ error: 'IATA code is required' });
  }

  try {
    const query = `
      SELECT DISTINCT a.name, a.iata, a.icao
      FROM routes r
      JOIN airlines a ON r.airline = a.iata
      WHERE r.departure = $1 OR r.arrival = $1
    `;
    const result = await pool.query(query, [iata]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No airlines found for this airport' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error in /airlines/at-airport:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Airlines flying between two airports
app.get('/airlines/between', async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'Both from and to IATA codes are required' });
  }

  try {
    const query = `
      SELECT DISTINCT a.name, a.iata, a.icao
      FROM routes r
      JOIN airlines a ON r.airline = a.iata
      WHERE r.departure = $1 AND r.arrival = $2
    `;
    const result = await pool.query(query, [from, to]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No airlines found between these airports' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error in /airlines/between:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
