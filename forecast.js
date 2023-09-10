import { weatherCode } from "./data.js";

class Forecast {
  constructor() {
    this.coords = {}; // Initialize coords object
    this.statusMsg = document.querySelector(".error");

    //Load location from localStorage
    this.locationName = localStorage.getItem("selectedLocation");

    //If it isn't in localStorage, try to get it  from geolocation
    if (!this.locationName) {
      this.getLocation()
        .then((locationName) => {
          this.locationName = locationName;
          this.init(); //Call the init after setting locationName
        })
        //Handle error getting locationName
        .catch((error) => (this.statusMsg.textContent = error.message));
    } else {
      this.init(); //Call init if locationName is already available
    }
  }

  async init() {
    await this.getWeather();
    this.getCorrectTime();
    this.getCorrectHour();
    this.renderWeatherData();
  }

  async getLocation() {
    return new Promise((resolve, reject) => {
      const success = async (position) => {
        try {
          let lat = position.coords.latitude;
          let lon = position.coords.longitude;

          const response = await fetch(
            `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`
          );
          const data = await response.json();
          const locationName = data.address.city;
          this.statusMsg.textContent = data;

          resolve(locationName);
        } catch (error) {
          reject(error);
        }
      };

      const error = (e) => {
        this.statusMsg.textContent = e.message;
        this.statusMsg.textContent ??= "Unable to retrieve your location.";
        reject(e);
      };

      // Checking if the geolocation api works
      if (!navigator.geolocation) {
        this.statusMsg.textContent =
          "Geolocation is not supported by your browser.";
      } else {
        this.statusMsg.textContent = "Locating...";
        navigator.geolocation.getCurrentPosition(success, error);
      }
    });
  }

  async getWeather() {
    try {
      this.statusMsg.textContent = "Getting coords...";

      const coordsResponse = await fetch(
        `https://geocode.maps.co/search?q=${this.locationName}`
      );

      if (!coordsResponse.ok) {
        throw new Error(
          `Failed to fetch location coordinates (HTTP ${coordsResponse.status})`
        );
      }

      const coordsData = await coordsResponse.json();

      //getting the full name of the location
      this.locationName = coordsData[0].display_name;

      this.statusMsg.textContent = ``;

      this.statusMsg.textContent = "Getting weather data...";
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coordsData[0].lat}&longitude=${coordsData[0].lon}&hourly=temperature_2m,apparent_temperature,precipitation_probability,weathercode,pressure_msl,surface_pressure,cloudcover,visibility,evapotranspiration,windspeed_10m,windspeed_80m,winddirection_10m,winddirection_80m,uv_index,uv_index_clear_sky,is_day&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_hours,precipitation_probability_max,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&current_weather=true&timezone=auto&forecast_days=14&models=best_match`
      );

      if (!weatherResponse.ok) {
        throw new Error(
          `Failed to fetch weather data (HTTP ${weatherResponse.status})`
        );
      }

      this.weatherData = await weatherResponse.json();

      this.statusMsg.classList.add("hidden");
      localStorage.clear();
    } catch (error) {
      this.statusMsg.textContent = `Error: ${error.message}`;
    }
  }

  renderWeatherData() {
    const localHour = this.localHour;
    const weatherObj = weatherCode.get(
      this.weatherData.hourly.weathercode[localHour]
    );
    const fields = [
      "temperature_2m",
      "temperature_2m_max",
      "temperature_2m_min",
      "windspeed_10m",
      "winddirection_10m",
      "apparent_temperature",
      "cloudcover",
      "precipitation_probability",
      "surface_pressure",
      "uv_index",
      "visibility",
    ];
    fields.forEach((field) => {
      if (field.startsWith("temperature_2m_m")) {
        document.getElementById(field).textContent =
          this.weatherData.daily[field][0];
      } else {
        document.getElementById(field).textContent =
          this.weatherData.hourly[field][localHour] +
          this.weatherData.hourly_units[field];
      }
    });
    document.getElementById("weather").textContent = weatherObj.weather;
    document.getElementById("is_day").textContent = this.weatherData.hourly
      .is_day[localHour]
      ? "Day"
      : "Night";
    document.getElementById("location").textContent = this.locationName;

    // displaying the time
    this.displayTime();
    setInterval(() => this.displayTime(), 1000);

    // setInterval(this.displayTime, 1000);

    document.getElementById("weather-icon").innerHTML = `<img
      src="./Pictures/flaticon/png/${
        this.weatherData.hourly.is_day[localHour]
          ? weatherObj.iconDay
          : weatherObj.iconNight || weatherObj.iconDay
      }-color.png"
    />`;

    document.querySelector(".current-weather").classList.remove("hidden");
  }

  async getCorrectTime() {
    try {
      const locationTimeZone = this.weatherData.timezone;
      const options = {
        timeZone: locationTimeZone,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      };

      this.localTime = new Date().toLocaleString("en-US", options);
    } catch (error) {
      this.statusMsg.textContent = `Error: ${error.message}`;
    }
  }

  getCorrectHour() {
    let hour = Number(this.localTime.slice(-11, -9));
    if (hour === 12) return hour;
    if (this.localTime.endsWith("PM")) {
      hour += 12;
    }
    this.localHour = hour;
  }

  displayTime() {
    this.getCorrectTime();
    this.getCorrectHour();
    const localHour = this.localTime;
    document.getElementById("time").textContent = `${
      localHour.split(",")[0]
    } ${localHour.slice(-11)}`;
  }
}

export default Forecast;
