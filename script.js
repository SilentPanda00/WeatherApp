"use strict";

let selectedLocation;
const hour = new Date().getHours();
let cardsPerSlide;

const searchBtn = document.querySelector(".search");
const menuBtn = document.querySelector(".mobile-button");
const carousel = document.querySelector(".carousel");

const weatherCode = new Map([
  [
    0,
    {
      weather: "Clear Sky",
      iconDay: "clear-sky-day",
      iconNight: "clear-sky-night",
    },
  ],
  [
    1,
    {
      weather: "Mainly Clear",
      iconDay: "mainly-clear-day",
      iconNight: "mainly-clear-night",
    },
  ],
  [
    2,
    {
      weather: "Partly Cloudy",
      iconDay: "partly-clowdy-day",
      iconNight: "partly-clowdy-night",
    },
  ],
  [3, { weather: "Overcast", iconDay: "overcast" }],
  [45, { weather: "Fog", iconDay: "fog" }],
  [48, { weather: "Depositing rime fog", iconDay: "fog" }],
  [51, { weather: "Drizzle: Light", iconDay: "rain" }],
  [53, { weather: "Drizzle: Moderate" }],
  [55, { weather: "Drizzle: Dense Intensity" }],
  [56, { weather: "Freezing Drizzle: Light" }],
  [57, { weather: "Freezing Drizzle: Dense Intensity" }],
  [61, { weather: "Rain: Slight", iconDay: "rain-slight" }],
  [63, { weather: "Rain: Moderate", iconDay: "rain-moderate" }],
  [65, { weather: "Rain: Heavy Intensity", iconDay: "rain-heavy" }],
  [66, { weather: "Freezing rain: Light", iconDay: "freezing-rain" }],
  [67, { weather: "Freezing rain: Heavy intensity", iconDay: "freezing-rain" }],
  [71, { weather: "Snow fall: Slight", iconDay: "snow" }],
  [73, { weather: "Snow fall: Moderate", iconDay: "snow" }],
  [75, { weather: "Snow fall: Heavy intensity", iconDay: "snow" }],
  [77, { weather: "Snow Grains", iconDay: "snow" }],
  [80, { weather: "Rain Showers: Slight", iconDay: "rain-slight" }],
  [81, { weather: "Rain Showers: Moderate", iconDay: "rain-moderate" }],
  [82, { weather: "Rain Showers: Violent", iconDay: "storm" }],
  [85, { weather: "Snow Showers: Slight", iconDay: "snow" }],
  [86, { weather: "Snow Showers: Heavy", iconDay: "snow" }],
  [95, { weather: "Thunderstorm: Slight or Moderate", iconDay: "storm" }],
  [96, { weather: "Thunderstorm with heavy hail", iconDay: "storm" }],
  [99, { weather: "Thunderstorm with slight hail", iconDay: "hailstorm" }],
]);

const locations = [
  "bucuresti",
  "pitesti",
  "craiova",
  "constanta",
  "brasov",
  "sibiu",
  "cluj-napoca",
  "iasi",
  "targu jiu",
  "ramnicu valcea",
  "ploiesti",
  "buzau",
  "galati",
  "focsani",
  "bacau",
  "suceava",
  "botosani",
  "piatra neamt",
  "timisoara",
];

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// const capitalize = function (str) {
//   return str
//     ?.split(' ')
//     .forEach(word => word[0].toUpperCase() + word.slice(1))
//     ?.join(' ');
// };

//retrieving the corect hour for the forecast
// const getForecastHour = function () {
//   const navigatorDate = new Date();
//   return navigatorDate.getHours() + navigatorDate.getTimezoneOffset() / 60;
// };

// const hour = getForecastHour();
// console.log(hour);

const displayTime = function (data) {
  const locationTimeZone = data.timezone;
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

  const localDate = new Date().toLocaleString("en-US", options);

  document.getElementById("date").textContent = `${
    localDate.split(",")[0]
  } ${localDate.slice(-11, -3)}`;
};

const renderWeatherData = function (location, data) {
  console.log(data);
  const weatherObj = weatherCode.get(data.hourly.weathercode[hour]);
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
      document.getElementById(field).textContent = data.daily[field][0];
    } else {
      document.getElementById(field).textContent =
        data.hourly[field][hour] + data.hourly_units[field];
    }
  });
  document.getElementById("weather").textContent = weatherObj.weather;
  document.getElementById("is_day").textContent = data.hourly.is_day
    ? "Day"
    : "Night";
  document.getElementById("location").textContent = location;

  //Displaying a marker if the location is current location of the
  const icon = document.createElement("i");
  const stored = localStorage.getItem("selectedLocation");
  icon.classList.add("fa-solid");
  icon.classList.add("fa-location-dot");
  console.log(location);

  document.querySelector(".location").prepend(icon);

  //displaying the time
  displayTime(data);
  setInterval(displayTime, 1000, data);

  document.getElementById("weather-icon").innerHTML = `<img
  src="./Pictures/flaticon/png/${
    data.is_day
      ? weatherObj.iconDay
      : weatherObj.iconNight || weatherObj.iconDay
  }-color.png"
/>`;

  document.querySelector(".current-weather").classList.remove("hidden");
};

const getCardsPerSlide = function () {
  const maxWidth = Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
  switch (true) {
    case maxWidth <= 860:
      return 1;
    case maxWidth <= 1280:
      return 2;
    case maxWidth <= 1560:
      return 3;
  }
  return 3;
};
console.log(getCardsPerSlide());

const createCard = function (data, coord, slide) {
  // console.log(data);
  const weatherObj = weatherCode.get(data.current_weather.weathercode);
  let html;
  html = `
              <div class="card">
                <p class="location"><i class="fa-solid fa-location-dot"></i> ${
                  coord[0].display_name.split(",")[0]
                }</p>
                <div>
                  <div class="weather-icon">
                    <img  src ='./Pictures/flaticon/png/${
                      data.is_day
                        ? weatherObj.iconDay
                        : weatherObj.iconNight || weatherObj.iconDay
                    }-color.png'>
                  </div>
                  <p class="temperature">${Math.round(
                    data.current_weather.temperature
                  )} °C</p>
                </div>
                <p class = "weather">${
                  weatherCode.get(data.current_weather.weathercode).weather
                }</p>
              </div>`;
  slide.insertAdjacentHTML("afterbegin", html);
};

//RENDER THE SLIDES AFTER FETCHING THE DATA FOR THE COORDINATES OF EACH LOCATION, AND USE THE COORDS TO FETCH THE WEATHER DATA

const renderCarousel = function (data, coords) {
  // console.log(data.cities);
  data = data.reverse();
  coords = coords.reverse();
  // console.log(coords);
  const noSlides = Math.trunc(data.length / cardsPerSlide);
  for (let i = 1; i <= noSlides; i++) {
    const slide = document.createElement("div");
    slide.classList.add("slide");
    for (
      let j = i * cardsPerSlide - cardsPerSlide + 1;
      j <= i * cardsPerSlide;
      j++
    ) {
      if (data[j]) {
        createCard(data[j], coords[j], slide);
      }
    }
    carousel.prepend(slide);
  }

  makeCarousel();
};

const getWeatherDataForCarousel = async function (locations) {
  const coordsPr = [];
  const carouselDataPr = [];
  locations.forEach((location) => {
    coordsPr.push(
      fetch(`https://geocode.maps.co/search?q={${location}}`).then((response) =>
        response.json()
      )
    );
  });
  const coords = await Promise.all(coordsPr);
  coords.forEach((coord) => {
    carouselDataPr.push(
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coord[0].lat}&longitude=${coord[0].lon}&hourly=temperature_2m,weathercode&current_weather=true&timeformat=unixtime&timezone=auto&models=best_match&forecast_days=1`
      ).then((response) => response.json())
    );
  });
  const carouselData = await Promise.all(carouselDataPr);
  // console.log(carouselData);
  // console.log(coords);
  renderCarousel(carouselData, coords);
};

//CAROUSEL FUNCTIONALITY

const makeCarousel = function () {
  let [...slides] = document.querySelectorAll(".slide");
  const btnLeft = document.querySelector(".slider__btn--left");
  const btnRight = document.querySelector(".slider__btn--right");
  const dotContainer = document.querySelector(".dots");

  let curSlide = 0;
  if (cardsPerSlide === 1) slides = slides.slice(1);
  const totalSlides = slides.length;
  // console.log(slides);

  // Functions

  const setInitialClasses = function () {
    // Targets the previous, current, and next items
    // This assumes there are at least three items.
    slides[totalSlides - 1].classList.add("prev");
    slides[0].classList.add("active");
    slides[1].classList.add("next");
  };
  const createDots = function () {
    slides.forEach(function (_, i) {
      dotContainer.insertAdjacentHTML(
        "beforeend",
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  };

  const activateDot = function (slide) {
    document
      .querySelectorAll(".dots__dot")
      .forEach((dot) => dot.classList.remove("dots__dot--active"));

    document
      .querySelector(`.dots__dot[data-slide="${slide}"]`)
      .classList.add("dots__dot--active");
  };

  const goToSlide = function (slide) {
    // Update the "old" adjacent slides with "new" ones
    curSlide = slide;
    let newPrevious = slide - 1;
    let newNext = slide + 1;
    let oldPrevious = slide - 2;
    let oldNext = slide + 2;

    // Test if carousel has more than three items
    if (totalSlides - 1 > 3) {
      if (newPrevious <= 0) {
        oldPrevious = totalSlides - 1;
      } else if (newNext >= totalSlides - 1) {
        oldNext = 0;
      }
    }

    // Checks and updates if slide is at the beginning/end
    if (slide === 0) {
      newPrevious = totalSlides - 1;
      oldPrevious = totalSlides - 2;
      oldNext = slide + 2;
    } else if (slide === totalSlides - 1) {
      newPrevious = slide - 1;
      newNext = 0;
      oldNext = 1;
    }

    // Now we've worked out where we are and where we're going,
    // by adding/removing classes we'll trigger the transitions.
    // Reset old next/prev elements to default classes
    slides[oldPrevious].className = "slide";
    slides[oldNext].className = "slide";
    // Add new classes
    slides[newPrevious].className = "slide" + " prev";
    slides[slide].className = "slide" + " active";
    slides[newNext].className = "slide" + " next";
  };

  // Next slide
  const nextSlide = function () {
    if (curSlide === totalSlides - 1) {
      curSlide = 0;
    } else {
      curSlide++;
    }
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  //Prev slide
  const prevSlide = function () {
    if (curSlide === 0) {
      curSlide = totalSlides - 1;
    } else {
      curSlide--;
    }
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const init = function () {
    setInitialClasses();
    createDots();

    activateDot(0);
  };
  init();

  // Event handlers
  btnRight.addEventListener("click", nextSlide);
  btnLeft.addEventListener("click", prevSlide);
  carousel.addEventListener("swiped-left", nextSlide);
  carousel.addEventListener("swiped-right", prevSlide);

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") prevSlide();
    e.key === "ArrowRight" && nextSlide();
  });

  // dotContainer.addEventListener('click', function (e) {
  //   if (e.target.classList.contains('dots__dot')) {
  //     const { slide } = e.target.dataset;
  //     console.log(slide);
  //     goToSlide(slide);
  //     activateDot(slide);
  //   }
  // });
};

const getWeatherWithChosenLocation = async function (wlocation) {
  const statusMsg = document.querySelector(".error");
  let coords, data;
  //fetch the location coords
  statusMsg.textContent = "Getting coords...";
  try {
    coords = await fetch(
      `https://geocode.maps.co/search?q={${wlocation}}`
    ).then((response) => response.json());
  } catch (error) {
    statusMsg.textContent = `Could not get the coordinates for the location: ${error.message}.`;
  }

  //fetch the weather data with the coords
  statusMsg.textContent = "Getting weather data...";
  try {
    data = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords[0].lat}&longitude=${coords[0].lon}&hourly=temperature_2m,apparent_temperature,precipitation_probability,weathercode,pressure_msl,surface_pressure,cloudcover,visibility,evapotranspiration,windspeed_10m,windspeed_80m,winddirection_10m,winddirection_80m,uv_index,uv_index_clear_sky,is_day&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_hours,precipitation_probability_max,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&current_weather=true&timezone=auto&forecast_days=14&models=best_match`
    ).then((response) => response.json());
  } catch (error) {
    statusMsg.textContent = `Couldn't get the weather data for ${wlocation}: ${error.message}.`;
  }

  renderWeatherData(coords[0].display_name, data);

  statusMsg.classList.add("hidden");
};

const getWeatherUsingGeolocation = function () {
  //select the status message element
  const statusMsg = document.querySelector(".error");
  let data, locationName;

  //callback function
  const success = async function (position) {
    statusMsg.textContent = "Getting weather data...";

    //storing coords
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    //using the coords to get info from api
    try {
      data = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,precipitation_probability,weathercode,pressure_msl,surface_pressure,cloudcover,visibility,evapotranspiration,windspeed_10m,windspeed_80m,winddirection_10m,winddirection_80m,uv_index,uv_index_clear_sky,is_day&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_hours,precipitation_probability_max,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&current_weather=true&timezone=auto&forecast_days=14&models=best_match`
      ).then((response) => response.json());
    } catch (error) {
      statusMsg.textContent = `Could not get the weather data for the current location: ${error.message}`;
    }
    // console.log(data);
    try {
      locationName = (
        await fetch(
          `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`
        ).then((response) => response.json())
      ).address.city;
    } catch (error) {
      statusMsg.textContent = error.message;
    }

    renderWeatherData(locationName, data);

    //setting the status message to ""
    statusMsg.textContent = "";
    statusMsg.classList.add("hidden");
  };
  //error handling function
  const error = function (e) {
    statusMsg.textContent = e.message;
    statusMsg.textContent ??= "Unable to retrieve your location.";
  };
  //checking if the geolocation api works
  if (!navigator.geolocation) {
    statusMsg.textContent = "Geolocation is not supported by your browser.";
  } else {
    statusMsg.textContent = "Locating...";
    navigator.geolocation.getCurrentPosition(success, error);
  }
};

//EVENT LISTENERS

window.addEventListener("resize", () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
});

//START FETCHING THE DATA ON LOAD FOR THE LOCATION FILE ONLY IF THE CAROUSEL EXISTS IN THE PAGE

if (document.querySelector(".carousel")) {
  window.addEventListener("load", function () {
    getWeatherDataForCarousel(locations);
  });
  carousel.addEventListener("click", function (e) {
    if (e.target.closest(".card")) {
      selectedLocation = e.target
        .closest(".card")
        .querySelector(".location").textContent;
      localStorage.setItem("selectedLocation", `${selectedLocation}`);
      window.location.href = "weather.html";
    }
  });
}

if (window.location.pathname.includes("/weather.html"))
  window.addEventListener("load", function () {
    if (localStorage.getItem("selectedLocation"))
      getWeatherWithChosenLocation(localStorage.getItem("selectedLocation"));
    else getWeatherUsingGeolocation();
  });

searchBtn.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    selectedLocation = searchBtn.value;
    localStorage.setItem("selectedLocation", `${selectedLocation}`);
    window.location.href = "./weather.html";
  }
});

menuBtn.addEventListener("click", (e) => {
  const mBtn = e.target.closest(".mobile-button");
  mBtn.nextElementSibling.classList.toggle("hidden");
  mBtn.getElementsByTagName("i")[0].classList.toggle("fa-bars");
  mBtn.getElementsByTagName("i")[0].classList.toggle("fa-xmark");
});

window.addEventListener("load", () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
  cardsPerSlide = getCardsPerSlide();
});

// fetch(
//   "https://api.open-meteo.com/v1/forecast?latitude=44.4234&longitude=26.1687&hourly=temperature_2m,apparent_temperature,precipitation_probability,weathercode,pressure_msl,surface_pressure,cloudcover,visibility,evapotranspiration,windspeed_10m,windspeed_80m,winddirection_10m,winddirection_80m,uv_index,uv_index_clear_sky,is_day&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_hours,precipitation_probability_max,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&current_weather=true&timezone=auto&forecast_days=14&models=best_match"
// )
//   .then((response) => response.json())
//   .then((data) => console.log(data));
