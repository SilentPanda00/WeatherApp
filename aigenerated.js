"use strict";

class WeatherApp {
  constructor() {
    this.selectedLocation = null;
    this.hour = new Date().getHours();
    this.cardsPerSlide = this.getCardsPerSlide();

    this.searchBtn = document.querySelector(".search");
    this.menuBtn = document.querySelector(".mobile-button");
    this.carousel = document.querySelector(".carousel");
    this.statusMsg = document.querySelector(".error");

    this.weatherCode = new Map([
      // Weather code mappings here...
    ]);

    this.locations = [
      "bucuresti",
      "pitesti",
      // Other locations...
    ];

    // Add event listeners
    this.addEventListeners();

    // Initialize the app
    this.init();
  }

  addEventListeners() {
    window.addEventListener("resize", () => this.handleWindowResize());
    this.searchBtn.addEventListener("keypress", (e) =>
      this.handleSearchKeyPress(e)
    );
    this.menuBtn.addEventListener("click", (e) => this.toggleMobileMenu(e));
    if (document.querySelector(".carousel")) {
      window.addEventListener("load", () =>
        this.getWeatherDataForCarousel(this.locations)
      );
      this.carousel.addEventListener("click", (e) =>
        this.handleCarouselItemClick(e)
      );
    }
    if (window.location.pathname.includes("/weather.html")) {
      window.addEventListener("load", () => this.handleWeatherPageLoad());
    }
  }

  init() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
    this.cardsPerSlide = this.getCardsPerSlide();
  }

  getCardsPerSlide() {
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
  }

  // Other methods...

  handleWindowResize() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
    this.cardsPerSlide = this.getCardsPerSlide();
  }

  handleSearchKeyPress(event) {
    if (event.key === "Enter") {
      this.selectedLocation = this.searchBtn.value;
      localStorage.setItem("selectedLocation", `${this.selectedLocation}`);
      window.location.href = "./weather.html";
    }
  }

  toggleMobileMenu(event) {
    const mBtn = event.target.closest(".mobile-button");
    mBtn.nextElementSibling.classList.toggle("hidden");
    mBtn.getElementsByTagName("i")[0].classList.toggle("fa-bars");
    mBtn.getElementsByTagName("i")[0].classList.toggle("fa-xmark");
  }

  handleCarouselItemClick(event) {
    if (event.target.closest(".card")) {
      this.selectedLocation = event.target
        .closest(".card")
        .querySelector(".location").textContent;
      localStorage.setItem("selectedLocation", `${this.selectedLocation}`);
      window.location.href = "weather.html";
    }
  }

  async handleWeatherPageLoad() {
    if (localStorage.getItem("selectedLocation")) {
      this.getWeatherWithChosenLocation(
        localStorage.getItem("selectedLocation")
      );
    } else {
      this.getWeatherUsingGeolocation();
    }
  }

  // Other methods...
  async getWeatherDataForCarousel(locations) {
    const coordsPr = [];
    const carouselDataPr = [];
    this.locations.forEach((location) => {
      coordsPr.push(
        fetch(`https://geocode.maps.co/search?q={${location}}`).then(
          (response) => response.json()
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
    this.renderCarousel(carouselData, coords);
  }

  // Implement other methods...
}

// Instantiate the WeatherApp class when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const weatherApp = new WeatherApp();
});
