(function () {
  "use strict";
  const STORAGE_KEY = "abijan-life-demo-v1";
  const STARTING_BALANCE = 5000;
  const STARTING_ENERGY = 80;
  const REST_RECOVERY = 25;
  const COSTS = Object.freeze({ beach: 0, swim: 0, bar: 500, drink: 500, dance: 0, food: 750, meet: 0, market: 0, lavage: 0 });
  const ACTIVITIES = Object.freeze({
    beach: { title: "Walked along Grand-Bassam Beach", energy: -5, message: "The sea breeze helped you unwind. Energy -5." },
    bar: { title: "Visited Les Palmiers Beach Bar", energy: -3, message: "A refreshing break by the coast. 500 FCFA spent." },
    market: { title: "Browsed Artisan Corner", energy: -4, message: "You discovered local crafts and found inspiration. Energy -4." },
    lavage: { title: "Stopped by Lavage International", energy: -2, message: "You checked out the car wash. No real booking was made. Energy -2." },
    swim: { title: "Went for a swim at Grand-Bassam Beach", energy: -12, message: "You swam in the ocean and cooled off. Energy -12." },
    drink: { title: "Bought someone a drink at the beach", energy: -2, message: "You shared a drink and started a conversation. 500 simulated FCFA spent." },
    dance: { title: "Danced by the coast", energy: -10, message: "The music was irresistible. You danced by the shore. Energy -10." },
    food: { title: "Tried a local coastal dish", energy: -3, message: "A tasty local meal gave you a boost. 750 simulated FCFA spent." },
    meet: { title: "Met someone new at the beach", energy: -3, message: "You introduced yourself to someone new. Your social story begins." }
  });
  const $ = (id) => document.getElementById(id);
  let state = null;
  let toastTimer = null;
  function freshState(name, style) {
    return { version: 1, name: name.trim(), style, balance: STARTING_BALANCE, energy: STARTING_ENERGY, actions: [], createdAt: new Date().toISOString() };
  }
  function validState(value) {
    return Boolean(value && value.version === 1 && typeof value.name === "string" &&
      value.name.trim().length >= 2 && value.name.length <= 24 &&
      ["Coastal creative", "Ambitious newcomer"].includes(value.style) &&
      Number.isInteger(value.balance) && value.balance >= 0 && value.balance <= 1000000 &&
      Number.isInteger(value.energy) && value.energy >= 0 && value.energy <= 100 &&
      Array.isArray(value.actions) && value.actions.length <= 100 &&
      value.actions.every((a) => a && typeof a.title === "string" && a.title.length <= 160 && typeof a.at === "string" && !Number.isNaN(Date.parse(a.at))));
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
    catch (_) { showToast("Progress could not be saved on this device. You can keep playing for now."); return false; }
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!validState(parsed)) { localStorage.removeItem(STORAGE_KEY); return null; }
      return parsed;
    } catch (_) { return null; }
  }
  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3200);
  }
  function showGame() {
    $("welcome-screen").hidden = true;
    $("game-screen").hidden = false;
    $("player-name").textContent = state.name;
    $("profile-name").textContent = state.name;
    $("profile-style").textContent = state.style;
    $("avatar-initial").textContent = state.name.trim().charAt(0).toUpperCase();
    renderState();
  }
  function renderState() {
    $("balance").textContent = state.balance.toLocaleString("en-US");
    $("energy-text").textContent = String(state.energy);
    $("energy-meter").style.width = state.energy + "%";
    document.querySelectorAll("[data-action]").forEach((button) => {
      const key = button.dataset.action;
      button.disabled = state.energy <= 0 || state.balance < (COSTS[key] || 0);
      button.setAttribute("aria-disabled", String(button.disabled));
      button.style.opacity = button.disabled ? ".55" : "1";
    });
    const restButton = $("rest-button");
    restButton.disabled = state.energy >= 100;
    restButton.setAttribute("aria-disabled", String(restButton.disabled));
    restButton.style.opacity = restButton.disabled ? ".55" : "1";
    const list = $("activity-list");
    list.replaceChildren();
    state.actions.slice().reverse().forEach((action) => {
      const item = document.createElement("li");
      const title = document.createElement("span");
      title.textContent = action.title;
      const time = document.createElement("time");
      time.dateTime = action.at;
      time.textContent = new Date(action.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      item.append(title, time);
      list.append(item);
    });
    $("activity-empty").hidden = state.actions.length > 0;
    $("activity-count").textContent = state.actions.length + (state.actions.length === 1 ? " action" : " actions");
  }
  function startGame(event) {
    event.preventDefault();
    const name = $("character-name").value.trim();
    if (name.length < 2 || name.length > 24) {
      $("character-name").setCustomValidity("Use a name between 2 and 24 characters.");
      $("character-name").reportValidity();
      return;
    }
    $("character-name").setCustomValidity("");
    state = freshState(name, document.querySelector('input[name="style"]:checked').value);
    const saved = save();
    showGame();
    if (saved) showToast("Welcome to Grand-Bassam, " + name + "!");
  }
  function calculateActivity(current, key, at = new Date().toISOString()) {
    const activity = ACTIVITIES[key];
    if (!current || !activity || current.energy <= 0 || current.balance < COSTS[key]) return null;
    return {
      ...current,
      balance: current.balance - COSTS[key],
      energy: Math.max(0, Math.min(100, current.energy + activity.energy)),
      actions: [...current.actions, { title: activity.title, at }].slice(-100)
    };
  }
  function doActivity(key) {
    const activity = ACTIVITIES[key];
    if (!activity || !state) return;
    if (state.energy <= 0) { showToast("You are out of energy. Take a break to recover, then keep exploring."); return; }
    if (state.balance < COSTS[key]) { showToast("Not enough demo FCFA for this activity."); return; }
    state = calculateActivity(state, key);
    const saved = save();
    renderState();
    if (saved) showToast(activity.message);
  }
  const LOCATION_DETAILS = {
    beach: { title: "Grand-Bassam Beach", description: "Make a splash. The coast is yours.", cover: "beach-cover", icon: "🏝️", kicker: "GRAND-BASSAM · COAST", actions: ["swim", "beach", "drink", "dance", "food", "meet"] },
    bar: { title: "Les Palmiers Beach Bar", description: "Cold drinks, coastal music, and new faces.", cover: "bar-cover", icon: "🍹", kicker: "GRAND-BASSAM · NIGHTLIFE", actions: ["drink", "dance", "food", "meet"] },
    market: { title: "Artisan Corner", description: "Explore local finds and meet the makers.", cover: "market-cover", icon: "🛍️", kicker: "GRAND-BASSAM · MARKET", actions: ["market", "meet", "food"] },
    lavage: { title: "Lavage International", description: "Pull up and see what's happening around town.", cover: "lavage-cover", icon: "🚘", kicker: "GRAND-BASSAM · TOWN", actions: ["lavage", "meet"] }
  };
  const ACTION_LABELS = {
    swim: ["🏊", "Swim", "−12 energy"], beach: ["🚶", "Explore", "−5 energy"], drink: ["🍹", "Buy a drink", "500 FCFA"],
    dance: ["💃", "Dance", "−10 energy"], food: ["🍲", "Eat", "750 FCFA"], meet: ["👋", "Meet people", "Social"],
    market: ["🛍️", "Browse", "−4 energy"], lavage: ["🚘", "Visit", "−2 energy"]
  };
  function selectLocation(key) {
    const location = LOCATION_DETAILS[key];
    if (!location) return;
    document.querySelectorAll("[data-location]").forEach((pin) => {
      const selected = pin.dataset.location === key;
      pin.classList.toggle("selected", selected);
      pin.setAttribute("aria-pressed", String(selected));
    });
    $("detail-title").textContent = location.title;
    $("detail-description").textContent = location.description;
    $("location-kicker").textContent = location.kicker;
    $("dock-icon").textContent = location.icon;
    const art = document.querySelector(".dock-art");
    art.className = "dock-art " + location.cover;
    const actions = $("location-actions");
    actions.replaceChildren();
    location.actions.forEach((actionKey) => {
      const label = ACTION_LABELS[actionKey];
      const button = document.createElement("button");
      button.type = "button"; button.className = "game-action"; button.dataset.action = actionKey;
      button.setAttribute("aria-label", label[1] + ", " + label[2]);
      const emoji = document.createElement("span"); emoji.textContent = label[0];
      const title = document.createElement("b"); title.textContent = label[1];
      button.append(emoji, title);
      button.addEventListener("click", () => doActivity(actionKey));
      actions.append(button);
    });
    renderState();
  }
  function calculateRest(current, at = new Date().toISOString()) {
    if (!current || current.energy >= 100) return null;
    const recovered = Math.min(REST_RECOVERY, 100 - current.energy);
    return {
      state: {
        ...current,
        energy: current.energy + recovered,
        actions: [...current.actions, { title: "Took a quiet break and recovered " + recovered + " energy", at }].slice(-100)
      },
      recovered
    };
  }
  function rest() {
    if (!state || state.energy >= 100) { showToast("Your energy is already full."); return; }
    const result = calculateRest(state);
    state = result.state;
    const recovered = result.recovered;
    const saved = save();
    renderState();
    if (saved) showToast("You took a breather. Energy +" + recovered + ".");
  }
  function resetGame() {
    if (!window.confirm("Reset this demo character and local progress?")) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    state = null;
    $("game-screen").hidden = true;
    $("welcome-screen").hidden = false;
    $("character-form").reset();
    $("character-name").value = "";
    $("character-name").focus();
  }
  function init() {
    $("character-form").addEventListener("submit", startGame);
    $("character-name").addEventListener("input", () => $("character-name").setCustomValidity(""));
    document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => doActivity(button.dataset.action)));
    document.querySelectorAll("[data-location]").forEach((button) => button.addEventListener("click", () => selectLocation(button.dataset.location)));
    $("reset-button").addEventListener("click", resetGame);
    $("rest-button").addEventListener("click", rest);
    state = load();
    if (state) showGame();
  }
  if (typeof module !== "undefined" && module.exports) module.exports = { freshState, validState, calculateActivity, calculateRest, COSTS, ACTIVITIES, STARTING_BALANCE, STARTING_ENERGY, REST_RECOVERY };
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})();