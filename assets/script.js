const apiKey = "8c82be22be65fe6126ec4d642952ffa3";
const searchHistoryKey = "searchHistory";
let searchHistory = JSON.parse(localStorage.getItem(searchHistoryKey)) || [];

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const searchHistoryDiv = document.getElementById("searchHistory");
const weatherInfoDiv = document.getElementById("weatherInfo");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeatherData(city);
  }
});

function getWeatherData(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(response => response.json())
    .then(data => {
      const weatherData = {
        name: data.name,
        date: new Date().toLocaleDateString(),
        icon: data.weather[0].icon,
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed
      };
      showWeatherData(weatherData);
      addToSearchHistory(weatherData.name);
      return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
    })
    .then(response => response.json())
    .then(data => {
      const forecastData = parseForecastData(data);
      showForecastData(forecastData);
    })
    .catch(error => {
      console.error("Error fetching weather data:", error);
      alert("City not found. Please enter a valid city name.");
    });
}

function parseForecastData(data) {
  const forecastData = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set the time to 00:00:00 for accurate comparison

  for (const item of data.list) {
    const forecastDate = new Date(item.dt * 1000);
    forecastDate.setHours(0, 0, 0, 0);

    // Check if the forecast date is greater than today's date and not already in forecastData
    if (forecastDate.getTime() > today.getTime() && !forecastData.some(entry => entry.date === forecastDate.toLocaleDateString())) {
      const date = forecastDate.toLocaleDateString();
      const icon = item.weather[0].icon;
      const temperature = item.main.temp;
      const humidity = item.main.humidity;
      const windSpeed = item.wind.speed;
      forecastData.push({ date, icon, temperature, humidity, windSpeed });
    }
  }
  return forecastData;
}

function showWeatherData(data) {
  const weatherDiv = document.createElement("div");
  weatherDiv.classList.add("weather-card");
  weatherDiv.innerHTML = `
    <p><strong>${data.name}</strong> - ${data.date}</p>
    <img src="http://openweathermap.org/img/w/${data.icon}.png" alt="Weather Icon">
    <p>Temperature: ${data.temperature}°C</p>
    <p>Humidity: ${data.humidity}%</p>
    <p>Wind Speed: ${data.windSpeed} m/s</p>
  `;
  weatherInfoDiv.innerHTML = "";
  weatherInfoDiv.appendChild(weatherDiv);
}

function showForecastData(data) {
  weatherInfoDiv.innerHTML = "";
  for (const item of data) {
    const weatherDiv = document.createElement("div");
    weatherDiv.classList.add("weather-card");
    weatherDiv.innerHTML = `
      <p>Date: ${item.date}</p>
      <img src="http://openweathermap.org/img/w/${item.icon}.png" alt="Weather Icon">
      <p>Temperature: ${item.temperature}°C</p>
      <p>Humidity: ${item.humidity}%</p>
      <p>Wind Speed: ${item.windSpeed} m/s</p>
    `;
    weatherInfoDiv.appendChild(weatherDiv);
  }
}

function addToSearchHistory(city) {
  if (!searchHistory.includes(city)) {
    searchHistory.push(city);
    localStorage.setItem(searchHistoryKey, JSON.stringify(searchHistory));
    updateSearchHistoryUI();
  }
}

function updateSearchHistoryUI() {
  searchHistoryDiv.innerHTML = "";
  searchHistory.forEach(city => {
    const cityDiv = document.createElement("div");
    cityDiv.textContent = city;
    cityDiv.classList.add("weather-card");
    cityDiv.addEventListener("click", () => getWeatherData(city));
    searchHistoryDiv.appendChild(cityDiv);
  });
}

// Initialize the search history UI on page load
updateSearchHistoryUI();


