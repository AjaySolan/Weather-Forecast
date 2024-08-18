const searchBtn = document.querySelector(".search-btn");
const locationBtn = document.querySelector(".location-btn");
const cityInput = document.querySelector(".city-input");
const recentCitiesDropdown = document.querySelector(".recent-cities-dropdown");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "3f7c056cb1bc1c50f0c29bc9f5af25bb"; // API key of OpenWeatherMap API

// Existing geolocation function remains the same...
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_URL)
                .then(res => res.json())
                .then(data => {
                    const { name } = data[0];
                    saveCityToLocalStorage(name);
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => {
                    alert("An error occurred while fetching the city!");
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            }
        }
    );
};

// Load recent cities from localStorage on page load
window.onload = () => {
    loadRecentCities();
};

// Function to save city to localStorage
const saveCityToLocalStorage = (cityName) => {
    let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];

    // Check if the city is already in the list to avoid duplicates
    if (!recentCities.includes(cityName)) {
        recentCities.push(cityName);

        // Keep only the last 5 recent cities
        if (recentCities.length > 5) {
            recentCities.shift();
        }

        localStorage.setItem("recentCities", JSON.stringify(recentCities));
    }

    // Refresh the dropdown list
    loadRecentCities();
};

// Function to load recent cities from localStorage and populate the dropdown
const loadRecentCities = () => {
    let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
    recentCitiesDropdown.innerHTML = `<option value="" disabled selected>Recent Searches</option>`; // Reset dropdown

    recentCities.forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        recentCitiesDropdown.appendChild(option);
    });
};

// Function to handle search by city name
const getCityCoordinates = (cityNameFromDropdown) => {
    const cityName = cityNameFromDropdown || cityInput.value.trim();
    if (!cityName) return;

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { name, lat, lon } = data[0];
            saveCityToLocalStorage(name); // Save the city to localStorage
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
};

// Function to handle weather details based on coordinates
const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });

            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            fiveDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                }
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
};

// Event listener for dropdown selection
recentCitiesDropdown.addEventListener("change", () => {
    const cityName = recentCitiesDropdown.value;
    if (cityName) getCityCoordinates(cityName);
});

// Event listeners for buttons and input
locationBtn.addEventListener("click", getUserCoordinates);
searchBtn.addEventListener("click", () => getCityCoordinates());
cityInput.addEventListener("keyup", e => {
    if (e.key === "Enter") getCityCoordinates();
});

// Existing code for geolocation and weather card creation remains the same...

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}℃</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>

                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="logo-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } else {
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="logo-icon">
                    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}℃</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </li>`;
    }
};


