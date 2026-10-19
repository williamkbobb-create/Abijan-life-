(function () {
  "use strict";

  // The game world starts in Grand-Bassam. These are illustrative gameplay
  // placements around the demo center, not verified real-world business pins.
  const CENTER = [5.2019, -3.7388];
  const DESTINATIONS = [
    { id: "beach", label: "Beach", icon: "🏖️", coords: [5.2072, -3.7385] },
    { id: "bar", label: "Beach Bar", icon: "🍹", coords: [5.2052, -3.7328] },
    { id: "restaurant", label: "Restaurant", icon: "🍽️", coords: [5.2001, -3.7422] },
    { id: "lavage", label: "Lavage", icon: "🚘", coords: [5.2101, -3.7441] },
    { id: "market", label: "Local Market", icon: "🛍️", coords: [5.2040, -3.7480] },
    { id: "cafe", label: "Café", icon: "☕", coords: [5.1988, -3.7335] },
    { id: "town", label: "Old Town", icon: "🏘️", coords: [5.1959, -3.7380] }
  ];

  const container = document.getElementById("city-map");
  const scene = document.querySelector(".world-scene");
  const status = document.getElementById("map-status");
  if (!container || !scene) return;

  let cityMap = null;
  let tileErrorShown = false;

  function showStatus(message) {
    if (!status) return;
    status.textContent = message;
    status.hidden = false;
  }

  function initializeMap() {
    if (cityMap) {
      cityMap.invalidateSize({ pan: false });
      return;
    }
    if (!window.L) {
      showStatus("The interactive map could not load. Check your connection and try again.");
      return;
    }

    try {
      cityMap = window.L.map(container, {
        center: CENTER,
        zoom: 12,
        zoomControl: false,
        scrollWheelZoom: true,
        tap: true
      });

      window.L.control.zoom({ position: "bottomright" }).addTo(cityMap);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        minZoom: 3,
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
      }).on("tileerror", function () {
        if (tileErrorShown) return;
        tileErrorShown = true;
        showStatus("Some map tiles could not load. Check your connection; map tiles may be temporarily unavailable.");
      }).addTo(cityMap);

      window.L.marker(CENTER)
        .addTo(cityMap)
        .bindPopup("<strong>Grand-Bassam</strong><br>Demo starting area · Côte d’Ivoire<br>Destination pins are illustrative game locations, not GPS-verified places.");

      DESTINATIONS.forEach(function (destination) {
        const marker = window.L.marker(destination.coords).addTo(cityMap);
        marker.bindPopup("<strong>" + destination.icon + " " + destination.label + "</strong><br>Illustrative in-game destination · not a verified real-world location.");
        marker.on("click", function () {
          const button = document.querySelector('.world-pin[data-location="' + destination.id + '"]');
          if (button) button.click();
        });
      });

      if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(function () {
          if (cityMap && scene.classList.contains("map-focus")) cityMap.invalidateSize({ pan: false });
        });
        resizeObserver.observe(container);
      }

      window.addEventListener("orientationchange", function () {
        window.setTimeout(function () {
          if (cityMap && scene.classList.contains("map-focus")) cityMap.invalidateSize({ pan: false });
        }, 180);
      }, { passive: true });

      window.setTimeout(function () {
        if (cityMap && scene.classList.contains("map-focus")) cityMap.invalidateSize({ pan: false });
      }, 80);
    } catch (_) {
      // Avoid pretending a partially initialized Leaflet map can safely retry.
      showStatus("The map could not be initialized. Return to the world view and reload the preview.");
    }
  }

  function syncMapView() {
    const active = scene.classList.contains("map-focus");
    container.setAttribute("aria-hidden", String(!active));
    if (active) initializeMap();
    else if (cityMap) cityMap.invalidateSize({ pan: false });
  }

  const observer = new MutationObserver(function (records) {
    if (records.some(function (record) { return record.attributeName === "class"; })) syncMapView();
  });
  observer.observe(scene, { attributes: true, attributeFilter: ["class"] });
  syncMapView();
})();