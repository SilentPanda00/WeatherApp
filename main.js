"use strict";

import WeatherCarousel from "./weatherCarousel.js";
import Forecast from "./forecast.js";

class WeatherApp {
  constructor() {
    this.searchBtn = document.querySelector(".search");
    this.menuBtn = document.querySelector(".mobile-button");
    this.closeMenuBtn = document.querySelector(".close-menu-button");
    this.carousel = document.querySelector(".carousel");

    this.selectedLocation = null;

    // Add event listeners
    this.addEventListeners();

    // Check if the current page is "weather.html" and initialize Forecast
    if (window.location.pathname.includes("/weather.html")) {
      window.addEventListener("load", () => {
        this.initForecast();
      });
    }

    // Set CSS variable for viewport height
    // this.setVHVariable();
  }

  addEventListeners() {
    // Event listener for window resize
    window.addEventListener("resize", () => {
      this.setVHVariable();
    });

    // Event listener for search button
    this.searchBtn.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.selectedLocation = this.searchBtn.value;
        localStorage.setItem("selectedLocation", this.selectedLocation);
        window.location.href = "./weather.html";
      }
    });

    // Event listener for mobile menu button
    this.menuBtn.addEventListener("click", () => {
      document.querySelector(".mobile").classList.toggle("side");
    });

    // Event listener for closing mobile menu
    this.closeMenuBtn.addEventListener("click", () => {
      document.querySelector(".mobile").classList.toggle("side");
    });

    // Initialize the WeatherCarousel if the carousel exists on the page
    if (this.carousel) {
      window.addEventListener("load", () => {
        this.initWeatherCarousel();
      });
      // Event listener for card click (inside the carousel)
      this.carousel.addEventListener("click", (e) => {
        if (e.target.closest(".card")) {
          this.selectedLocation = e.target
            .closest(".card")
            .querySelector(".location").textContent;
          localStorage.setItem("selectedLocation", this.selectedLocation);
          window.location.href = "weather.html";
        }
      });
    }
  }

  initWeatherCarousel() {
    new WeatherCarousel();
  }

  initForecast() {
    // Initialize Forecast here
    const forecast = new Forecast();
  }

  setVHVariable() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
    if (window.location.pathname.includes("index")) window.location.reload();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new WeatherApp();
});
