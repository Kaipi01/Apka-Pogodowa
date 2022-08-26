require("dotenv").config();
import cloudsImg from "../src/images/clouds.jpg";
import sunriseImg from "../src/images/sunrise.jpg";
const cityInput = document.querySelector("#city");
const weatherError = document.querySelector(".weather__error");

cityInput.addEventListener("input", (event) => getWeather(event.target.value));
window.onload = () => (cityInput.value = "");

const geo = navigator.geolocation;
if (geo) {
  geo.getCurrentPosition(
    function (location) {
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      getCity(lat, lng);
    },
    function () {
      getWeather("Warszawa");
    }
  );
} else {
  getWeather("Warszawa");
}

async function getWeather(city) {
  const apiKey = process.env.WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pl`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    displayWeather(await data);
    weatherError.classList.add("weather__error--hide");
  } catch (e) {
    console.error(`Cannot find city names "${city}"`);
    if (cityInput.value !== "") {
      weatherError.classList.remove("weather__error--hide");
    } else weatherError.classList.add("weather__error--hide");
  }
}

function displayWeather(data) {
  const { name, visibility, timezone } = data;
  const { temp, feels_like, humidity, pressure } = data.main;
  const { speed } = data.wind;
  const { sunrise, sunset, country } = data.sys;
  const { description, icon } = data.weather[0];
  const date = new Date();
  const fullDate = date.toLocaleDateString("PL-pl");
  const hour = Math.floor(date.getHours() + timezone / 3600 - 2);
  const minute = date.getMinutes();
  const sunriseHour = new Date(sunrise * 1000).getHours();
  const sunsetHour = new Date(sunset * 1000).getHours();
  const sunriseMinutes = new Date(sunrise * 1000).getMinutes();
  const sunsetMinutes = new Date(sunset * 1000).getMinutes();
  const time = `${hour}:${minute < 10 ? "0" + minute : minute}`;
  const sunriseTime = `${sunriseHour}:${
    sunriseMinutes < 10 ? "0" + sunriseMinutes : sunriseMinutes
  }`;
  const sunsetTime = `${sunsetHour}:${
    sunsetMinutes < 10 ? "0" + sunsetMinutes : sunsetMinutes
  }`;

  getCityImage(name);
  document.querySelector(".weather__date").textContent = fullDate;
  document.querySelector(".weather__time").textContent = time;
  document.querySelector(".weather__city").textContent = name;
  document.querySelector(".weather__country").textContent = country;
  document.querySelector(".weather__temp").textContent = temp;
  document.querySelector(
    ".weather__icon"
  ).src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  document.querySelector(".weather__description").textContent = description;
  document.querySelector(".weather__tempLikesValue").textContent = feels_like;
  document.querySelector(".weather__sunrise").textContent = sunriseTime;
  document.querySelector(".weather__sunset").textContent = sunsetTime;
  document.querySelector(".weather__windValue").textContent = speed;
  document.querySelector(".weather__humidityValue").textContent = humidity;
  document.querySelector(".weather__visibilityValue").textContent =
    visibility / 1000;
  document.querySelector(".weather__pressureValue").textContent = pressure;
}

async function getCityImage(city) {
  const bgImageURL = `https://source.unsplash.com/1920x1080/?%22${city}%22`;
  try {
    const response = await fetch(bgImageURL);
    const imageUrl = new URL(response.url);
    const bodyStyle = document.body.style;
    if (imageUrl.pathname === "/source-404") {
      if (window.innerWidth >= window.innerHeight) {
        bodyStyle.backgroundImage = `url(${sunriseImg})`;
      } else {
        bodyStyle.backgroundImage = `url(${cloudsImg})`;
      }
    } else {
      bodyStyle.backgroundImage = `url("${bgImageURL}")`;
    }
  } catch (e) {
    console.log(e);
  }
  document.querySelector("main").classList.remove("hide");
  document.querySelector(".spin").classList.add("hide");
}

async function getCity(lat, lng) {
  const apiKey = process.env.GEOLOCATION_API_KEY;
  const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&lang=pl&apiKey=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const city = await data.features[0].properties.city;
    getWeather(await city);
  } catch (e) {
    console.log(e);
  }
}
