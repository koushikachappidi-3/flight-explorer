
let airportMap = {};
let currentMarker = null;

let map;
let countryMarkers = []; 
let routeMarkers = []; // markers for destination airports
let routeLines = [];   // lines from origin to destinations


function initializeMap() {
  map = L.map('map').setView([20, 0], 2); // World view

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}


async function preloadAllAirports() {
  try {
    const res = await fetch('/airports/all');
    const airports = await res.json();

    airports.forEach(a => {
      if (a.iata) {
        airportMap[a.iata] = a.name;  // Store IATA → Name
      }
    });

    console.log("Preloaded", Object.keys(airportMap).length, "airports.");
  } catch (err) {
    console.error("Failed to preload airports:", err);
  }
}

function populateAirportDropdown() {
  const select = document.getElementById('airportSelect');
  select.innerHTML = '<option value="">-- Select Airport --</option>';

  for (const iata in airportMap) {
    const opt = document.createElement('option');
    opt.value = iata;
    opt.textContent = airportMap[iata]; // name only
    select.appendChild(opt);
  }
}

function populateAirlinesAroundDropdown() {
  const select = document.getElementById('airlinesAroundAirportSelect');
  select.innerHTML = '<option value="">-- Select Airport --</option>';

  for (const iata in airportMap) {
    const opt = document.createElement('option');
    opt.value = iata;
    opt.textContent = airportMap[iata];
    select.appendChild(opt);
  }
}

function populateBetweenAirportDropdowns() {
  const fromSelect = document.getElementById('betweenFromSelect');
  const toSelect = document.getElementById('betweenToSelect');

  [fromSelect, toSelect].forEach(select => {
    select.innerHTML = '<option value="">-- Select Airport --</option>';
    for (const iata in airportMap) {
      const opt = document.createElement('option');
      opt.value = iata;
      opt.textContent = airportMap[iata];
      select.appendChild(opt);
    }
  });
}

// Show Spinner
function showSpinner(targetId) {
  const target = document.getElementById(targetId);
  if (target) {
    target.innerHTML = `
      <div class="text-center my-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
  }
}

// Hide Spinner and allow content
function hideSpinner(targetId, contentHtml) {
  const target = document.getElementById(targetId);
  if (target) {
    target.innerHTML = contentHtml;
  }
}




function populateDistanceAirportDropdowns() {
  const fromSelect = document.getElementById('distanceFromSelect');
  const toSelect = document.getElementById('distanceToSelect');

  [fromSelect, toSelect].forEach(select => {
    select.innerHTML = '<option value="">-- Select Airport --</option>';
    for (const iata in airportMap) {
      const opt = document.createElement('option');
      opt.value = iata;
      opt.textContent = airportMap[iata];
      select.appendChild(opt);
    }
  });
}

window.onload = () => {
  initializeMap();
  preloadAllAirports().then(() => {
    populateAirportDropdown();
    populateOriginAirportDropdown();
    populateArrivalAirportDropdown();
    populateAirlinesAroundDropdown();
    populateBetweenAirportDropdowns();
    populateDistanceAirportDropdowns();
  });

  loadCountries(); // async

  //  After everything loaded, make all selects searchable
  setTimeout(() => {
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
      $(select).select2({
        width: '100%',
        placeholder: '-- Select --',
        allowClear: true
      });
    });
  }, 500);
};



function populateArrivalAirportDropdown() {
  const select = document.getElementById('arrivalAirportSelect');
  select.innerHTML = '<option value="">-- Select Airport --</option>';

  for (const iata in airportMap) {
    const opt = document.createElement('option');
    opt.value = iata;
    opt.textContent = airportMap[iata];
    select.appendChild(opt);
  }
}


function onCountrySelected() {
 console.log("inside country selected");
  const countryCode = document.getElementById('countrySelect').value;
 
  if (!countryCode) return; 

  loadAirlines(countryCode);                    
  fetchAirlinesAndAirports(countryCode);        
}

// 1 A user selects a country to view all airlines and the airports in the country selected.
async function loadCountries() {
  try {
    const res = await fetch('/countries');
    const countries = await res.json();
    console.log("inside load countries");
    const select = document.getElementById('countrySelect');
    countries.forEach(country => {
      const opt = document.createElement('option');
      opt.value = country.code;       
      opt.textContent = country.name; 
      select.appendChild(opt);
    });
   console.log("complete country selection");
   console.log(country.code);
  } catch (err) {
    console.error('Error loading countries:', err);
  }
}


// When a user selects a country, fetch and show airlines + airports in that country
async function fetchAirlinesAndAirports() {
  const country = document.getElementById('countrySelect').value;
  if (!country) return;

  try {
    const airportsRes = await fetch(`/airports?country_code=${country}`);
    const airlinesRes = await fetch(`/airlines?country_code=${country}`);

    const airports = await airportsRes.json();
    const airlines = await airlinesRes.json();

    document.getElementById('countryResult').innerHTML = `
      <h3>Airlines</h3>
      <ul>${airlines.map(a => `<li>${a.name} (${a.iata || a.icao})</li>`).join('')}</ul>
      <h3>Airports</h3>
      <ul>${airports.map(a => `<li>${a.name} (${a.iata || a.icao})</li>`).join('')}</ul>
    `;

    //  Map Part: Clear old markers first
    countryMarkers.forEach(marker => {
      map.removeLayer(marker);
    });
    countryMarkers = [];

    //  Add new markers for all airports
    airports.forEach(a => {
      if (a.latitude && a.longitude) {
        const marker = L.marker([a.latitude, a.longitude])
          .addTo(map)
          .bindPopup(a.name);
        countryMarkers.push(marker);
      }
    });

    //  Auto-fit the map to the airport markers
    if (countryMarkers.length > 0) {
      const group = new L.featureGroup(countryMarkers);
      map.fitBounds(group.getBounds().pad(0.2)); // little padding
    }

  } catch (err) {
    console.error('Error fetching airlines or airports:', err);
  }
}

  
//2 Load airline options (filtered by country or global as needed)
// 2. Select an airline → View routes

async function loadAirlines(countryCode) {
  console.log(" Fetching airlines for country:", countryCode);
  
  const select = document.getElementById('airlineSelect');
  select.innerHTML = '';

  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = '-- Select Airline --';
  select.appendChild(defaultOpt);

  try {
    const res = await fetch(`/airlines?country_code=${countryCode}`);
    const airlines = await res.json();
    console.log(" Fetched airlines:", airlines);

    if (!Array.isArray(airlines)) {
      console.error(" Not an array:", airlines);
      return;
    }

    if (airlines.length === 0) {
      const noDataOpt = document.createElement('option');
      noDataOpt.value = '';
      noDataOpt.textContent = 'No airlines found';
      select.appendChild(noDataOpt);
      return;
    }

    airlines.forEach(airline => {
      const opt = document.createElement('option');
      opt.value = airline.iata || airline.icao || '';
      opt.textContent = airline.name;
      select.appendChild(opt);
    });

  } catch (err) {
    console.error(" Error loading airlines:", err);
    const errorOpt = document.createElement('option');
    errorOpt.value = '';
    errorOpt.textContent = 'Error loading airlines';
    select.appendChild(errorOpt);
  }
}

async function fetchAirlineRoutes() {
  const airline = document.getElementById('airlineSelect').value;

  try {
    const res = await fetch(`/routes/by-airline?airline=${airline}`);
    const routes = await res.json();

    if (!Array.isArray(routes) || routes.length === 0) {
      document.getElementById('airlineResult').innerHTML = `<p>No routes found for this airline.</p>`;
      return;
    }

    document.getElementById('airlineResult').innerHTML = `
      <h3>Routes Flown by ${airline}</h3>
      <ul>
        ${routes.map(r => {
          const from = airportMap[r.departure] || r.departure;
          const to = airportMap[r.arrival] || r.arrival;
          return `<li>${from} ➔ ${to}</li>`;
        }).join('')}
      </ul>
    `;
  } catch (err) {
    console.error("Error loading routes:", err);
    document.getElementById('airlineResult').innerHTML = `<p>Error loading routes.</p>`;
  }
}

async function fetchAirportDetails() {
  const iata = document.getElementById('airportSelect').value;
  if (!iata) return;

  try {
    const res = await fetch(`/airports/search?iata=${iata}`);
    const airport = await res.json();

    document.getElementById('airportDetails').innerHTML = `
      <h3>${airport.name}</h3>
      <p><strong>City:</strong> ${airport.city}</p>
      <p><strong>Country:</strong> ${airport.country}</p>
      <p><strong>IATA:</strong> ${airport.iata}</p>
      <p><strong>ICAO:</strong> ${airport.icao}</p>
      <p><strong>High Temp:</strong> ${airport.high}°C</p>
      <p><strong>Low Temp:</strong> ${airport.low}°C</p>
    `;
   addAirportMarker(airport.latitude, airport.longitude, airport.name);
  } catch (err) {
    console.error("Failed to fetch airport details:", err);
    document.getElementById('airportDetails').innerHTML = `<p>Error loading airport data.</p>`;
  }
}


function populateOriginAirportDropdown() {
  const select = document.getElementById('originAirportSelect');
  select.innerHTML = '<option value="">-- Select Airport --</option>';

  for (const iata in airportMap) {
    const opt = document.createElement('option');
    opt.value = iata;
    opt.textContent = airportMap[iata];
    select.appendChild(opt);
  }
}

async function fetchRoutesFromAirport() {
  const from = document.getElementById('originAirportSelect').value;
  if (!from) return;

  try {
    const res = await fetch(`/routes/arrivals?from=${from}`);
    const destinations = await res.json();

    if (!Array.isArray(destinations) || destinations.length === 0) {
      document.getElementById('routesFromResult').innerHTML = `<p>No routes found from this airport.</p>`;
      clearRoutesOnMap(); // clear old routes
      return;
    }

    document.getElementById('routesFromResult').innerHTML = `
      <ul>
        ${destinations.map(d => {
          const toName = airportMap[d.arrival] || d.arrival;
          return `<li>${airportMap[from]} ➔ ${toName}</li>`;
        }).join('')}
      </ul>
    `;

    //  Clear previous markers and lines
    clearRoutesOnMap();

    //  Get coordinates for origin airport
    const origin = Object.entries(airportMap).find(([iata, name]) => iata === from);
    const originAirport = origin ? origin[0] : null;

    if (!originAirport) return; // No origin found

    const originData = await fetch(`/airports/search?iata=${from}`);
    const originDetails = await originData.json();
    const originLatLng = [originDetails.latitude, originDetails.longitude];

    //  Draw markers and lines
    for (const dest of destinations) {
      const destCode = dest.arrival;

      // Fetch destination airport coordinates
      const destData = await fetch(`/airports/search?iata=${destCode}`);
      const destDetails = await destData.json();

      if (destDetails.latitude && destDetails.longitude) {
        // Marker
        const marker = L.marker([destDetails.latitude, destDetails.longitude])
          .addTo(map)
          .bindPopup(destDetails.name);

        routeMarkers.push(marker);

        // Line
        const line = L.polyline([originLatLng, [destDetails.latitude, destDetails.longitude]], { color: 'blue' })
          .addTo(map);
        routeLines.push(line);
      }
    }

    //  Fit map to show routes
    if (routeMarkers.length > 0) {
      const group = new L.featureGroup(routeMarkers.concat(routeLines));
      map.fitBounds(group.getBounds().pad(0.2));
    }

  } catch (err) {
    console.error("Error fetching routes from airport:", err);
    clearRoutesOnMap();
    document.getElementById('routesFromResult').innerHTML = `<p>Error loading routes.</p>`;
  }
}
 

async function fetchRoutesToAirport() {
  const to = document.getElementById('arrivalAirportSelect').value;
  if (!to) return;

  try {
    const res = await fetch(`/routes/departures?to=${to}`);
    const departures = await res.json();

    if (!Array.isArray(departures) || departures.length === 0) {
      document.getElementById('routesToResult').innerHTML = `<p>No routes found arriving at this airport.</p>`;
      clearRoutesOnMap(); // Clear old routes
      return;
    }

    document.getElementById('routesToResult').innerHTML = `
      <ul>
        ${departures.map(d => {
          const fromName = airportMap[d.departure] || d.departure;
          return `<li>${fromName} ➔ ${airportMap[to]}</li>`;
        }).join('')}
      </ul>
    `;

    
    clearRoutesOnMap();

    //  Fetch details of destination (arrival) airport
    const destData = await fetch(`/airports/search?iata=${to}`);
    const destDetails = await destData.json();
    const destLatLng = [destDetails.latitude, destDetails.longitude];

    //  Draw markers and lines from each departure to destination
    for (const dep of departures) {
      const depCode = dep.departure;

      const depData = await fetch(`/airports/search?iata=${depCode}`);
      const depDetails = await depData.json();

      if (depDetails.latitude && depDetails.longitude) {
        // Marker at departure
        const marker = L.marker([depDetails.latitude, depDetails.longitude])
          .addTo(map)
          .bindPopup(depDetails.name);

        routeMarkers.push(marker);

        // Line from departure ➔ arrival
        const line = L.polyline([[depDetails.latitude, depDetails.longitude], destLatLng], { color: 'green' })
          .addTo(map);
        routeLines.push(line);
      }
    }

    //  Fit map to show all points
    if (routeMarkers.length > 0) {
      const group = new L.featureGroup(routeMarkers.concat(routeLines));
      map.fitBounds(group.getBounds().pad(0.2));
    }

  } catch (err) {
    console.error("Error fetching routes to airport:", err);
    clearRoutesOnMap();
    document.getElementById('routesToResult').innerHTML = `<p>Error loading routes.</p>`;
  }
}

async function fetchAirlinesToFromAirport() {
  const code = document.getElementById('airlinesAroundAirportSelect').value;
  if (!code) return;

  try {
    clearRoutesOnMap();

    //  Show spinner while fetching
    showSpinner('airlinesToFromResult');

    const fromRes = await fetch(`/routes/arrivals?from=${code}`);
    const toRes = await fetch(`/routes/departures?to=${code}`);

    const departures = await fromRes.ok ? await fromRes.json() : [];
    const arrivals = await toRes.ok ? await toRes.json() : [];

    const selectedAirportRes = await fetch(`/airports/search?iata=${code}`);
    const selectedAirport = await selectedAirportRes.json();
    const selectedLatLng = [parseFloat(selectedAirport.latitude), parseFloat(selectedAirport.longitude)];

    if (!selectedLatLng[0] || !selectedLatLng[1]) {
      console.error("Selected airport has invalid coordinates!");
      hideSpinner('airlinesToFromResult', `<p>Error loading airport details.</p>`);
      return;
    }

    const markers = [];
    const lines = [];
    const departureList = [];
    const arrivalList = [];

    // Plot departures
    for (const dep of departures) {
      const arrivalCode = dep.arrival;
      const arrivalRes = await fetch(`/airports/search?iata=${arrivalCode}`);
      const arrivalAirport = await arrivalRes.json();

      if (arrivalAirport.latitude && arrivalAirport.longitude) {
        const arrivalLatLng = [parseFloat(arrivalAirport.latitude), parseFloat(arrivalAirport.longitude)];

        const marker = L.marker(arrivalLatLng)
          .addTo(map)
          .bindPopup(`Arrival Airport: ${arrivalAirport.name}`);
        markers.push(marker);

        const line = L.polyline([selectedLatLng, arrivalLatLng], { color: 'blue' }).addTo(map);
        lines.push(line);

        departureList.push(`${selectedAirport.name} ➔ ${arrivalAirport.name}`);
      }
    }

    // Plot arrivals
    for (const arr of arrivals) {
      const departureCode = arr.departure;
      const departureRes = await fetch(`/airports/search?iata=${departureCode}`);
      const departureAirport = await departureRes.json();

      if (departureAirport.latitude && departureAirport.longitude) {
        const departureLatLng = [parseFloat(departureAirport.latitude), parseFloat(departureAirport.longitude)];

        const marker = L.marker(departureLatLng)
          .addTo(map)
          .bindPopup(`Departure Airport: ${departureAirport.name}`);
        markers.push(marker);

        const line = L.polyline([departureLatLng, selectedLatLng], { color: 'green' }).addTo(map);
        lines.push(line);

        arrivalList.push(`${departureAirport.name} ➔ ${selectedAirport.name}`);
      }
    }

    // Marker for selected airport
    const selectedMarker = L.marker(selectedLatLng)
      .addTo(map)
      .bindPopup(`Selected Airport: ${selectedAirport.name}`);
    markers.push(selectedMarker);

    routeMarkers = markers;
    routeLines = lines;

    if (markers.length > 0) {
      const group = new L.featureGroup(markers.concat(lines));
      map.fitBounds(group.getBounds().pad(0.2));
    }

    //  Prepare final HTML to show
    let html = '';

    if (departureList.length > 0) {
      html += `<h4>Routes From ${selectedAirport.name}</h4>`;
      html += `<ul class="list-group mb-4">${departureList.map(route => `<li class="list-group-item">✈️ ${route}</li>`).join('')}</ul>`;
    } else {
      html += `<p class="text-muted">No departures found.</p>`;
    }

    if (arrivalList.length > 0) {
      html += `<h4>Routes To ${selectedAirport.name}</h4>`;
      html += `<ul class="list-group">${arrivalList.map(route => `<li class="list-group-item">🛬 ${route}</li>`).join('')}</ul>`;
    } else {
      html += `<p class="text-muted">No arrivals found.</p>`;
    }

    //  Hide spinner and show content
    hideSpinner('airlinesToFromResult', html);

  } catch (err) {
    console.error(" Error in fetchAirlinesToFromAirport():", err);
    clearRoutesOnMap();
    hideSpinner('airlinesToFromResult', `<p>Error loading routes for this airport.</p>`);
  }
}

async function fetchAirlinesBetweenAirports() {
  const from = document.getElementById('betweenFromSelect').value;
  const to = document.getElementById('betweenToSelect').value;
  if (!from || !to) return;

  try {
    clearRoutesOnMap(); //  Clear previous routes first

    const res = await fetch(`/airlines/between?from=${from}&to=${to}`);
    const airlines = await res.json();

    if (!Array.isArray(airlines) || airlines.length === 0) {
      document.getElementById('airlinesBetweenResult').innerHTML = `<p>No airlines found between these airports.</p>`;
      return;
    }

    // Fetch FROM airport details
    const fromRes = await fetch(`/airports/search?iata=${from}`);
    const fromAirport = await fromRes.json();
    const fromLatLng = [parseFloat(fromAirport.latitude), parseFloat(fromAirport.longitude)];

    // Fetch TO airport details
    const toRes = await fetch(`/airports/search?iata=${to}`);
    const toAirport = await toRes.json();
    const toLatLng = [parseFloat(toAirport.latitude), parseFloat(toAirport.longitude)];

    // Reset markers and lines tracking arrays
    const markers = [];
    const lines = [];

    // Plot FROM airport marker
    if (fromAirport.latitude && fromAirport.longitude) {
      const fromMarker = L.marker(fromLatLng)
        .addTo(map)
        .bindPopup(`From: ${fromAirport.name}`);
      markers.push(fromMarker); 
    }

    // Plot TO airport marker
    if (toAirport.latitude && toAirport.longitude) {
      const toMarker = L.marker(toLatLng)
        .addTo(map)
        .bindPopup(`To: ${toAirport.name}`);
      markers.push(toMarker); 
    }

    // Draw the connecting line
    const line = L.polyline([fromLatLng, toLatLng], { color: 'red' }).addTo(map);
    lines.push(line); // ✅ push line

    // Save globally for clearing next time
    routeMarkers = markers;
    routeLines = lines;

    // Zoom the map to fit the markers
    if (markers.length > 0) {
      const group = new L.featureGroup(markers.concat(lines));
      map.fitBounds(group.getBounds().pad(0.2));
    }

    // Display the airlines in the result div
    document.getElementById('airlinesBetweenResult').innerHTML = `
      <h3>Airlines flying between ${fromAirport.name} ➔ ${toAirport.name}</h3>
      <ul class="list-group">
        ${airlines.map(a => `<li class="list-group-item">${a.name} (${a.iata || a.icao})</li>`).join('')}
      </ul>
    `;

  } catch (err) {
    console.error("Error fetching airlines between airports:", err);
    clearRoutesOnMap();
    document.getElementById('airlinesBetweenResult').innerHTML = `<p>Error loading airlines between these airports.</p>`;
  }
}


async function fetchAirportDistance() {
  const from = document.getElementById('distanceFromSelect').value;
  const to = document.getElementById('distanceToSelect').value;
  if (!from || !to) return;

  try {
    clearRoutesOnMap(); // Clear previous markers/lines

    // Step 1: Fetch distance from backend
    const res = await fetch(`/routes?from=${from}&to=${to}`);
    const data = await res.json();
    const distanceKm = data.distance_km;

    // Step 2: Fetch FROM airport coordinates
    const fromRes = await fetch(`/airports/search?iata=${from}`);
    const fromAirport = await fromRes.json();
    const fromLatLng = [parseFloat(fromAirport.latitude), parseFloat(fromAirport.longitude)];

    // Step 3: Fetch TO airport coordinates
    const toRes = await fetch(`/airports/search?iata=${to}`);
    const toAirport = await toRes.json();
    const toLatLng = [parseFloat(toAirport.latitude), parseFloat(toAirport.longitude)];

    const markers = [];
    const lines = [];

    // Plot FROM airport marker
    if (fromAirport.latitude && fromAirport.longitude) {
      const marker = L.marker(fromLatLng)
        .addTo(map)
        .bindPopup(`From: ${fromAirport.name}`);
      markers.push(marker);
    }

    // Plot TO airport marker
    if (toAirport.latitude && toAirport.longitude) {
      const marker = L.marker(toLatLng)
        .addTo(map)
        .bindPopup(`To: ${toAirport.name}`);
      markers.push(marker);
    }

    // Draw a line between FROM and TO
    const line = L.polyline([fromLatLng, toLatLng], { color: 'orange' }).addTo(map);
    lines.push(line);

    // Save globally
    routeMarkers = markers;
    routeLines = lines;

    // Zoom/fit to show both points and the line
    if (markers.length > 0) {
      const group = new L.featureGroup(markers.concat(lines));
      map.fitBounds(group.getBounds().pad(0.2));
    }

    
    document.getElementById('airportDistanceResult').innerHTML = `
      <h3>Distance between ${fromAirport.name} ➔ ${toAirport.name}</h3>
      <p><strong>Distance:</strong> ${distanceKm} km</p>
    `;

  } catch (err) {
    console.error("Error fetching airport distance:", err);
    clearRoutesOnMap();
    document.getElementById('airportDistanceResult').innerHTML = `<p>Error loading distance between airports.</p>`;
  }
}


function addAirportMarker(lat, lon, airportName) {
  if (!map) return;

  // Remove previous marker if it exists
  if (currentMarker) {
    map.removeLayer(currentMarker);
  }

  // Add new marker and update reference
  currentMarker = L.marker([lat, lon])
    .addTo(map)
    .bindPopup(airportName)
    .openPopup();

  // Optional: center the map on the new marker
  map.setView([lat, lon], 6);
}

function clearRoutesOnMap() {
  // Clear route markers
  routeMarkers.forEach(marker => map.removeLayer(marker));
  routeMarkers = [];

  // Clear route lines
  routeLines.forEach(line => map.removeLayer(line));
  routeLines = [];

  // Clear single airport markers (like from Select an Airport)
  if (currentMarker) {
    map.removeLayer(currentMarker);
    currentMarker = null;
  }

  // Clear country markers (if needed)
  countryMarkers.forEach(marker => map.removeLayer(marker));
  countryMarkers = [];
}
