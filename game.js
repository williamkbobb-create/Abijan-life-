(function () {
  "use strict";
  const STORAGE_KEY = "abijan-life-demo-v1";
  const STARTING_BALANCE = 5000;
  const STARTING_ENERGY = 80;
  const REST_RECOVERY = 25;
  const COSTS = Object.freeze({ beach: 0, swim: 0, bar: 500, drink: 500, dance: 0, freestyle: 0, food: 750, meet: 0, restaurant: 0, lavage: 0, explore: 0, photo: 0, sit: 0, game: 0, inspect: 0, washcar: 0, chat: 0, greet: 0, friend: 0, invite: 0 });
  const ACTIVITIES = Object.freeze({
    beach: { title: "Explored Grand-Bassam Beach", energy: -5, message: "You took a walk along the coast. Energy -5." },
    bar: { title: "Visited Les Palmiers Beach Bar", energy: -3, message: "A refreshing break by the coast. 500 simulated FCFA spent." },
    restaurant: { title: "Visited Chez Bassam Restaurant", energy: -2, message: "You settled in for a little time out. Energy -2." },
    lavage: { title: "Stopped by Lavage International", energy: -2, message: "You checked out the car wash. No real booking was made. Energy -2." },
    swim: { title: "Went for a swim at Grand-Bassam Beach", energy: -12, message: "You swam in the ocean and cooled off. Energy -12." },
    drink: { title: "Bought a drink", energy: -2, message: "You enjoyed a drink. 500 simulated FCFA spent." },
    dance: { title: "Danced on the floor", energy: -10, message: "You hit the dance floor. Energy -10." },
    freestyle: { title: "Freestyled on the dance floor", energy: -12, message: "You showed off your moves. Energy -12." },
    food: { title: "Tried a local coastal dish", energy: -3, message: "A tasty local meal. 750 simulated FCFA spent." },
    meet: { title: "Met someone new", energy: -3, message: "You introduced yourself to someone new. Your social story begins." },
    explore: { title: "Explored the area", energy: -5, message: "You discovered a little more of Grand-Bassam. Energy -5." },
    photo: { title: "Took a photo", energy: -1, message: "A new memory saved to your demo activity history." },
    sit: { title: "Sat down and took a break", energy: 8, message: "You sat down, caught your breath and recovered 8 energy." },
    game: { title: "Played a social game", energy: -4, message: "A friendly game brought everyone together. Energy -4." },
    inspect: { title: "Looked around Lavage International", energy: -2, message: "You checked the queue and wash bays. No service was booked." },
    washcar: { title: "Helped wash a car at Lavage International", energy: -6, message: "You helped clean a car while the queue moved along. No real service was booked or paid for." },
    chat: { title: "Had a conversation", energy: -2, message: "You shared a conversation and got to know someone better." },
    greet: { title: "Greeted someone", energy: -1, message: "A friendly greeting opened the door to a new connection." },
    friend: { title: "Made a new friend", energy: -2, message: "Your friendship level increased in this local demo." },
    invite: { title: "Invited someone to hang out", energy: -2, message: "You invited them to spend more time together." }
  });
  const PEOPLE = Object.freeze({
    beach: [
      { id: "aya", name: "Aya Kouassi", role: "Beach regular", mood: "Relaxed", section: "By the shoreline", emoji: "👩🏾‍🦱", line: "The breeze is perfect today." },
      { id: "koffi", name: "Koffi Yao", role: "Football fan", mood: "Friendly", section: "Beach games", emoji: "🧑🏾", line: "Want to join a quick game?" },
      { id: "amina", name: "Amina Traoré", role: "Student", mood: "Curious", section: "Palm shade", emoji: "👩🏿", line: "Have you found a favourite spot yet?" },
      { id: "junior", name: "Junior N’Guessan", role: "Music lover", mood: "Energetic", section: "Near the music", emoji: "🧑🏿‍🦱", line: "We should find somewhere to dance later." }
    ],
    bar: [
      { id: "mariam", name: "Mariam Koné", role: "Dance lover", mood: "Energetic", section: "Dance floor", emoji: "👩🏾", line: "Come on, the next song is ours!" },
      { id: "serge", name: "Serge Bamba", role: "DJ’s friend", mood: "Outgoing", section: "DJ corner", emoji: "🧑🏾‍🦱", line: "The music gets better every minute." },
      { id: "nadia", name: "Nadia Aka", role: "Nightlife regular", mood: "Chill", section: "Lounge chairs", emoji: "👩🏿‍🦱", line: "Grab a seat and tell me about yourself." },
      { id: "ismael", name: "Ismaël Diabaté", role: "Football fan", mood: "Playful", section: "Bar counter", emoji: "🧔🏾", line: "Who’s winning the next match?" }
    ],
    restaurant: [
      { id: "fatou", name: "Fatou N’Dri", role: "Food lover", mood: "Warm", section: "Dining tables", emoji: "👩🏾‍🦱", line: "You have to try the local grilled fish." },
      { id: "yann", name: "Yann Kouamé", role: "Young entrepreneur", mood: "Ambitious", section: "Window seats", emoji: "🧑🏾", line: "I’m always looking for new ideas." },
      { id: "esther", name: "Esther Gnahoré", role: "Artist", mood: "Thoughtful", section: "Patio", emoji: "👩🏿", line: "This place gives me so much inspiration." },
      { id: "marco", name: "Marco Assi", role: "Local guide", mood: "Helpful", section: "Dining tables", emoji: "🧑🏿‍🦱", line: "I can point you toward some nice places." }
    ],
    lavage: [
      { id: "ibrahim", name: "Ibrahim Touré", role: "Car enthusiast", mood: "Focused", section: "Wash bay", emoji: "🧑🏾‍🦱", line: "That paintwork deserves a proper shine." },
      { id: "solange", name: "Solange Koffi", role: "Business owner", mood: "Confident", section: "Waiting area", emoji: "👩🏾", line: "A good network is everything." },
      { id: "patrick", name: "Patrick Guei", role: "Mechanic", mood: "Easygoing", section: "Parking area", emoji: "🧔🏿", line: "Cars always have a story to tell." }
    ]
  });
  const $ = (id) => document.getElementById(id);
  let state = null;
  let toastTimer = null;
  let currentLocation = "beach";
  let selectedPerson = null;
  function freshState(name, style) {
    return { version: 1, name: name.trim(), style, balance: STARTING_BALANCE, energy: STARTING_ENERGY, actions: [], relationships: {}, createdAt: new Date().toISOString() };
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
      if (!parsed.relationships || typeof parsed.relationships !== "object") parsed.relationships = {};
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
    const nextEnergy = current.energy + activity.energy;
    return {
      ...current,
      balance: current.balance - COSTS[key],
      energy: Math.max(0, Math.min(100, nextEnergy)),
      actions: [...current.actions, { title: activity.title, at }].slice(-100)
    };
  }
  function doActivity(key, customMessage) {
    const activity = ACTIVITIES[key];
    if (!activity || !state) return;
    if (state.energy <= 0 && activity.energy <= 0) { showToast("You are out of energy. Sit down or rest, then keep exploring."); return; }
    if (state.balance < COSTS[key]) { showToast("Not enough demo FCFA for this activity."); return; }
    const previousEnergy = state.energy;
    state = calculateActivity(state, key);
    if (!state) return;
    if (key === "friend" || key === "chat" || key === "greet" || key === "invite") {
      if (selectedPerson) state.relationships[selectedPerson.id] = Math.min(5, (state.relationships[selectedPerson.id] || 0) + (key === "friend" ? 2 : 1));
    }
    const saved = save();
    renderState();
    if (saved) showToast(customMessage || activity.message + (state.energy > previousEnergy ? " Energy +" + (state.energy - previousEnergy) + "." : ""));
  }
  const LOCATION_DETAILS = {
    beach: { title: "Grand-Bassam Beach", description: "Swim, relax, play games and meet people all around the beach.", cover: "beach-cover", icon: "🏝️", kicker: "GRAND-BASSAM · COAST", actions: ["swim", "explore", "photo", "game", "dance", "meet"] },
    bar: { title: "Les Palmiers Beach Bar", description: "Dance, sit in the lounge, meet the crowd and enjoy the music.", cover: "bar-cover", icon: "🍹", kicker: "GRAND-BASSAM · NIGHTLIFE", actions: ["drink", "dance", "freestyle", "sit", "food", "meet"] },
    restaurant: { title: "Chez Bassam Restaurant", description: "Eat local food, sit at a table, take a photo and meet people.", cover: "restaurant-cover", icon: "🍽️", kicker: "GRAND-BASSAM · DINING", actions: ["food", "drink", "sit", "photo", "chat", "meet"] },
    lavage: { title: "Lavage International", description: "Explore the wash bay, inspect cars and meet people in the waiting area.", cover: "lavage-cover", icon: "🚘", kicker: "GRAND-BASSAM · TOWN", actions: ["inspect", "washcar", "explore", "photo", "sit", "chat", "meet"] }
  };
  const ACTION_LABELS = {
    swim: ["🏊", "Swim", "−12 energy"], explore: ["🚶", "Explore", "−5 energy"], drink: ["🍹", "Buy a drink", "500 FCFA"],
    dance: ["💃", "Dance", "−10 energy"], freestyle: ["🪩", "Freestyle", "−12 energy"], food: ["🍲", "Eat local food", "750 FCFA"],
    meet: ["👋", "Meet people", "Social"], photo: ["📸", "Take photo", "−1 energy"], sit: ["🪑", "Sit & rest", "+8 energy"],
    game: ["⚽", "Play a game", "−4 energy"], inspect: ["🚘", "Inspect car queue", "−2 energy"], washcar: ["🧽", "Help wash a car", "−6 energy"], chat: ["💬", "Chat", "−2 energy"]
  };
  function selectLocation(key) {
    const scene = document.querySelector(".world-scene");
    if (scene) scene.classList.remove("map-focus", "club-mode");
    $("club-screen")?.setAttribute("hidden", "");
    $("meet-screen")?.setAttribute("hidden", "");
    $("person-screen")?.setAttribute("hidden", "");
    const mapButton = $("map-view-button");
    if (mapButton) mapButton.setAttribute("aria-pressed", "false");
    const location = LOCATION_DETAILS[key];
    if (!location) return;
    currentLocation = key;
    if (scene) {
      scene.classList.remove("location-beach", "location-bar", "location-restaurant", "location-lavage");
      scene.classList.add("location-" + key);
    }
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
      button.addEventListener("click", () => {
        if (actionKey === "meet") openMeet();
        else if (actionKey === "dance" || actionKey === "freestyle") openClub(actionKey === "freestyle");
        else doActivity(actionKey);
      });
      actions.append(button);
    });
    renderState();
  }
  function openMeet() {
    $("meet-location-name").textContent = LOCATION_DETAILS[currentLocation].title;
    $("meet-screen").hidden = false;
    $("club-screen").hidden = true;
    $("person-screen").hidden = true;
    renderPeople();
  }
  function renderPeople() {
    const container = $("people-list");
    container.replaceChildren();
    const people = PEOPLE[currentLocation] || [];
    const sections = [...new Set(people.map((person) => person.section))];
    $("people-count").textContent = people.length + " people around this location";
    sections.forEach((section) => {
      const heading = document.createElement("h3");
      heading.className = "people-section-title";
      heading.textContent = section;
      container.append(heading);
      const grid = document.createElement("div");
      grid.className = "people-grid";
      people.filter((person) => person.section === section).forEach((person) => {
        const card = document.createElement("article");
        card.className = "person-card";
        const avatar = document.createElement("div"); avatar.className = "person-avatar"; avatar.textContent = person.emoji;
        const info = document.createElement("div"); info.className = "person-info";
        const name = document.createElement("b"); name.textContent = person.name;
        const role = document.createElement("span"); role.textContent = person.role + " · " + person.mood;
        const score = document.createElement("small"); score.textContent = "Friendship " + (state.relationships[person.id] || 0) + "/5";
        const actions = document.createElement("div"); actions.className = "person-actions";
        const talk = document.createElement("button"); talk.type = "button"; talk.textContent = "Talk"; talk.addEventListener("click", () => openPerson(person.id));
        const wave = document.createElement("button"); wave.type = "button"; wave.textContent = "Say hi"; wave.addEventListener("click", () => { selectedPerson = person; doActivity("greet", "You greeted " + person.name + ". " + person.line); renderPeople(); });
        info.append(name, role, score); actions.append(talk, wave); card.append(avatar, info, actions); grid.append(card);
      });
      container.append(grid);
    });
  }
  function openPerson(id) {
    selectedPerson = (PEOPLE[currentLocation] || []).find((person) => person.id === id);
    if (!selectedPerson) return;
    $("person-avatar").textContent = selectedPerson.emoji;
    $("person-name").textContent = selectedPerson.name;
    $("person-role").textContent = selectedPerson.role + " · " + selectedPerson.mood;
    $("person-line").textContent = "“" + selectedPerson.line + "”";
    $("person-friendship").textContent = "Friendship " + (state.relationships[id] || 0) + "/5";
    $("person-screen").hidden = false;
    $("meet-screen").hidden = true;
    $("club-screen").hidden = true;
  }
  function personAction(key) {
    if (!selectedPerson) return;
    const personName = selectedPerson.name;
    const messages = {
      greet: "You said hello to " + personName + ". " + selectedPerson.line,
      chat: "You and " + personName + " had a good conversation.",
      friend: personName + " is now closer to you. Friendship increased!",
      invite: "You invited " + personName + " to hang out. They said they’ll see you around!"
    };
    doActivity(key, messages[key]);
    $("person-friendship").textContent = "Friendship " + (state.relationships[selectedPerson.id] || 0) + "/5";
  }
  function openClub(freestyle) {
    $("club-screen").hidden = false;
    $("meet-screen").hidden = true;
    $("person-screen").hidden = true;
    $("club-screen").classList.toggle("club-freestyle", Boolean(freestyle));
    $("club-location-name").textContent = currentLocation === "bar" ? "LES PALMIERS · CLUB FLOOR" : "COASTAL DANCE FLOOR";
    $("club-status").textContent = freestyle ? "FREESTYLE SESSION" : "THE MUSIC IS ON";
  }
  function closeOverlays() {
    $("meet-screen").hidden = true;
    $("person-screen").hidden = true;
    $("club-screen").hidden = true;
  }
  function calculateRest(current, at = new Date().toISOString()) {
    if (!current || current.energy >= 100) return null;
    const recovered = Math.min(REST_RECOVERY, 100 - current.energy);
    return {
      state: { ...current, energy: current.energy + recovered, actions: [...current.actions, { title: "Took a quiet break and recovered " + recovered + " energy", at }].slice(-100) },
      recovered
    };
  }
  function rest() {
    if (!state || state.energy >= 100) { showToast("Your energy is already full."); return; }
    const result = calculateRest(state);
    state = result.state;
    const saved = save();
    renderState();
    if (saved) showToast("You took a breather. Energy +" + result.recovered + ".");
  }
  function resetGame() {
    if (!window.confirm("Reset this demo character and local progress?")) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    state = freshState("Grey", "Ambitious newcomer");
    save();
    closeOverlays();
    showGame();
    selectLocation("beach");
  }
  function init() {
    $("character-form").addEventListener("submit", startGame);
    $("character-name").addEventListener("input", () => $("character-name").setCustomValidity(""));
    document.querySelectorAll("[data-location]").forEach((button) => button.addEventListener("click", () => selectLocation(button.dataset.location)));
    $("reset-button").addEventListener("click", resetGame);
    $("rest-button").addEventListener("click", rest);
    $("map-view-button").addEventListener("click", () => {
      const scene = document.querySelector(".world-scene");
      const active = scene.classList.toggle("map-focus");
      $("map-view-button").setAttribute("aria-pressed", String(active));
      showToast(active ? "Choose a destination on the map." : "Destination actions are back.");
    });
    document.querySelectorAll("[data-close-overlay]").forEach((button) => button.addEventListener("click", closeOverlays));
    document.querySelectorAll("[data-person-action]").forEach((button) => button.addEventListener("click", () => personAction(button.dataset.personAction)));
    document.querySelectorAll("[data-club-action]").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.clubAction;
      if (key === "meet") openMeet();
      else if (key === "sit") doActivity("sit", "You found a chair, took a break and watched the dance floor.");
      else doActivity(key, key === "dance" ? "You danced with the crowd. Energy -10." : key === "freestyle" ? "You took the spotlight and freestyled. Energy -12." : key === "drink" ? "You ordered a drink at the club. 500 simulated FCFA spent." : ACTIVITIES[key].message);
    }));
    $("person-back").addEventListener("click", openMeet);
    state = load();
    if (!state) { state = freshState("Grey", "Ambitious newcomer"); save(); }
    showGame();
    selectLocation("beach");
  }
  if (typeof module !== "undefined" && module.exports) module.exports = { freshState, validState, calculateActivity, calculateRest, COSTS, ACTIVITIES, PEOPLE, STARTING_BALANCE, STARTING_ENERGY, REST_RECOVERY };
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})();