(function () {
  "use strict";
  const STORAGE_KEY = "abijan-life-demo-v1";
  const STARTING_BALANCE = 100000000;
  const MAX_BALANCE = 1000000000;
  const STARTING_ENERGY = 80;
  const REST_RECOVERY = 25;
  const ENERGY_PACK_COST = 10000;
  const ENERGY_PACK_AMOUNT = 25;
  const DAILY_SHIFT_LIMIT = 2;
  const TRANSPORT = Object.freeze({ walk: { title: "Walk", fare: 0, minutes: 25, energy: 3, description: "Free, but takes longer." }, gbaka: { title: "Shared minibus (gbaka)", fare: 500, minutes: 20, energy: 1, description: "A familiar budget-friendly town ride." }, moto: { title: "Moto-taxi", fare: 1500, minutes: 12, energy: 1, description: "A quicker ride through town." }, car: { title: "Private car taxi", fare: 5000, minutes: 10, energy: 0, description: "A private car ride without owning the vehicle." }, owned_car: { title: "Your own car", fare: 0, minutes: 10, energy: 0, description: "Free travel in Update 1; fuel costs arrive in Update 2." } });
  const HOME_UPGRADES = Object.freeze({ 2: { cost: 250000, title: "Comfortable room" }, 3: { cost: 1000000, title: "Premium coastal home" } });
  const JOBS = Object.freeze({
    beach_cleanup: { title: "Beach clean-up crew", pay: 25000, energy: 18, minutes: 120, description: "Help keep the shoreline welcoming." },
    car_wash: { title: "Lavage assistant", pay: 35000, energy: 25, minutes: 180, description: "Help the team clean cars and organize the wash bay." },
    cafe_shift: { title: "Café assistant", pay: 30000, energy: 20, minutes: 150, description: "Serve customers during a busy coastal shift." }
  });
  const SHOP_ITEMS = Object.freeze({
    bottled_water: { name: "Bottled water", price: 500, description: "A small everyday essential." },
    local_snack: { name: "Local snack", price: 1500, description: "Something tasty for the road." },
    coastal_outfit: { name: "Coastal outfit", price: 25000, description: "A fresh look for your next outing." },
    bassam_souvenir: { name: "Grand-Bassam souvenir", price: 5000, description: "A keepsake from the coast." },
    phone_charger: { name: "Phone charger", price: 3000, description: "Keep your pocket world powered." },
    sofa: { name: "Living-room sofa", price: 150000, description: "A comfortable place to relax at home." },
    bed: { name: "Bedroom bed", price: 200000, description: "A better bed for your home." },
    dining_table: { name: "Dining table", price: 100000, description: "A table for meals and visitors." }
  });
  const ACTIVITY_MINUTES = Object.freeze({ swim: 30, explore: 30, beach: 20, bar: 30, restaurant: 30, lavage: 20, drink: 10, food: 30, dance: 30, freestyle: 30, photo: 5, sit: 15, game: 20, inspect: 15, washcar: 45, chat: 15, greet: 5, friend: 15, invite: 10, meet: 10 });
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
    ],
    market: [
      { id: "adjoua-market", name: "Adjoua N’Dri", role: "Market seller", mood: "Welcoming", section: "Fresh produce", emoji: "👩🏾‍🦱", line: "Come closer, I have something fresh today." },
      { id: "kouame-market", name: "Kouamé Koffi", role: "Craft maker", mood: "Proud", section: "Craft stalls", emoji: "🧑🏾", line: "These pieces are made right here in Bassam." },
      { id: "mariam-market", name: "Mariam Yao", role: "Clothing seller", mood: "Cheerful", section: "Clothing lane", emoji: "👩🏿", line: "Looking for a new look?" }
    ],
    cafe: [
      { id: "awa-cafe", name: "Awa Koné", role: "Café barista", mood: "Friendly", section: "Counter", emoji: "👩🏾", line: "Would you like something cool to drink?" },
      { id: "elie-cafe", name: "Élie Bamba", role: "Student", mood: "Thoughtful", section: "Window seats", emoji: "🧑🏿", line: "This is my favourite place to take a break." },
      { id: "sali-cafe", name: "Sali Gnahoré", role: "Local artist", mood: "Curious", section: "Patio", emoji: "👩🏿‍🦱", line: "The town always gives me a new idea." }
    ],
    town: [
      { id: "nana-town", name: "Nana Kouassi", role: "Local guide", mood: "Helpful", section: "Town square", emoji: "🧑🏾", line: "There is always something happening around here." },
      { id: "yves-town", name: "Yves Assi", role: "Football fan", mood: "Playful", section: "By the benches", emoji: "🧔🏾", line: "Are you joining the game later?" },
      { id: "celine-town", name: "Céline Aka", role: "Photographer", mood: "Curious", section: "Heritage lane", emoji: "👩🏾‍🦱", line: "The old town has beautiful corners to photograph." }
    ]
  });
  const $ = (id) => document.getElementById(id);
  let state = null;
  let toastTimer = null;
  let currentLocation = "beach";
  let selectedPerson = null;
  function freshState(name, style) {
    return { version: 5, name: name.trim(), style, balance: STARTING_BALANCE, energy: STARTING_ENERGY, actions: [], relationships: {}, transactions: [], inventory: [], day: 1, timeMinutes: 480, location: "beach", transportMode: "gbaka", ownsCar: false, home: { level: 1 }, work: { day: 1, shifts: 0 }, createdAt: new Date().toISOString() };
  }
  function validState(value) {
    if (!value || ![1, 2, 3, 4, 5].includes(value.version) || typeof value.name !== "string" ||
      value.name.trim().length < 2 || value.name.length > 24 ||
      !["Coastal creative", "Ambitious newcomer"].includes(value.style) ||
      !Number.isSafeInteger(value.balance) || value.balance < 0 ||
      value.balance > (value.version === 1 ? 1000000 : MAX_BALANCE) ||
      !Number.isInteger(value.energy) || value.energy < 0 || value.energy > 100 ||
      !Array.isArray(value.actions) || value.actions.length > 100 ||
      !value.actions.every((a) => a && typeof a.title === "string" && a.title.length <= 160 && typeof a.at === "string" && !Number.isNaN(Date.parse(a.at)))) return false;
    if (value.version === 1) return true;
    if (!Array.isArray(value.transactions) || value.transactions.length > 200 ||
      !value.transactions.every((t) => t && typeof t.id === "string" && t.id.length <= 120 &&
        typeof t.recipientId === "string" && typeof t.recipientName === "string" &&
        Number.isSafeInteger(t.amount) && t.amount > 0 &&
        typeof t.at === "string" && !Number.isNaN(Date.parse(t.at)) &&
        Number.isSafeInteger(t.balanceAfter) && t.balanceAfter >= 0 && t.balanceAfter <= MAX_BALANCE)) return false;
    if (value.version === 2) return true;
    return Array.isArray(value.inventory) && value.inventory.length <= 100 &&
      value.inventory.every((item) => item && typeof item.id === "string" && Object.prototype.hasOwnProperty.call(SHOP_ITEMS, item.id) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 999) &&
      (value.version < 5 || (typeof value.ownsCar === "boolean" && (value.transportMode !== "owned_car" || value.ownsCar))) &&
      Number.isInteger(value.day) && value.day >= 1 && value.day <= 1000000 &&
      Number.isInteger(value.timeMinutes) && value.timeMinutes >= 0 && value.timeMinutes < 1440 &&
      ["beach", "bar", "restaurant", "lavage", "market", "cafe", "town"].includes(value.location) &&
      (value.version < 4 || (value.version < 5 ? ["walk", "gbaka", "moto", "car"].includes(value.transportMode) : ["walk", "gbaka", "moto", "car", "owned_car"].includes(value.transportMode))) &&
      value.home && Number.isInteger(value.home.level) && value.home.level >= 1 && value.home.level <= 3 &&
      value.work && Number.isInteger(value.work.day) && value.work.day >= 1 && value.work.day <= value.day &&
      Number.isInteger(value.work.shifts) && value.work.shifts >= 0 && value.work.shifts <= DAILY_SHIFT_LIMIT;
  }
  function migrateState(value) {
    if (!validState(value)) return null;
    const base = value.version === 1
      ? { ...value, relationships: value.relationships && typeof value.relationships === "object" ? value.relationships : {}, transactions: [] }
      : { ...value, transactions: value.transactions.slice(-200) };
    if (value.version === 5) return { ...base, inventory: base.inventory.slice(-100), ownsCar: Boolean(base.ownsCar) };
    return {
      ...base, version: 5, inventory: Array.isArray(base.inventory) ? base.inventory.slice(-100) : [],
      transportMode: ["walk", "gbaka", "moto", "car", "owned_car"].includes(base.transportMode) ? base.transportMode : "gbaka",
      ownsCar: typeof base.ownsCar === "boolean" ? base.ownsCar : false,
      day: Number.isInteger(base.day) && base.day > 0 ? base.day : 1,
      timeMinutes: Number.isInteger(base.timeMinutes) && base.timeMinutes >= 0 && base.timeMinutes < 1440 ? base.timeMinutes : 480,
      location: ["beach", "bar", "restaurant", "lavage", "market", "cafe", "town"].includes(base.location) ? base.location : "beach",
      home: base.home && Number.isInteger(base.home.level) && base.home.level >= 1 && base.home.level <= 3 ? base.home : { level: 1 },
      work: base.work && Number.isInteger(base.work.day) && Number.isInteger(base.work.shifts) ? base.work : { day: Number.isInteger(base.day) && base.day > 0 ? base.day : 1, shifts: 0 }
    };
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
      const migrated = migrateState(parsed);
      if (!migrated) {
        try { localStorage.setItem(STORAGE_KEY + "-recovery", raw); } catch (_) {}
        return null;
      }
      if (migrated.version !== parsed.version || !parsed.transactions || !parsed.inventory || !Number.isInteger(parsed.day) || !parsed.transportMode || typeof parsed.ownsCar !== "boolean") {
        state = migrated;
        save();
      }
      return migrated;
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
    const energyShopButton = $("buy-energy-button");
    if (energyShopButton) {
      energyShopButton.disabled = state.energy >= 100 || state.balance < ENERGY_PACK_COST;
      energyShopButton.title = "Buy up to " + ENERGY_PACK_AMOUNT + " energy for " + ENERGY_PACK_COST.toLocaleString("en-US") + " simulated FCFA";
      energyShopButton.setAttribute("aria-disabled", String(energyShopButton.disabled));
      energyShopButton.style.opacity = energyShopButton.disabled ? ".55" : "1";
    }
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
    const clock = $("game-clock");
    if (clock) clock.textContent = "DAY " + state.day + " · " + formatGameTime(state.timeMinutes);
    renderLifePanel();
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
  function formatGameTime(minutes) {
    const hour24 = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const hour = hour24 % 12 || 12;
    return hour + ":" + String(minute).padStart(2, "0") + (hour24 >= 12 ? " PM" : " AM");
  }
  function advanceTime(current, minutes, at = new Date().toISOString()) {
    const total = current.timeMinutes + minutes;
    const daysPassed = Math.floor(total / 1440);
    const day = current.day + daysPassed;
    return {
      ...current, day, timeMinutes: total % 1440,
      work: daysPassed > 0 ? { day, shifts: 0 } : { ...current.work },
      actions: [...current.actions].slice(-100)
    };
  }
  function calculateActivity(current, key, at = new Date().toISOString()) {
    const activity = ACTIVITIES[key];
    if (!current || !activity || current.energy <= 0 || current.balance < COSTS[key]) return null;
    const nextEnergy = current.energy + activity.energy;
    return {
      ...current,
      balance: current.balance - COSTS[key],
      energy: Math.max(0, Math.min(100, nextEnergy)),
      day: advanceTime(current, ACTIVITY_MINUTES[key] || 15, at).day,
      timeMinutes: advanceTime(current, ACTIVITY_MINUTES[key] || 15, at).timeMinutes,
      work: advanceTime(current, ACTIVITY_MINUTES[key] || 15, at).work,
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
    lavage: { title: "Lavage International", description: "Explore the wash bay, inspect cars and meet people in the waiting area.", cover: "lavage-cover", icon: "🚘", kicker: "GRAND-BASSAM · TOWN", actions: ["inspect", "washcar", "explore", "photo", "sit", "chat", "meet"] },
    market: { title: "Marché de Grand-Bassam", description: "Browse colourful stalls, pick up essentials and meet local sellers.", cover: "market-cover", icon: "🛍️", kicker: "GRAND-BASSAM · MARKET", actions: ["food", "drink", "photo", "explore", "meet"] },
    cafe: { title: "Café des Palmiers", description: "Take a café break, enjoy a local bite and chat with people passing through.", cover: "cafe-cover", icon: "☕", kicker: "GRAND-BASSAM · CAFÉ", actions: ["food", "drink", "sit", "chat", "photo", "meet"] },
    town: { title: "Old Town & Town Square", description: "Explore the heritage streets, take photos and meet neighbours around the square.", cover: "town-cover", icon: "🏘️", kicker: "GRAND-BASSAM · OLD TOWN", actions: ["explore", "photo", "game", "chat", "meet"] }
  };
  const ACTION_LABELS = {
    swim: ["🏊", "Swim", "−12 energy"], explore: ["🚶", "Explore", "−5 energy"], drink: ["🍹", "Buy a drink", "500 FCFA"],
    dance: ["💃", "Dance", "−10 energy"], freestyle: ["🪩", "Freestyle", "−12 energy"], food: ["🍲", "Eat local food", "750 FCFA"],
    meet: ["👋", "Meet people", "Social"], photo: ["📸", "Take photo", "−1 energy"], sit: ["🪑", "Sit & rest", "+8 energy"],
    game: ["⚽", "Play a game", "−4 energy"], inspect: ["🚘", "Inspect car queue", "−2 energy"], washcar: ["🧽", "Help wash a car", "−6 energy"], chat: ["💬", "Chat", "−2 energy"]
  };
  function calculateTravel(current, destination, modeKey, at = new Date().toISOString()) {
    const mode = TRANSPORT[modeKey];
    if (!current || !mode || !["beach", "bar", "restaurant", "lavage", "market", "cafe", "town"].includes(destination)) return null;
    if (modeKey === "owned_car" && !current.ownsCar) return null;
    if (destination === current.location) return { ...current, transportMode: modeKey };
    if (current.balance < mode.fare || current.energy < mode.energy) return null;
    const timed = advanceTime(current, mode.minutes, at);
    return {
      ...timed, balance: current.balance - mode.fare, energy: current.energy - mode.energy,
      location: destination, transportMode: modeKey,
      actions: [...current.actions, { title: "Travelled to " + LOCATION_DETAILS[destination].title + " by " + mode.title + (mode.fare ? " for " + mode.fare.toLocaleString("en-US") + " FCFA" : " for free"), at }].slice(-100)
    };
  }
  function chooseTransport(modeKey) {
    if (!TRANSPORT[modeKey] || !state) return;
    if (modeKey === "owned_car" && !state.ownsCar) { showToast("Visit Home & Furniture to buy your own car first."); return; }
    state = { ...state, transportMode: modeKey };
    if (!save()) return;
    renderState();
    showToast(TRANSPORT[modeKey].title + " selected for your next trip.");
  }
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
    const previousLocation = state ? state.location : key;
    if (state && previousLocation !== key) {
      const result = calculateTravel(state, key, state.transportMode || "gbaka");
      if (!result) {
        const mode = TRANSPORT[state.transportMode] || TRANSPORT.gbaka;
        showToast(state.balance < mode.fare ? "Not enough simulated FCFA for this ride. Choose a cheaper transport option." : "You need more energy to make this trip. Rest first.");
        return;
      }
      const previousState = state;
      state = result;
      if (!save()) { state = previousState; return; }
    } else if (state) {
      state = { ...state, location: key };
    }
    currentLocation = key;
    if (scene) {
      scene.classList.remove("location-beach", "location-bar", "location-restaurant", "location-lavage", "location-market", "location-cafe", "location-town");
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
  function calculateWorkShift(current, jobKey, at = new Date().toISOString()) {
    const job = JOBS[jobKey];
    if (!current || !job || current.energy < job.energy || current.work.shifts >= DAILY_SHIFT_LIMIT || current.balance > MAX_BALANCE - job.pay) return null;
    const timed = advanceTime(current, job.minutes, at);
    const nextWork = timed.day !== current.day ? { day: timed.day, shifts: 1 } : { day: timed.day, shifts: current.work.shifts + 1 };
    return {
      ...timed, balance: current.balance + job.pay, energy: Math.max(0, current.energy - job.energy), work: nextWork,
      actions: [...current.actions, { title: "Worked as " + job.title + " and earned " + job.pay.toLocaleString("en-US") + " FCFA", at }].slice(-100)
    };
  }
  const HOME_STORE_ITEMS = Object.freeze(["sofa", "bed", "dining_table"]);
  const CAR_PRICE = 5000000;
  function calculateCarPurchase(current, at = new Date().toISOString()) {
    if (!current || current.ownsCar || current.balance < CAR_PRICE) return null;
    return { ...current, balance: current.balance - CAR_PRICE, ownsCar: true,
      actions: [...current.actions, { title: "Bought a personal car for " + CAR_PRICE.toLocaleString("en-US") + " simulated FCFA", at }].slice(-100) };
  }
  function buyCar() {
    if (!state || state.ownsCar) return;
    if (state.balance < CAR_PRICE) { showToast("Not enough simulated FCFA to buy this car."); return; }
    if (!window.confirm("Buy your own car for " + CAR_PRICE.toLocaleString("en-US") + " simulated FCFA? Fuel will be added in Update 2.")) return;
    const previous = state; state = calculateCarPurchase(state);
    if (!save()) { state = previous; renderState(); return; }
    renderState(); showToast("Car purchased! Choose Your own car in Transport for free trips in Update 1.");
  }
  function calculatePurchase(current, itemKey, at = new Date().toISOString()) {
    const item = SHOP_ITEMS[itemKey];
    if (!current || !item || current.balance < item.price || current.inventory.length >= 100) return null;
    const found = current.inventory.find((owned) => owned.id === itemKey);
    const inventory = found
      ? current.inventory.map((owned) => owned.id === itemKey ? { ...owned, quantity: owned.quantity + 1 } : owned)
      : [...current.inventory, { id: itemKey, quantity: 1 }];
    if (found && found.quantity >= 999) return null;
    return {
      ...current, balance: current.balance - item.price, inventory,
      actions: [...current.actions, { title: "Bought " + item.name + " for " + item.price.toLocaleString("en-US") + " FCFA", at }].slice(-100)
    };
  }
  function calculateHomeUpgrade(current, at = new Date().toISOString()) {
    if (!current || current.home.level >= 3) return null;
    const nextLevel = current.home.level + 1;
    const upgrade = HOME_UPGRADES[nextLevel];
    if (!upgrade || current.balance < upgrade.cost) return null;
    return {
      ...current,
      balance: current.balance - upgrade.cost,
      home: { ...current.home, level: nextLevel },
      actions: [...current.actions, { title: "Upgraded home to " + upgrade.title + " for " + upgrade.cost.toLocaleString("en-US") + " FCFA", at }].slice(-100)
    };
  }
  function upgradeHome() {
    const result = calculateHomeUpgrade(state);
    if (!result) { showToast(state && state.home.level >= 3 ? "Your home is already at the highest level." : "Not enough simulated FCFA for this home upgrade."); return; }
    const upgrade = HOME_UPGRADES[result.home.level];
    if (!window.confirm("Upgrade to " + upgrade.title + " for " + upgrade.cost.toLocaleString("en-US") + " simulated FCFA?")) return;
    const previous = state; state = result;
    if (!save()) { state = previous; renderState(); return; }
    renderState(); showToast("Home upgraded: " + upgrade.title + ".");
  }
  function calculateHomeSleep(current, at = new Date().toISOString()) {
    if (!current || current.energy >= 100) return null;
    const timed = advanceTime(current, 480, at);
    return {
      ...timed, energy: 100, location: "beach",
      actions: [...current.actions, { title: "Went home to sleep and restored energy", at }].slice(-100)
    };
  }
  function workShift(jobKey) {
    const result = calculateWorkShift(state, jobKey);
    if (!result) { showToast("You need more energy, a free shift slot, or enough wallet capacity to take this job."); return; }
    const previous = state; state = result;
    if (!save()) { state = previous; renderState(); return; }
    renderState(); showToast("Shift complete. You earned simulated FCFA.");
  }
  function buyItem(itemKey) {
    const result = calculatePurchase(state, itemKey);
    if (!result) { showToast("You cannot buy this item right now. Check your balance and inventory space."); return; }
    const previous = state; state = result;
    if (!save()) { state = previous; renderState(); return; }
    renderState(); showToast("Item added to your inventory.");
  }
  function sleepAtHome() {
    const result = calculateHomeSleep(state);
    if (!result) { showToast("Your energy is already full."); return; }
    if (!window.confirm("Go home and sleep for 8 in-game hours? Your energy will be restored.")) return;
    const previous = state; state = result;
    if (!save()) { state = previous; renderState(); return; }
    renderState(); showToast("You rested at home. Energy restored to 100.");
  }
  function renderLifePanel() {
    const root = $("life-panel");
    if (!root || !state) return;
    root.replaceChildren();
    const heading = document.createElement("div"); heading.className = "life-panel-heading";
    const title = document.createElement("div");
    const eyebrow = document.createElement("p"); eyebrow.className = "life-eyebrow"; eyebrow.textContent = "YOUR EVERYDAY LIFE";
    const h = document.createElement("h2"); h.textContent = "Make a day of it";
    title.append(eyebrow, h);
    const clock = document.createElement("span"); clock.className = "life-clock"; clock.textContent = "DAY " + state.day + " · " + formatGameTime(state.timeMinutes);
    heading.append(title, clock); root.append(heading);
    const tabs = document.createElement("div"); tabs.className = "life-tabs"; tabs.setAttribute("role", "group"); tabs.setAttribute("aria-label", "Everyday life categories");
    const grid = document.createElement("div"); grid.className = "life-grid";
    const home = document.createElement("article"); home.className = "life-card";
    home.dataset.lifeCategory = "home"; home.innerHTML = '<span class="life-card-icon">🏡</span><p class="life-card-kicker">YOUR HOME</p><h3>Home & rest</h3><p class="life-card-copy">Return to your home base, slow down, and recover your energy.</p>';
    const homeButton = document.createElement("button"); homeButton.type = "button"; homeButton.className = "life-button"; homeButton.textContent = state.energy >= 100 ? "Energy full" : "Go home & sleep · 8 hours"; homeButton.disabled = state.energy >= 100; homeButton.addEventListener("click", sleepAtHome);
    const homeUpgrade = document.createElement("button"); homeUpgrade.type = "button"; homeUpgrade.className = "life-button life-button-secondary";
    if (state.home.level >= 3) { homeUpgrade.textContent = "Home fully upgraded"; homeUpgrade.disabled = true; }
    else {
      const nextUpgrade = HOME_UPGRADES[state.home.level + 1];
      homeUpgrade.textContent = "Upgrade home · " + nextUpgrade.cost.toLocaleString("en-US") + " FCFA";
      homeUpgrade.disabled = state.balance < nextUpgrade.cost;
      homeUpgrade.addEventListener("click", upgradeHome);
    }
    const homeNote = document.createElement("small"); homeNote.className = "life-card-note"; homeNote.textContent = (HOME_UPGRADES[state.home.level]?.title || "Starter home") + " · Home level " + state.home.level + " · Sleep restores energy";
    home.append(homeButton, homeUpgrade, homeNote); grid.append(home);
    const work = document.createElement("article"); work.className = "life-card";
    work.dataset.lifeCategory = "jobs"; work.innerHTML = '<span class="life-card-icon">🧰</span><p class="life-card-kicker">EARN FCFA</p><h3>Local jobs</h3><p class="life-card-copy">Take a shift and earn simulated money. Each shift uses time and energy.</p>';
    Object.entries(JOBS).forEach(([key, job]) => {
      const button = document.createElement("button"); button.type = "button"; button.className = "life-button life-button-secondary";
      button.textContent = job.title + " · +" + job.pay.toLocaleString("en-US") + " FCFA";
      button.disabled = state.work.shifts >= DAILY_SHIFT_LIMIT || state.energy < job.energy || state.balance > MAX_BALANCE - job.pay;
      button.title = job.description + " " + job.minutes + " in-game minutes; energy -" + job.energy + ".";
      button.addEventListener("click", () => workShift(key)); work.append(button);
    });
    const workNote = document.createElement("small"); workNote.className = "life-card-note"; workNote.textContent = "Shifts today: " + state.work.shifts + "/" + DAILY_SHIFT_LIMIT;
    work.append(workNote); grid.append(work);
    const shop = document.createElement("article"); shop.className = "life-card";
    shop.dataset.lifeCategory = "market"; shop.innerHTML = '<span class="life-card-icon">🛍️</span><p class="life-card-kicker">LOCAL MARKET</p><h3>Shops & inventory</h3><p class="life-card-copy">Pick up everyday essentials and keepsakes for your story.</p>';
    Object.entries(SHOP_ITEMS).filter(([key]) => !HOME_STORE_ITEMS.includes(key)).forEach(([key, item]) => {
      const button = document.createElement("button"); button.type = "button"; button.className = "life-button life-button-secondary";
      button.textContent = item.name + " · " + item.price.toLocaleString("en-US") + " FCFA";
      button.disabled = state.balance < item.price || state.inventory.length >= 100 || (state.inventory.find((owned) => owned.id === key)?.quantity || 0) >= 999;
      button.title = item.description;
      button.addEventListener("click", () => buyItem(key)); shop.append(button);
    });
    const inventory = document.createElement("div"); inventory.className = "life-inventory";
    const inventoryTitle = document.createElement("b"); inventoryTitle.textContent = "Your inventory";
    inventory.append(inventoryTitle);
    if (!state.inventory.length) { const empty = document.createElement("small"); empty.textContent = "Nothing collected yet."; inventory.append(empty); }
    else state.inventory.forEach((owned) => { const row = document.createElement("small"); row.textContent = SHOP_ITEMS[owned.id].name + " × " + owned.quantity; inventory.append(row); });
    shop.append(inventory); grid.append(shop);
    const homeStore = document.createElement("article"); homeStore.className = "life-card";
    homeStore.dataset.lifeCategory = "furniture"; homeStore.innerHTML = '<span class="life-card-icon">🛋️</span><p class="life-card-kicker">HOME & FURNITURE</p><h3>Furnish your home</h3><p class="life-card-copy">Buy furniture for your home, or purchase a personal car here. Car travel is free in Update 1; fuel is planned for Update 2.</p>';
    HOME_STORE_ITEMS.forEach((key) => {
      const item = SHOP_ITEMS[key]; const button = document.createElement("button"); button.type = "button"; button.className = "life-button life-button-secondary";
      button.textContent = item.name + " · " + item.price.toLocaleString("en-US") + " FCFA";
      button.disabled = state.balance < item.price || state.inventory.length >= 100 || (state.inventory.find((owned) => owned.id === key)?.quantity || 0) >= 999;
      button.addEventListener("click", () => buyItem(key)); homeStore.append(button);
    });
    const carButton = document.createElement("button"); carButton.type = "button"; carButton.className = "life-button";
    carButton.textContent = state.ownsCar ? "✓ Personal car owned" : "🚗 Buy a personal car · " + CAR_PRICE.toLocaleString("en-US") + " FCFA";
    carButton.disabled = state.ownsCar || state.balance < CAR_PRICE;
    carButton.addEventListener("click", buyCar); homeStore.append(carButton);
    const homeStoreNote = document.createElement("small"); homeStoreNote.className = "life-card-note";
    homeStoreNote.textContent = state.ownsCar ? "You own a car. Select it in Transport for free travel; fuel is not charged yet." : "Your car will be saved with your character. Fuel is planned for Update 2.";
    homeStore.append(homeStoreNote); grid.append(homeStore);
    const travel = document.createElement("article"); travel.className = "life-card";
    travel.dataset.lifeCategory = "travel"; travel.innerHTML = '<span class="life-card-icon">🛺</span><p class="life-card-kicker">GET AROUND BASSAM</p><h3>Transport</h3><p class="life-card-copy">Choose how you want to reach your next destination. Fares are simulated.</p>';
    Object.entries(TRANSPORT).forEach(([key, mode]) => {
      if (key === "owned_car" && !state.ownsCar) { /* shown as locked below */ }
      const button = document.createElement("button"); button.type = "button";
      button.className = "life-button " + (state.transportMode === key ? "" : "life-button-secondary");
      button.textContent = (state.transportMode === key ? "✓ " : "") + mode.title + " · " + (mode.fare ? mode.fare.toLocaleString("en-US") + " FCFA" : "Free") + " · " + mode.minutes + " min";
      button.disabled = state.transportMode === key || (key === "owned_car" && !state.ownsCar);
      button.title = (key === "owned_car" && !state.ownsCar ? "Buy a car in Home & Furniture to unlock this option. " : mode.description + " ") + "Energy cost: " + mode.energy + ".";
      button.addEventListener("click", () => chooseTransport(key)); travel.append(button);
    });
    const travelNote = document.createElement("small"); travelNote.className = "life-card-note";
    travelNote.textContent = "Selected: " + TRANSPORT[state.transportMode || "gbaka"].title + ". Tap a map destination to travel; the fare, time and energy cost are applied.";
    travel.append(travelNote); grid.append(travel);
    const lifeCategories = [["home", "🏡 Home"], ["jobs", "🧰 Jobs"], ["market", "🛍️ Market"], ["furniture", "🛋️ Furniture"], ["travel", "🛺 Travel"]];
    lifeCategories.forEach(([key, label], index) => {
      const tab = document.createElement("button"); tab.type = "button"; tab.className = "life-tab"; tab.textContent = label;
      tab.setAttribute("aria-pressed", String(index === 0)); tab.addEventListener("click", () => {
        tabs.querySelectorAll(".life-tab").forEach((item) => item.setAttribute("aria-pressed", String(item === tab)));
        grid.querySelectorAll(".life-card").forEach((card) => { card.hidden = card.dataset.lifeCategory !== key; });
      }); tabs.append(tab);
    });
    grid.querySelectorAll(".life-card").forEach((card) => { card.hidden = card.dataset.lifeCategory !== "home"; });
    root.append(tabs, grid);
  }
  function calculateTransfer(current, recipient, amount, at = new Date().toISOString(), id) {
    if (!current || !recipient || typeof recipient.id !== "string" || !recipient.id ||
      typeof recipient.name !== "string" || !recipient.name.trim() ||
      !Number.isSafeInteger(amount) || amount <= 0 || amount > current.balance ||
      !Array.isArray(current.transactions)) return null;
    const transferId = id || ("transfer-" + at + "-" + recipient.id + "-" + amount);
    if (current.transactions.some((item) => item.id === transferId)) return null;
    const balanceAfter = current.balance - amount;
    const transaction = { id: transferId, recipientId: recipient.id, recipientName: recipient.name.trim(), amount, at, balanceAfter };
    return {
      state: {
        ...current,
        balance: balanceAfter,
        transactions: [...current.transactions, transaction].slice(-200),
        actions: [...current.actions, { title: "Sent " + amount.toLocaleString("en-US") + " FCFA to " + recipient.name.trim(), at }].slice(-100)
      },
      transaction
    };
  }
  function transferMoney(recipient, amount) {
    if (!state) return { ok: false, error: "Game state is not ready." };
    const id = "transfer-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
    const result = calculateTransfer(state, recipient, amount, new Date().toISOString(), id);
    if (!result) return { ok: false, error: "Check the recipient, amount, and available balance. This transfer may already have been processed." };
    const previous = state;
    state = result.state;
    if (!save()) {
      state = previous;
      renderState();
      return { ok: false, error: "Transfer cancelled because your game could not save the transaction." };
    }
    renderState();
    showToast("Sent " + amount.toLocaleString("en-US") + " simulated FCFA to " + recipient.name + ".");
    return { ok: true, transaction: result.transaction, balance: state.balance };
  }
  function calculateEnergyPurchase(current, at = new Date().toISOString()) {
    if (!current || current.energy >= 100 || current.balance < ENERGY_PACK_COST) return null;
    const recovered = Math.min(ENERGY_PACK_AMOUNT, 100 - current.energy);
    return {
      state: {
        ...current,
        balance: current.balance - ENERGY_PACK_COST,
        energy: current.energy + recovered,
        actions: [...current.actions, { title: "Bought " + recovered + " energy for " + ENERGY_PACK_COST.toLocaleString("en-US") + " FCFA", at }].slice(-100)
      },
      cost: ENERGY_PACK_COST,
      recovered
    };
  }
  function buyEnergy() {
    if (!state) return;
    const result = calculateEnergyPurchase(state);
    if (!result) {
      showToast(state.energy >= 100 ? "Your energy is already full." : "Not enough simulated FCFA to buy an energy pack.");
      return;
    }
    if (!window.confirm("Buy up to " + ENERGY_PACK_AMOUNT + " energy for " + ENERGY_PACK_COST.toLocaleString("en-US") + " simulated FCFA?")) return;
    const previous = state;
    state = result.state;
    if (!save()) {
      state = previous;
      renderState();
      return;
    }
    renderState();
    showToast("Energy +" + result.recovered + ". " + result.cost.toLocaleString("en-US") + " simulated FCFA spent.");
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
    selectLocation(state.location || "beach");
  }
  function init() {
    $("character-form").addEventListener("submit", startGame);
    $("character-name").addEventListener("input", () => $("character-name").setCustomValidity(""));
    document.querySelectorAll("[data-location]").forEach((button) => button.addEventListener("click", () => selectLocation(button.dataset.location)));
    $("reset-button").addEventListener("click", resetGame);
    $("rest-button").addEventListener("click", rest);
    if ($("buy-energy-button")) $("buy-energy-button").addEventListener("click", buyEnergy);
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
  if (typeof module !== "undefined" && module.exports) module.exports = { freshState, validState, migrateState, calculateActivity, calculateRest, calculateEnergyPurchase, calculateTransfer, calculateWorkShift, calculatePurchase, calculateHomeSleep, calculateHomeUpgrade, calculateTravel, calculateCarPurchase, advanceTime, JOBS, SHOP_ITEMS, HOME_UPGRADES, TRANSPORT, HOME_STORE_ITEMS, CAR_PRICE, DAILY_SHIFT_LIMIT, COSTS, ACTIVITIES, PEOPLE, STARTING_BALANCE, MAX_BALANCE, STARTING_ENERGY, REST_RECOVERY, ENERGY_PACK_COST, ENERGY_PACK_AMOUNT };
  if (typeof window !== "undefined") {
    window.AbijanLifeGame = {
      getState: () => state ? { balance: state.balance, transactions: state.transactions.slice() } : null,
      transferMoney,
      getPlayerState: () => state ? JSON.parse(JSON.stringify(state)) : null
    };
  }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})();