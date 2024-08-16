const searchBtn = document.querySelector(".search-btn");
const locationBtn = document.querySelector(".location-btn");
const cityInput = document.querySelector(".city-input");
const currentWeatherDiv = document.querySelector(".current-weather")
const weatherCardsDiv = document.querySelector(".weather-cards")

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0 ){
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}℃</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>

                <div class="icon">
                    <img src="logo.png" alt="logo-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    }else{
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="logo.png" alt="logo-icon">
                    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}℃</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </li>`;
    }
} 

const API_KEY = "3f7c056cb1bc1c50f0c29bc9f5af25bb"; //API key of openweathermap api

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL =`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {

        //filter the forecast to get only one forecast per day
        const uniqueForecastDays = []; 
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        });

        //clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = ""; 
        weatherCardsDiv.innerHTML = ""; 

        
        //create weather cards and adding them to DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            if(index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }else{
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
        })
    }).catch(() => {
        alert("An error occured while fetching weather forecast");
    }); 
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();  //get user entered city name and remove extra spaces
    if(!cityName) return; //return if cityName is empty
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;


    //get enterend city coordinates (latitude, longitude and name) from the API response
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {if(!data.length)return alert(`No co-ordinates found of ${cityName}`)
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occured while fetching the co-ordinates!");
    });

}
//Get city name from coordinates using reverse geocoding API
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position =>{
            const {latitude , longitude} = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occured while fetching the city!");
            });
        },
        error => {
            if(error.code = error.PERMISSION_DENIED){
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            }
        }
    )
}

locationBtn.addEventListener("click", getUserCoordinates);
searchBtn.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());


