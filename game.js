(function () {
  "use strict";
  const STORAGE_KEY = "abijan-life-demo-v1";
  const STARTING_BALANCE = 5000;
  const STARTING_ENERGY = 80;
  const REST_RECOVERY = 25;
  const COSTS = Object.freeze({ beach: 0, swim: 0, bar: 500, drink: 500, dance: 0, freestyle: 0, food: 750, meet: 0, restaurant: 0, lavage: 0, explore: 0, photo: 0, sit: 0, game: 0, inspect: 0, washcar: 0, chat: 0, greet: 0, friend: 0, invite: 0 });
  const ACTIVITIES = Object.freeze({
    beach: { title: "Exploration de la plage de Grand-Bassam", energy: -5, message: "Tu as marché le long de la côte. Énergie −5." },
    bar: { title: "Visite du bar de plage Les Palmiers", energy: -3, message: "Une pause rafraîchissante au bord de la mer. 500 FCFA fictifs dépensés." },
    restaurant: { title: "Visite du restaurant Chez Bassam", energy: -2, message: "Tu as pris un petit moment pour toi. Énergie −2." },
    lavage: { title: "Passage chez Lavage International", energy: -2, message: "Tu as découvert le lavage auto. Aucune réservation réelle. Énergie −2." },
    swim: { title: "Baignade à la plage de Grand-Bassam", energy: -12, message: "Tu as nagé dans l’océan pour te rafraîchir. Énergie −12." },
    drink: { title: "Achat d’une boisson", energy: -2, message: "Tu as pris une boisson. 500 FCFA fictifs dépensés." },
    dance: { title: "Danse sur la piste", energy: -10, message: "Tu as rejoint la piste de danse. Énergie −10." },
    freestyle: { title: "Freestyle sur la piste", energy: -12, message: "Tu as montré tes meilleurs pas. Énergie −12." },
    food: { title: "Dégustation d’un plat local", energy: -3, message: "Un délicieux plat local. 750 FCFA fictifs dépensés." },
    meet: { title: "Nouvelle rencontre", energy: -3, message: "Tu as fait connaissance avec quelqu’un. Ton histoire sociale commence." },
    explore: { title: "Exploration des environs", energy: -5, message: "Tu as découvert un peu plus de Grand-Bassam. Énergie −5." },
    photo: { title: "Photo prise", energy: -1, message: "Un nouveau souvenir a été ajouté à ton historique de démo." },
    sit: { title: "Pause et repos", energy: 8, message: "Tu t’es assis pour reprendre ton souffle et récupérer 8 points d’énergie." },
    game: { title: "Partie de jeu entre amis", energy: -4, message: "Un jeu convivial a rapproché tout le monde. Énergie −4." },
    inspect: { title: "Découverte de Lavage International", energy: -2, message: "Tu as regardé la file d’attente et les espaces de lavage. Aucun service réservé." },
    washcar: { title: "Aide au lavage d’une voiture", energy: -6, message: "Tu as aidé à nettoyer une voiture pendant que la file avançait. Aucun service réel réservé ou payé." },
    chat: { title: "Conversation", energy: -2, message: "Vous avez discuté et appris à mieux vous connaître." },
    greet: { title: "Salutation", energy: -1, message: "Un bonjour amical a permis de créer un premier lien." },
    friend: { title: "Nouvelle amitié", energy: -2, message: "Votre niveau d’amitié a augmenté dans cette démo." },
    invite: { title: "Invitation à sortir", energy: -2, message: "Tu lui as proposé de passer plus de temps ensemble." }
  });
  const PEOPLE = Object.freeze({
    beach: [
      { id: "aya", name: "Aya Kouassi", role: "Habituée de la plage", mood: "Détendue", section: "Au bord de l’eau", emoji: "👩🏾‍🦱", line: "La brise est parfaite aujourd’hui." },
      { id: "koffi", name: "Koffi Yao", role: "Fan de football", mood: "Sympa", section: "Jeux de plage", emoji: "🧑🏾", line: "Tu veux faire une petite partie ?" },
      { id: "amina", name: "Amina Traoré", role: "Étudiante", mood: "Curieuse", section: "À l’ombre des palmiers", emoji: "👩🏿", line: "Tu as déjà trouvé ton endroit préféré ?" },
      { id: "junior", name: "Junior N’Guessan", role: "Amateur de musique", mood: "Énergique", section: "Près de la musique", emoji: "🧑🏿‍🦱", line: "On devrait trouver un endroit pour danser tout à l’heure." }
    ],
    bar: [
      { id: "mariam", name: "Mariam Koné", role: "Passionnée de danse", mood: "Énergique", section: "Piste de danse", emoji: "👩🏾", line: "Allez, la prochaine chanson est pour nous !" },
      { id: "serge", name: "Serge Bamba", role: "Ami du DJ", mood: "Sociable", section: "Coin du DJ", emoji: "🧑🏾‍🦱", line: "La musique est de mieux en mieux !" },
      { id: "nadia", name: "Nadia Aka", role: "Habituée des soirées", mood: "Tranquille", section: "Espace détente", emoji: "👩🏿‍🦱", line: "Assieds-toi et parle-moi un peu de toi." },
      { id: "ismael", name: "Ismaël Diabaté", role: "Fan de football", mood: "Joueur", section: "Comptoir du bar", emoji: "🧔🏾", line: "Qui va gagner le prochain match ?" }
    ],
    restaurant: [
      { id: "fatou", name: "Fatou N’Dri", role: "Amatrice de cuisine", mood: "Chaleureuse", section: "Tables du restaurant", emoji: "👩🏾‍🦱", line: "Tu dois goûter le poisson braisé du coin." },
      { id: "yann", name: "Yann Kouamé", role: "Jeune entrepreneur", mood: "Ambitieux", section: "Près des fenêtres", emoji: "🧑🏾", line: "Je suis toujours à la recherche de nouvelles idées." },
      { id: "esther", name: "Esther Gnahoré", role: "Artiste", mood: "Réfléchie", section: "Terrasse", emoji: "👩🏿", line: "Cet endroit m’inspire beaucoup." },
      { id: "marco", name: "Marco Assi", role: "Guide local", mood: "Serviable", section: "Tables du restaurant", emoji: "🧑🏿‍🦱", line: "Je peux te conseiller de bons endroits." }
    ],
    lavage: [
      { id: "ibrahim", name: "Ibrahim Touré", role: "Passionné d’automobile", mood: "Concentré", section: "Zone de lavage", emoji: "🧑🏾‍🦱", line: "Cette carrosserie mérite un bon coup de propre." },
      { id: "solange", name: "Solange Koffi", role: "Entrepreneuse", mood: "Sûre d’elle", section: "Salle d’attente", emoji: "👩🏾", line: "Un bon réseau, c’est essentiel." },
      { id: "patrick", name: "Patrick Guei", role: "Mécanicien", mood: "Décontracté", section: "Parking", emoji: "🧔🏿", line: "Chaque voiture a son histoire." }
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
      ["Coastal creative", "Ambitious newcomer", "Créatif de la côte", "Nouvel arrivant ambitieux", "Nouvel arrivant ambitieux"].includes(value.style) &&
      Number.isInteger(value.balance) && value.balance >= 0 && value.balance <= 1000000 &&
      Number.isInteger(value.energy) && value.energy >= 0 && value.energy <= 100 &&
      Array.isArray(value.actions) && value.actions.length <= 100 &&
      value.actions.every((a) => a && typeof a.title === "string" && a.title.length <= 160 && typeof a.at === "string" && !Number.isNaN(Date.parse(a.at))));
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
    catch (_) { showToast("La progression n’a pas pu être enregistrée sur cet appareil. Tu peux continuer à jouer."); return false; }
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
      $("character-name").setCustomValidity("Choisis un nom de 2 à 24 caractères.");
      $("character-name").reportValidity();
      return;
    }
    $("character-name").setCustomValidity("");
    state = freshState(name, document.querySelector('input[name="style"]:checked').value);
    const saved = save();
    showGame();
    if (saved) showToast("Bienvenue à Grand-Bassam, " + name + "!");
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
    if (state.energy <= 0 && activity.energy <= 0) { showToast("Tu n’as plus d’énergie. Assieds-toi ou repose-toi avant de continuer."); return; }
    if (state.balance < COSTS[key]) { showToast("Tu n’as pas assez de FCFA fictifs pour cette activité."); return; }
    const previousEnergy = state.energy;
    state = calculateActivity(state, key);
    if (!state) return;
    if (key === "friend" || key === "chat" || key === "greet" || key === "invite") {
      if (selectedPerson) state.relationships[selectedPerson.id] = Math.min(5, (state.relationships[selectedPerson.id] || 0) + (key === "friend" ? 2 : 1));
    }
    const saved = save();
    renderState();
    if (saved) showToast(customMessage || activity.message + (state.energy > previousEnergy ? " Énergie +" + (state.energy - previousEnergy) + "." : ""));
  }
  const LOCATION_DETAILS = {
    beach: { title: "Plage de Grand-Bassam", description: "Baignade, détente et loisirs au bord de l’océan.", cover: "beach-cover", icon: "🏝️", kicker: "GRAND-BASSAM · CÔTE", actions: ["swim", "explore", "photo", "game", "dance", "meet"] },
    bar: { title: "Bar de plage Les Palmiers", description: "Profite de la musique, danse ou détends-toi dans l’espace lounge.", cover: "bar-cover", icon: "🍹", kicker: "GRAND-BASSAM · VIE NOCTURNE", actions: ["drink", "dance", "freestyle", "sit", "food", "meet"] },
    restaurant: { title: "Restaurant Chez Bassam", description: "Savoure un plat local, prends une photo et profite d’un moment de détente.", cover: "restaurant-cover", icon: "🍽️", kicker: "GRAND-BASSAM · RESTAURATION", actions: ["food", "drink", "sit", "photo", "chat", "meet"] },
    lavage: { title: "Lavage International", description: "Découvre la zone de lavage et observe les voitures dans la file d’attente.", cover: "lavage-cover", icon: "🚘", kicker: "GRAND-BASSAM · VILLE", actions: ["inspect", "washcar", "explore", "photo", "sit", "chat", "meet"] }
  };
  const ACTION_LABELS = {
    swim: ["🏊", "Se baigner", "−12 points d’énergie"], explore: ["🚶", "Explorer", "−5 points d’énergie"], drink: ["🍹", "Acheter une boisson", "500 FCFA"],
    dance: ["💃", "Danser", "−10 points d’énergie"], freestyle: ["🪩", "Freestyle", "−12 points d’énergie"], food: ["🍲", "Manger un plat local", "750 FCFA"],
    meet: ["👋", "Rencontrer des gens", "Social"], photo: ["📸", "Prendre une photo", "−1 point d’énergie"], sit: ["🪑", "S’asseoir", "+8 points d’énergie"],
    game: ["⚽", "Jouer", "−4 points d’énergie"], inspect: ["🚘", "Observer la file", "−2 points d’énergie"], washcar: ["🧽", "Aider au lavage", "−6 points d’énergie"], chat: ["", "Discuter", "−2 points d’énergie"]
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
    $("people-count").textContent = people.length + " personnes présentes ici";
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
        const score = document.createElement("small"); score.textContent = "Amitié " + (state.relationships[person.id] || 0) + "/5";
        const actions = document.createElement("div"); actions.className = "person-actions";
        const talk = document.createElement("button"); talk.type = "button"; talk.textContent = "Discuter"; talk.addEventListener("click", () => openPerson(person.id));
        const wave = document.createElement("button"); wave.type = "button"; wave.textContent = "Dire bonjour"; wave.addEventListener("click", () => { selectedPerson = person; doActivity("greet", "Tu as salué " + person.name + ". " + person.line); renderPeople(); });
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
    $("person-friendship").textContent = "Amitié " + (state.relationships[id] || 0) + "/5";
    $("person-screen").hidden = false;
    $("meet-screen").hidden = true;
    $("club-screen").hidden = true;
  }
  function personAction(key) {
    if (!selectedPerson) return;
    const personName = selectedPerson.name;
    const messages = {
      greet: "Tu as dit bonjour à " + personName + ". " + selectedPerson.line,
      chat: "Toi et " + personName + " avez eu une bonne conversation.",
      friend: personName + " est devenu(e) plus proche de toi. Votre amitié a progressé !",
      invite: "Tu as invité " + personName + " à sortir. Cette personne a dit qu’elle te reverrait bientôt !"
    };
    doActivity(key, messages[key]);
    $("person-friendship").textContent = "Amitié " + (state.relationships[selectedPerson.id] || 0) + "/5";
  }
  function openClub(freestyle) {
    $("club-screen").hidden = false;
    $("meet-screen").hidden = true;
    $("person-screen").hidden = true;
    $("club-screen").classList.toggle("club-freestyle", Boolean(freestyle));
    $("club-location-name").textContent = currentLocation === "bar" ? "LES PALMIERS · PISTE DE DANSE" : "PISTE DE DANSE DE BASSAM";
    $("club-status").textContent = freestyle ? "SESSION FREESTYLE" : "LA MUSIQUE EST LANCÉE";
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
      state: { ...current, energy: current.energy + recovered, actions: [...current.actions, { title: "Tu as fait une pause et récupéré " + recovered + " points d’énergie", at }].slice(-100) },
      recovered
    };
  }
  function rest() {
    if (!state || state.energy >= 100) { showToast("Ton énergie est déjà au maximum."); return; }
    const result = calculateRest(state);
    state = result.state;
    const saved = save();
    renderState();
    if (saved) showToast("Tu as repris ton souffle. Énergie +" + result.recovered + ".");
  }
  function resetGame() {
    if (!window.confirm("Réinitialiser ce personnage et la progression locale de la démo ?")) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    state = freshState("Grey", "Nouvel arrivant ambitieux");
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
      showToast(active ? "Choisis un lieu sur la carte." : "Les actions du lieu sont de nouveau disponibles.");
    });
    document.querySelectorAll("[data-close-overlay]").forEach((button) => button.addEventListener("click", closeOverlays));
    document.querySelectorAll("[data-person-action]").forEach((button) => button.addEventListener("click", () => personAction(button.dataset.personAction)));
    document.querySelectorAll("[data-club-action]").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.clubAction;
      if (key === "meet") openMeet();
      else if (key === "sit") doActivity("sit", "Tu as trouvé une chaise, fait une pause et regardé la piste de danse.");
      else doActivity(key, key === "dance" ? "Tu as dansé avec le public. Énergie −10." : key === "freestyle" ? "Tu as attiré les regards avec ton freestyle. Énergie −12." : key === "drink" ? "Tu as commandé une boisson au club. 500 FCFA fictifs dépensés." : ACTIVITIES[key].message);
    }));
    $("person-back").addEventListener("click", openMeet);
    state = load();
    if (!state) { state = freshState("Grey", "Nouvel arrivant ambitieux"); save(); }
    showGame();
    selectLocation("beach");
  }
  if (typeof module !== "undefined" && module.exports) module.exports = { freshState, validState, calculateActivity, calculateRest, COSTS, ACTIVITIES, PEOPLE, STARTING_BALANCE, STARTING_ENERGY, REST_RECOVERY };
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})();