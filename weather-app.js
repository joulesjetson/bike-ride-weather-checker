// ===================================================================
// BIKE RIDE WEATHER APP 
// ===================================================================

// Overview of project:
// Get user's location
// Display 3 clickable buttons:
// - "Feels-like" temperature
// - Chance of precipitation
// - Wind conditions (wind speed, wind direction, gusts)
// When user clicks a button, it displays the selected conditions below
// For simplicity, look only at CURRENT WEATHER conditions
//
// Future improvements:
// - set an hourly duration of ride to get forecast for length of ride
// - add helpful advice statements

// ===================================================================
// DEFINE GLOBAL VARIABLES
// ===================================================================

/** 
 * TO DO:
 * 
 * Need 2 global variables to store user's coordinates
 * Get coordinates from browser geolocation API and use for all API calls
 */

let userLatitude = null;
let userLongitude = null;


// ===================================================================
// GET USER'S LOCATION
// ===================================================================

/**
 * TO DO:
 * 
 * Need 3 functions:
 * - a function to request the user's location 
 * - a function to handle the errors if something goes wrong
 * - a function to receive and store the location data
 * 
 * Use the browser's Geolocation API to get user's current position
 * Browser propmt will appear to ask for permission first
 * - If permission granted:
 *     - Extract latitude and longitude from the position
 *     - Store them in global variables (userLatitude, userLongitude)
 *     - Call displayButtons() to show the three option buttons
 * - If permission denied or error:
 *     - Show error message to user
 *     - For future: provide user with an alternative way to share location
 */


/**
 * handleSuccess function
 * 
 * SUCCESS CALLBACK for geolocation
 * Runs when user allows location access
 */
function handleLocationSuccess(position) {
    // Extract latitude and longitude from the position object
    userLatitude = position.coords.latitude;
    userLongitude = position.coords.longitude;
    
    console.log('Location received:', userLatitude, userLongitude);
    document.getElementById('location-notice').style.display = 'none';
    
    // Update status message to show location retreived successfully
    document.getElementById('status-message').innerHTML = 
        '<p class="loading">Choose a weather condition to check:</p>';
    
    // Show the three weather option buttons 
    displayButtons();
}

/**
 * handleError function
 * 
 * ERROR CALLBACK for geolocation
 * Runs when user denies permission or if there's an error
 */
function handleLocationError(error) {
    let errorMessage = '';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = 'You denied location access. Please enable location permissions to use this app.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
        case error.TIMEOUT:
            errorMessage = 'The request to get your location timed out.';
            break;
        default:
            errorMessage = 'An unknown error occurred while getting your location.';
    }
    
    // Display the error message to the user
    document.getElementById('status-message').innerHTML = 
        `<p class="error">Error: ${errorMessage}</p>`;
}

/**
 * Function: getUserLocation()
 * 
 * Requests the user's current location using the browser's Geolocation API.
 * This triggers a permission prompt in the browser.
 */
function getUserLocation() {
    // Check if the browser supports geolocation
    if (!navigator.geolocation) {
        document.getElementById('status-message').innerHTML = 
            '<p class="error">Geolocation is not supported by your browser</p>';
        return; 
    }
  
    // Show a loading message while waiting for permission and location
    document.getElementById('status-message').innerHTML = 
        '<p class="loading">Requesting your location...</p>';
    
    // Call the geolocation API -> triggers the browser's permission prompt
    // Pass the callback functions for handling success and errors
    navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError);
}


// ===================================================================
// DISPLAY THE CHOICE BUTTONS
// ===================================================================

/**
 * TO DO:
 * 
 * Create three buttons:
 *     1. "Feels-Like Temperature" button -> calls fetchTemperatureData()
 *     2. "Chance of Precipitation" button -> calls fetchPrecipitationData()
 *     3. "Wind Conditions" button -> calls fetchWindData()
 * 
 * - Call fetch function when user clicks button
 * - Hide the loading message if it's showing ?
 */

/**
 * Function: displayButtons()
 * 
 * Create and display three buttons that let the user choose
 * which weather condition to check for their bike ride.
 */
function displayButtons() {
    // find button container in HTML
    const buttonContainer = document.getElementById('button-container');
    
    // Create the three buttons!
    // Call appropriate fetch function when button clicked
    buttonContainer.innerHTML = `
            <button onclick="fetchTemperatureData()">Temperature</button>
            <button onclick="fetchPrecipitationData()">Chance of Precipitation</button>
            <button onclick="fetchWindData()">Wind Conditions</button>
    `;
}


// ===================================================================
// FETCH FUNCTIONS 
// ===================================================================

/**
 * TO DO:
 * 
 * Need 3 functions which make API calls to Open Meteo
 * - a function that fetches the temperature data (want "feels like" temp)
 * - a function that fetches the precipitation data (want chance of precip)
 * - a function that fetches the wind data - we may end up punting this to keep
 * it simple
 * 
 * Show the user a loading message while the data loads, jic it takes a while
 * Will also need to handle any errors
 * 
 * The blocks of code below are kind of repetitive 
 * - FUTURE IMPROVEMENTS: try using helper functions to avoid repitition?
 */

/**
 * Fetch temperature function -> same basic pattern for all 3 functions
 * 
 * - Show a loading message
 * - Build API URL with userLatitude and userLongitude
 * - Include only temperature-related parameters:
 *     - apparent_temperature (feels-like temp)
 *     - temperature_2m (actual temp for comparison)
 * - Make GET requests using fetch()
 * - Wait for response and parse JSON
 * - Call displayTemperature() with the data -> need to build in next section
 * - Handle any errors
 */

/**
 * Function: fetchTemperatureData()
 * 
 * Make a GET request to Open-Meteo API for temperature data.
 * Called when the user clicks the "Temperature" button.
 */
async function fetchTemperatureData() {
    // find appropriate display container 
    const displayDiv = document.getElementById('weather-display');
    
    // Show loading message while waiting for the API response
    displayDiv.innerHTML = '<p class="loading">Fetching temperature data...</p>';
    
    try {
        // Build the API URL for temp-related parameters of interest
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${userLatitude}&longitude=${userLongitude}&current=apparent_temperature,temperature_2m&temperature_unit=fahrenheit`;
        
        // Make GET request and wait for response
        const response = await fetch(url);
        
        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse JSON response
        const data = await response.json();
        
        // Call display function to show the current temperature data
        displayTemperature(data.current);
        
    } catch (error) {
        // Show an error message if something goes wrong
        displayDiv.innerHTML = `<p class="error">Error fetching temperature data: ${error.message}</p>`;
    }
}


/**
 * Function: fetchPrecipitationData()
 * 
 * - Show loading message
 * - Build API URL with userLatitude and userLongitude
 * - Include only precipitation-related parameters:
 *     - precipitation_probability (chance of rain %)
 *     - precipitation (current precipitation amount)
 * - Make GET request using fetch()
 * - Wait for response and parse JSON
 * - Call displayPrecipitation() with the data -> need to build in next section
 * - Handle any errors
 */

/**
 * Function: fetchPrecipitationData()
 * 
 * Make a GET request to Open-Meteo API for precipitation data.
 * Called when the user clicks the "Chance of Precipitation" button.
 */
async function fetchPrecipitationData() {
    const displayDiv = document.getElementById('weather-display');
    displayDiv.innerHTML = '<p class="loading">Fetching precipitation data...</p>';
    
    try {
        // build precip url
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${userLatitude}&longitude=${userLongitude}&current=precipitation_probability,precipitation`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        displayPrecipitation(data.current);
        
    } catch (error) {
        displayDiv.innerHTML = `<p class="error">Error fetching precipitation data: ${error.message}</p>`;
    }
}

/**
 * Function: fetchWindData()
 * 
 * - Show loading message
 * - Build API URL with userLatitude and userLongitude
 * - Include only wind-related parameters:
 *     - wind_speed_10m (wind speed at 10 meters)
 *     - wind_direction_10m (wind direction in degrees)
 *     - wind_gusts_10m (wind gust speed)
 * - Make GET request using fetch()
 * - Wait for response and parse JSON
 * - Call displayWind() with the data -> need to build in next section
 * - Handle any errors
 */

/**
 * Function: fetchWindData()
 * 
 * Make a GET request to Open-Meteo API for wind data.
 * Called when the user clicks the "Wind Conditions" button.
 */
async function fetchWindData() {
    const displayDiv = document.getElementById('weather-display');
    displayDiv.innerHTML = '<p class="loading">Fetching wind data...</p>';
    
    try {
        // build wind url
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${userLatitude}&longitude=${userLongitude}&current=wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=mph`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        displayWind(data.current);
        
    } catch (error) {
        displayDiv.innerHTML = `<p class="error">Error fetching wind data: ${error.message}</p>`;
    }
}

// ===================================================================
// DISPLAY FUNCTIONS 
// ===================================================================

/**
 * TO DO:
 * 
 * Need 3 functions to display the data we get back from fetch() functions above
 * - get the weather-display container
 * - extract the relevant data values
 * - display info with the "weather-display" container in HTML
 * 
 * Will also need a function for converting degrees to cardinal direction for 
 * displaying wind direction
 */


/**
 * Function: displayTemperature(data)
 * 
 * Displays temperature data in the weather-display div.
 * Shows both actual temperature and "feels like" temperature.
 */
function displayTemperature(data) {
     // get the container
    const displayDiv = document.getElementById('weather-display');

    // extract temp values
    const feelsLike = data.apparent_temperature;
    const actualTemp = data.temperature_2m;

    // display the temperatures
    displayDiv.innerHTML = `
        <h2>Temperature</h2>
        <p><strong>Actual Temperature:</strong> ${actualTemp}°F</p>
        <p><strong>Feels Like:</strong> ${feelsLike}°F</p>
    `;
}

/**
 * Function: displayPrecipitation(data)
 * 
 * Displays precipitation data in the weather-display div.
 * Shows the chance of precip as a percentage.
 */
function displayPrecipitation(data) {
    const displayDiv = document.getElementById('weather-display');
    
    // extract precipitation probability
    const precipChance = data.precipitation_probability;
    
    // display the precipitation data
    displayDiv.innerHTML = `
        <h2>Precipitation</h2>
        <p><strong>Chance of Precipitation:</strong> ${precipChance}%</p>
    `;
}

/**
 * Function: displayWind(data)
 * 
 * Displays wind data in the weather-display div.
 * Shows wind speed, direction, and gusts.
 */
function displayWind(data) {
    const displayDiv = document.getElementById('weather-display');
    
    // extract wind data
    const windSpeed = data.wind_speed_10m;
    const windDirection = data.wind_direction_10m;
    const windGusts = data.wind_gusts_10m;
    
    // convert wind direction from degrees to cardinal direction
    const cardinalDirection = degreesToCardinal(windDirection);
    
    // display the wind data
    displayDiv.innerHTML = `
        <h2>Wind Conditions</h2>
        <p><strong>Wind Speed:</strong> ${windSpeed} mph</p>
        <p><strong>Direction:</strong> ${cardinalDirection} (${windDirection}°)</p>
        <p><strong>Gusts:</strong> ${windGusts} mph</p>
    `;
}


// ===================================================================
// CONVERT DEGREES TO CARDINAL DIRECTION
// ===================================================================

/**
 * TO DO:
 * 
 * Math! 
 * the API returns wind direction in degrees so need to convert to NSEW
 * - make an array with 8 cardinal direction options (N, NE, E, SE, S, SW, W, NW)
 * - each direction in array corresponds with 45 deg section (22.5 deg either side)
 * - use floor fctn to round down to an index in the array
 * - mod 8 to get back to 0 if necessary 
 * 
 * Degree ranges:
 * N:  337.5° - 22.5° 
 * NE: 22.5° - 67.5°
 * E:  67.5° - 112.5°
 * SE: 112.5° - 157.5°
 * S:  157.5° - 202.5°
 * SW: 202.5° - 247.5°
 * W:  247.5° - 292.5°
 * NW: 292.5° - 337.5°
 * 
 * Ex:
 * - pass function 355° 
 * - add 22.5 to passed in value to account for offset 
 * - divide by 45 to get 8 sections
 * - use floor function to round down to correct index
 * - mod 8 to get back to beginning
 * - (355 + 22.5) / 45 = 8.39
 * - floor(8.39) = 8
 * - 8 mod 8 = 0 -> N!
 * 
 * 
 * Could also implement with a bunch of if statements and ranges but that's 
 * repetitive and BOOOOOOOOORING
 */ 

/**
 * Function: degreesToCardinal(degrees)
 * 
 * Converts wind direction from degrees (0-360) to cardinal direction.
 */
function degreesToCardinal(degrees) {
    // array of cardinal directions in clockwise order
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    
    // Math!
    const index = Math.floor((degrees + 22.5) / 45) % 8;
    
    // return the corresponding direction
    return directions[index];
}

// ===================================================================
// INITIALIZATION 
// ===================================================================

/**
 * Automatically start the app when the page loads.
 * LFG
 */
getUserLocation();



