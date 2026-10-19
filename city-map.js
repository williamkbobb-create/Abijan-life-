(function () {
  "use strict";

  const CENTER = [5.2019, -3.7388];
  const container = document.getElementById("city-map");
  const scene = document.querySelector(".world-scene");
  const status = document.getElementById("map-status");
  if (!container || !scene) return;

  let cityMap = null;
  let resizeObserver = null;
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
        zoom: 14,
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
        showStatus("Some map tiles could not load. Check your connection; OpenStreetMap tiles may be temporarily unavailable.");
      }).addTo(cityMap);

      window.L.marker(CENTER)
        .addTo(cityMap)
        .bindPopup("<strong>Grand-Bassam</strong><br>Demo starting area · Côte d’Ivoire<br>Game destinations are illustrative, not GPS pins.");

      if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(function () {
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
      cityMap = null;
      showStatus("The map could not be initialized. Return to the world view and try again.");
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
