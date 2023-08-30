'use strict';

let selectedLocation;
const hour = new Date().getHours();

const searchBtn = document.querySelector('.search');
const carousel = document.querySelector('.carousel');

const weatherCode = new Map([
  [0, { weather: 'Clear Sky', icon: 'sun' }],
  [1, { weather: 'Mainly Clear', icon: 'cloud-sun' }],
  [2, { weather: 'Partly Cloudy', icon: 'cloud-sun' }],
  [3, { weather: 'Overcast', icon: 'cloud' }],
  [45, { weather: 'Fog' }],
  [48, { weather: 'Depositing rime fog' }],
  [51, { weather: 'Drizzle: Light' }],
  [53, { weather: 'Drizzle: Moderate' }],
  [55, { weather: 'Drizzle: Dense Intensity' }],
  [56, { weather: 'Freezing Drizzle: Light' }],
  [57, { weather: 'Freezing Drizzle: Dense Intensity' }],
  [61, { weather: 'Rain: Slight' }],
  [63, { weather: 'Rain: Moderate' }],
  [65, { weather: 'Rain: Heavy Intensity' }],
  [66, { weather: 'Freezing rain: Light' }],
  [67, { weather: 'Freezing rain: Heavy intensity' }],
  [71, { weather: 'Snow fall: Slight' }],
  [73, { weather: 'Snow fall: Moderate' }],
  [75, { weather: 'Snow fall: Heavy intensity' }],
  [77, { weather: 'Snow Grains' }],
  [80, { weather: 'Rain Showers: Slight' }],
  [81, { weather: 'Rain Showers: Moderate' }],
  [82, { weather: 'Rain Showers: Violent' }],
  [85, { weather: 'Snow Showers: Slight' }],
  [86, { weather: 'Snow Showers: Heavy' }],
  [95, { weather: 'Thunderstorm: Slight or Moderate' }],
  [96, { weather: 'Thunderstorm with heavy hail' }],
  [99, { weather: 'Thunderstorm with slight hail' }],
]);

const locations = [
  'bucuresti',
  'pitesti',
  'craiova',
  'constanta',
  'lunca corbului',
  'cerbu,arges',
  'brasov',
  'sibiu',
  'cluj',
  'iasi',
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

const createCard = function (data, coord, slide) {
  // console.log(data);
  let html;
  html = `
              <div class="card">
                <p class="temperature">${
                  data.hourly.temperature_2m[hour]
                } °C</p>
                <p class = "weather">Weather: ${
                  weatherCode.get(data.hourly.weathercode[hour]).weather
                }
                <p class="location">${coord[0].display_name}</p>
              </div>`;
  slide.insertAdjacentHTML('afterbegin', html);
};

//RENDER THE SLIDES AFTER FETCHING THE DATA FOR THE COORDINATES OF EACH LOCATION, AND USE THE COORDS TO FURTHER FETCH THE WEATHER DATA

const getWeatherDataForCarousel = async function (locations) {
  const coordsPr = [];
  const carouselDataPr = [];
  locations.forEach(location => {
    coordsPr.push(
      fetch(`https://geocode.maps.co/search?q={${location}}`).then(response =>
        response.json()
      )
    );
  });
  const coords = await Promise.all(coordsPr);
  coords.forEach(coord => {
    carouselDataPr.push(
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coord[0].lat}&longitude=${coord[0].lon}&hourly=temperature_2m,weathercode&timeformat=unixtime&timezone=auto&forecast_days=1`
      ).then(response => response.json())
    );
  });
  const carouselData = await Promise.all(carouselDataPr);
  // console.log(carouselData);
  // console.log(coords);
  renderCarousel(
    carouselData,
    coords,
    Math.trunc(document.body.getBoundingClientRect().width / 300)
  );
};

const renderCarousel = function (data, coords, cardsPerSlide) {
  // console.log(data.cities);
  data = data.reverse();
  coords = coords.reverse();
  // console.log(coords);
  const noSlides = Math.trunc(data.length / cardsPerSlide);
  for (let i = 1; i <= noSlides; i++) {
    const slide = document.createElement('div');
    slide.classList.add('slide');
    for (
      let j = i * cardsPerSlide - cardsPerSlide;
      j < i * cardsPerSlide;
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

//CAROUSEL FUNCTIONALITY

const makeCarousel = function () {
  const slides = document.querySelectorAll('.slide');
  const btnLeft = document.querySelector('.slider__btn--left');
  const btnRight = document.querySelector('.slider__btn--right');
  const dotContainer = document.querySelector('.dots');

  let curSlide = 0;
  const totalSlides = slides.length;
  console.log(slides);

  // Functions

  const setInitialClasses = function () {
    // Targets the previous, current, and next items
    // This assumes there are at least three items.
    slides[totalSlides - 1].classList.add('prev');
    slides[0].classList.add('active');
    slides[1].classList.add('next');
  };
  const createDots = function () {
    slides.forEach(function (_, i) {
      dotContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  };

  const activateDot = function (slide) {
    document
      .querySelectorAll('.dots__dot')
      .forEach(dot => dot.classList.remove('dots__dot--active'));

    document
      .querySelector(`.dots__dot[data-slide="${slide}"]`)
      .classList.add('dots__dot--active');
  };

  const goToSlide = function (slide) {
    // Update the "old" adjacent slides with "new" ones
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
      oldNext = slide + 1;
    } else if (slide === totalSlides - 1) {
      newPrevious = slide - 1;
      newNext = 0;
      oldNext = 1;
    }

    // Now we've worked out where we are and where we're going,
    // by adding/removing classes we'll trigger the transitions.
    // Reset old next/prev elements to default classes
    slides[oldPrevious].className = 'slide';
    slides[oldNext].className = 'slide';
    // Add new classes
    slides[newPrevious].className = 'slide' + ' prev';
    slides[slide].className = 'slide' + ' active';
    slides[newNext].className = 'slide' + ' next';
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
  btnRight.addEventListener('click', nextSlide);
  btnLeft.addEventListener('click', prevSlide);
  carousel.addEventListener('swiped-left', nextSlide);
  carousel.addEventListener('swiped-right', prevSlide);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') prevSlide();
    e.key === 'ArrowRight' && nextSlide();
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

//START FETCHING THE DATA ON LOAD FOR THE LOCATION FILE ONLY IF IN THE PAGE EXISTS THE CAROUSEL

if (document.querySelector('.carousel')) {
  window.addEventListener('load', function () {
    getWeatherDataForCarousel(locations);
    console.log(Math.trunc(document.body.getBoundingClientRect().width / 300));
  });
  carousel.addEventListener('click', function (e) {
    if (e.target.closest('.card')) {
      selectedLocation = e.target
        .closest('.card')
        .querySelector('.location').textContent;
      localStorage.setItem('selectedLocation', `${selectedLocation}`);
      window.location.href = 'weather.html';
    }
  });
}

searchBtn.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    selectedLocation = searchBtn.value;
    localStorage.setItem('selectedLocation', `${selectedLocation}`);
    window.location.href = './weather.html';
  }
});

const getWeatherWithChosenLocation = async function (wlocation) {
  //fetch the location coords
  const coords = await fetch(
    `https://geocode.maps.co/search?q={${wlocation}}`
  ).then(response => response.json());

  //fetch the weather data with the coords
  const data = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${coords[0].lat}&longitude=${coords[0].lon}&hourly=temperature_2m,weathercode&&timeformat=unixtime&timezone=auto&forecast_days=1`
  ).then(response => response.json());

  document.querySelector('.weather').textContent = weatherCode.get(
    data.hourly.weathercode[hour]
  ).weather;
  document.querySelector('.temperature').textContent =
    data.hourly.temperature_2m[hour];
  document.querySelector('.location').textContent = coords[0].display_name;
  localStorage.removeItem('selectedLocation');
};

const getWeatherUsingGeolocation = function () {
  //select the status message element
  const statusMsg = document.querySelector('.error');
  //callback function
  const success = async function (position) {
    //storing coords
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    //using the coords to get info from api
    const data = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&timeformat=unixtime&timezone=auto&forecast_days=1`
    ).then(response => response.json());

    document.querySelector('.weather').textContent = weatherCode.get(
      data.hourly.weathercode[hour]
    ).weather;
    document.querySelector('.temperature').textContent =
      data.hourly.temperature_2m[hour];
    const locationName = (
      await fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`).then(
        response => response.json()
      )
    ).address.city;

    document.querySelector('.location').textContent = locationName;

    //setting the status message to ""
    statusMsg.textContent = '';
  };
  //error handling function
  const error = function (e) {
    statusMsg.textContent = e.message;
    statusMsg.textContent ??= 'Unable to retrieve your location.';
  };
  //checking if the geolocation api works
  if (!navigator.geolocation) {
    statusMsg.textContent = 'Geolocation is not supported by your browser.';
  } else {
    statusMsg.textContent = 'Locating...';
    navigator.geolocation.getCurrentPosition(success, error);
  }
};

if (window.location.pathname.includes('/weather.html'))
  window.addEventListener('load', function () {
    if (localStorage.getItem('selectedLocation'))
      getWeatherWithChosenLocation(localStorage.getItem('selectedLocation'));
    else getWeatherUsingGeolocation();
  });
