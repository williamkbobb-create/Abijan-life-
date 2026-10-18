"use strict";
(() => {
  const PHONE_KEY = "abijan-life-phone-v1";
  const $ = (id) => document.getElementById(id);
  const demoMessages = [
    { id: "aya-1", name: "Aya Kouassi", avatar: "👩🏾", text: "Salut ! Tu es à la plage aujourd’hui ?", time: "À l’instant", unread: true },
    { id: "koffi-1", name: "Koffi Yao", avatar: "🧑🏿", text: "La musique devient géniale aux Palmiers 🎶", time: "Il y a 2 min", unread: true },
    { id: "amina-1", name: "Amina Traoré", avatar: "👩🏿", text: "On devrait aller manger quelque chose tout à l’heure.", time: "Il y a 12 min", unread: false }
  ];
  const contacts = [
    { id: "aya", name: "Aya Kouassi", avatar: "👩🏾", status: "À la plage de Grand-Bassam" },
    { id: "koffi", name: "Koffi Yao", avatar: "🧑🏿", status: "Au bar de plage Les Palmiers" },
    { id: "amina", name: "Amina Traoré", avatar: "👩🏿", status: "En ville" },
    { id: "issa", name: "Issa Koné", avatar: "🧔🏿", status: "Chez Lavage International" }
  ];
  const defaults = () => ({ messages: demoMessages.map((m) => ({ ...m })), callLog: [], sent: [], settings: { notifications: true, sound: false } });
  function loadPhone() {
    try {
      const saved = JSON.parse(localStorage.getItem(PHONE_KEY));
      if (saved && Array.isArray(saved.messages) && Array.isArray(saved.callLog) && Array.isArray(saved.sent)) return { ...defaults(), ...saved };
    } catch (_) {}
    return defaults();
  }
  let phoneState = null;
  let activeTab = "messages";
  let activeConversation = null;
  let callTimer = null;
  function persist() {
    try { localStorage.setItem(PHONE_KEY, JSON.stringify(phoneState)); } catch (_) {}
  }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function button(label, className, action, aria) {
    const node = el("button", className, label);
    node.type = "button";
    if (aria) node.setAttribute("aria-label", aria);
    node.addEventListener("click", action);
    return node;
  }
  function unreadCount() { return phoneState.messages.filter((m) => m.unread).length; }
  function makePhone() {
    const game = $("game-screen");
    if (!game || $("phone-launcher")) return;
    const launcher = button("▣", "phone-launcher", togglePhone, "Ouvrir le téléphone du jeu");
    launcher.id = "phone-launcher";
    launcher.innerHTML = '<span class="phone-glyph" aria-hidden="true">▰</span><i class="phone-notification-dot" aria-hidden="true"></i>';
    const panel = el("aside", "phone-panel");
    panel.id = "phone-panel";
    panel.hidden = true;
    panel.setAttribute("aria-label", "Téléphone du jeu");
    panel.innerHTML = '<div class="phone-top"><div class="phone-camera"></div><div class="phone-status"><span>● BASSAM MOBILE</span><span id="phone-clock">21:39</span></div></div><header class="phone-header"><div><small>TON MONDE DE POCHE</small><h2 id="phone-title">Messages</h2></div><button id="phone-close" type="button" aria-label="Ranger le téléphone">−</button></header><nav class="phone-tabs" aria-label="Applications du téléphone"><button type="button" data-phone-tab="messages"><span aria-hidden="true">💬</span><small>Messages</small><i id="phone-unread">2</i></button><button type="button" data-phone-tab="calls"><span aria-hidden="true">☎️</span><small>Appels</small></button><button type="button" data-phone-tab="contacts"><span aria-hidden="true">👥</span><small>Contacts</small></button><button type="button" data-phone-tab="activities"><span aria-hidden="true">🗓️</span><small>Activités</small></button><button type="button" data-phone-tab="settings"><span aria-hidden="true">⚙️</span><small>Réglages</small></button></nav><div id="phone-content" class="phone-content"></div><footer class="phone-footer"><span>●</span> ABJ MOBILE <span>·</span> MONDE SIMULÉ</footer>';
    const hud = game.querySelector(".game-hud");
    if (hud) hud.append(launcher); else game.append(launcher);
    game.append(panel);
    $("phone-close").addEventListener("click", togglePhone);
    panel.querySelectorAll("[data-phone-tab]").forEach((tab) => tab.addEventListener("click", () => openTab(tab.dataset.phoneTab)));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !panel.hidden) togglePhone(); });
    updateLauncher();
  }
  function togglePhone() {
    const panel = $("phone-panel");
    if (!panel) return;
    panel.hidden = !panel.hidden;
    $("phone-launcher").classList.toggle("is-open", !panel.hidden);
    if (!panel.hidden) { openTab(activeTab); panel.setAttribute("aria-hidden", "false"); }
    else panel.setAttribute("aria-hidden", "true");
  }
  function updateLauncher() {
    const dot = document.querySelector(".phone-notification-dot");
    const count = $("phone-unread");
    if (dot) dot.hidden = unreadCount() === 0;
    if (count) { count.textContent = String(unreadCount()); count.hidden = unreadCount() === 0; }
  }
  function openTab(tab) {
    activeTab = tab;
    activeConversation = null;
    const title = { messages: "Messages", calls: "Appels", contacts: "Contacts", activities: "Activités", settings: "Réglages" }[tab] || "Messages";
    $("phone-title").textContent = title;
    $("phone-panel").querySelectorAll("[data-phone-tab]").forEach((node) => node.classList.toggle("active", node.dataset.phoneTab === tab));
    renderTab();
  }
  function renderTab() {
    const content = $("phone-content");
    content.replaceChildren();
    if (activeConversation) { renderConversation(content, activeConversation); return; }
    if (activeTab === "messages") renderMessages(content);
    else if (activeTab === "calls") renderAppels(content);
    else if (activeTab === "contacts") renderContacts(content);
    else if (activeTab === "activities") renderActivities(content);
    else renderRéglages(content);
    updateLauncher();
  }
  function personRow(person, subtitle, action, extra) {
    const row = el("article", "phone-person-row");
    row.append(el("span", "phone-person-avatar", person.avatar), el("span", "phone-person-info"));
    const info = row.querySelector(".phone-person-info");
    info.append(el("b", "", person.name), el("small", "", subtitle));
    if (extra) row.append(extra);
    if (action) row.addEventListener("click", action);
    return row;
  }
  function renderMessages(content) {
    content.append(el("p", "phone-intro", "Prends des nouvelles des gens de Grand-Bassam."));
    const list = el("div", "phone-list");
    phoneState.messages.forEach((message) => {
      const row = personRow(message, message.text, () => {
        message.unread = false;
        activeConversation = message.id;
        persist();
        renderTab();
      }, el("span", "phone-message-time", message.time));
      if (message.unread) row.classList.add("unread");
      list.append(row);
    });
    content.append(list);
    content.append(el("p", "phone-demo-note", "Conversations de démo · les messages restent sur cet appareil"));
  }
  function renderConversation(content, id) {
    const message = phoneState.messages.find((item) => item.id === id);
    if (!message) { activeConversation = null; renderMessages(content); return; }
    content.append(button("← Tous les messages", "phone-back", () => { activeConversation = null; renderTab(); }));
    const thread = el("div", "phone-thread");
    thread.append(el("div", "phone-chat-avatar", message.avatar), el("h3", "", message.name), el("p", "phone-demo-note", "Conversation locale de démo"));
    thread.append(el("div", "phone-bubble incoming", message.text));
    phoneState.sent.filter((item) => item.to === id).forEach((item) => thread.append(el("div", "phone-bubble outgoing", item.text)));
    const reply = el("form", "phone-reply");
    const input = el("input");
    input.placeholder = "Écris un message…";
    input.maxLength = 180;
    input.setAttribute("aria-label", "Écrire un message de démo");
    const send = button("➤", "phone-send", () => {});
    send.type = "submit";
    reply.append(input, send);
    reply.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      phoneState.sent.push({ to: id, text, at: new Date().toISOString() });
      phoneState.sent = phoneState.sent.slice(-100);
      persist();
      renderTab();
    });
    content.append(thread, reply);
  }
  function renderAppels(content) {
    content.append(el("p", "phone-intro", "Appelle tes contacts dans ce monde de démo."));
    const callButton = button("＋ Nouvel appel de démo", "phone-primary", () => openTab("contacts"));
    content.append(callButton);
    if (!phoneState.callLog.length) content.append(el("div", "phone-empty", "☎\nAucun appel récent"));
    phoneState.callLog.slice().reverse().forEach((call) => {
      const contact = contacts.find((item) => item.id === call.contact) || contacts[0];
      const row = personRow(contact, "↗ Appel sortant · " + call.time, () => startCall(contact));
      row.append(el("span", "phone-call-icon", "☎"));
      content.append(row);
    });
  }
  function startCall(contact) {
    const existing = $("phone-call-screen");
    if (existing) existing.remove();
    const overlay = el("div", "phone-call-screen");
    overlay.id = "phone-call-screen";
    overlay.append(el("div", "phone-call-avatar", contact.avatar), el("p", "phone-call-kicker", "APPEL SORTANT DE DÉMO"), el("h3", "", contact.name), el("p", "phone-call-status", "Appel en cours…"));
    const end = button("●", "phone-end-call", () => {
      if (callTimer) { clearTimeout(callTimer); callTimer = null; }
      phoneState.callLog.push({ contact: contact.id, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
      phoneState.callLog = phoneState.callLog.slice(-30);
      persist();
      overlay.remove();
      openTab("calls");
    }, "Terminer l’appel de démo");
    overlay.append(end, el("p", "phone-demo-note", "Les appels sont simulés : aucun numéro réel n’est composé."));
    $("phone-content").append(overlay);
    callTimer = setTimeout(() => {
      const status = overlay.querySelector(".phone-call-status");
      if (status) status.textContent = "Pas de réponse · Appel de démo";
    }, 1800);
  }
  function renderContacts(content) {
    content.append(el("p", "phone-intro", "Les personnes que tu as rencontrées en ville."));
    contacts.forEach((contact) => {
      const row = personRow(contact, contact.status, () => {
        const found = phoneState.messages.find((m) => m.id === contact.id || m.name === contact.name);
        if (found) { found.unread = false; activeConversation = found.id; persist(); openTab("messages"); activeConversation = found.id; renderTab(); }
        else {
          const newMessage = { id: contact.id, name: contact.name, avatar: contact.avatar, text: "Vous êtes en contact dans cette démo locale. Dis bonjour !", time: "À l’instant", unread: false };
          phoneState.messages.push(newMessage); persist(); activeConversation = newMessage.id; openTab("messages"); activeConversation = newMessage.id; renderTab();
        }
      }, button("☎", "phone-mini-action", (event) => {}, "Lancer un appel de démo"));
      const action = row.querySelector(".phone-mini-action");
      action.addEventListener("click", (event) => { event.stopPropagation(); startCall(contact); });
      content.append(row);
    });
  }
  function renderActivities(content) {
    content.append(el("p", "phone-intro", "Tes dernières activités à Grand-Bassam."));
    const source = $("activity-list");
    const entries = source ? Array.from(source.querySelectorAll("li")).map((li) => li.textContent.trim()).filter(Boolean).reverse() : [];
    if (!entries.length) content.append(el("div", "phone-empty", "☀\nTon histoire commence ici. Explore un lieu pour enregistrer ta première activité."));
    entries.slice(0, 30).forEach((entry) => content.append(el("article", "phone-activity-row", "◷  " + entry)));
  }
  function renderRéglages(content) {
    content.append(el("p", "phone-intro", "Personnalise ton téléphone dans le jeu."));
    [["notifications", "Notifications de messages", "Afficher un point pour les messages de démo non lus"], ["sound", "Effets sonores", "Prévu pour une prochaine mise à jour audio"]].forEach(([key, title, note]) => {
      const row = el("label", "phone-setting");
      const copy = el("span", "phone-setting-copy");
      copy.append(el("b", "", title), el("small", "", note));
      const input = el("input");
      input.type = "checkbox";
      input.checked = Boolean(phoneState.settings[key]);
      input.addEventListener("change", () => { phoneState.settings[key] = input.checked; persist(); updateLauncher(); });
      row.append(copy, input);
      content.append(row);
    });
    content.append(button("Réinitialiser les données du téléphone", "phone-reset", () => {
      if (!window.confirm("Réinitialiser les messages et l’historique des appels de démo ?")) return;
      phoneState = defaults(); persist(); openTab("settings");
    }));
    content.append(el("p", "phone-demo-note", "Ceci est un téléphone intégré au jeu, pas un vrai service mobile. Aucun appel réel ni message en ligne n’est envoyé."));
  }
  function makeStreetLife() {
    const canvas = $("map-canvas");
    if (!canvas || canvas.querySelector(".street-life-layer")) return;
    const style = document.createElement("style");
    style.id = "street-life-styles";
    style.textContent = `
      .street-life-layer{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}
      .street-actor{position:absolute;display:grid;place-items:center;border:0;padding:0;background:transparent;pointer-events:auto;cursor:pointer;line-height:1;filter:drop-shadow(0 2px 2px #173d3650);will-change:left,top;user-select:none;-webkit-tap-highlight-color:transparent}
      .street-walker{width:clamp(25px,4vw,39px);height:clamp(25px,4vw,39px);font-size:clamp(20px,3.2vw,30px);border-radius:50%;background:#fff9e8d9;box-shadow:0 2px 8px #123b3228;animation-duration:18s;animation-timing-function:linear;animation-iteration-count:infinite}
      .street-car{width:clamp(28px,4.6vw,44px);height:clamp(23px,3.8vw,35px);font-size:clamp(21px,3.5vw,32px);animation-duration:21s;animation-timing-function:linear;animation-iteration-count:infinite}
      .walker-a{animation-name:street-walk-a}.walker-b{animation-name:street-walk-b;animation-duration:23s;animation-delay:-8s}.walker-c{animation-name:street-walk-c;animation-duration:27s;animation-delay:-14s}
      .car-a{animation-name:street-car-a}.car-b{animation-name:street-car-b;animation-duration:25s;animation-delay:-12s}
      .street-actor:focus-visible{outline:3px solid #f4d79c;outline-offset:3px;border-radius:50%}
      .street-actor.is-greeting{z-index:8;animation-play-state:paused;transform:scale(1.12)}
      .street-actor.is-greeting::after{content:attr(data-bubble);position:absolute;left:50%;bottom:calc(100% + 5px);transform:translateX(-50%);padding:6px 8px;border-radius:12px;background:#fffdf4;color:#173d36;font:700 10px/1.2 system-ui,sans-serif;white-space:nowrap;box-shadow:0 3px 12px #173d3633}
      @keyframes street-walk-a{0%{left:13%;top:52%}25%{left:27%;top:48%}50%{left:43%;top:55%}75%{left:29%;top:61%}100%{left:13%;top:52%}}
      @keyframes street-walk-b{0%{left:73%;top:47%}25%{left:60%;top:53%}50%{left:47%;top:49%}75%{left:61%;top:43%}100%{left:73%;top:47%}}
      @keyframes street-walk-c{0%{left:38%;top:76%}25%{left:48%;top:69%}50%{left:62%;top:74%}75%{left:50%;top:81%}100%{left:38%;top:76%}}
      @keyframes street-car-a{0%{left:-7%;top:39%}48%{left:53%;top:42%}50%{left:57%;top:42%}100%{left:108%;top:45%}}
      @keyframes street-car-b{0%{left:107%;top:65%}48%{left:49%;top:62%}50%{left:45%;top:62%}100%{left:-8%;top:59%}}
      @media(prefers-reduced-motion:reduce){.street-walker,.street-car{animation:none!important}.street-actor.is-greeting{transform:none}}
      @media(max-width:760px){.street-life-layer{z-index:4}.street-walker{width:29px;height:29px;font-size:22px}.street-car{font-size:23px}}
    `;
    document.head.append(style);
    const layer = document.createElement("div");
    layer.className = "street-life-layer";
    layer.setAttribute("aria-label", "Personnages et véhicules animés dans les rues");
    const actors = [
      { className: "street-actor street-walker walker-a", emoji: "🚶🏾", label: "Passant dans la rue", bubble: "👋 Salut !" },
      { className: "street-actor street-walker walker-b", emoji: "🚶🏿‍♀️", label: "Passante dans la rue", bubble: "😊 Bonjour !" },
      { className: "street-actor street-walker walker-c", emoji: "🧍🏾", label: "Habitant de Grand-Bassam", bubble: "Ça va ?" },
      { className: "street-actor street-car car-a", emoji: "🚕", label: "Taxi de démonstration", bubble: "🚕 Taxi !" },
      { className: "street-actor street-car car-b", emoji: "🚗", label: "Voiture de démonstration", bubble: "🚗 Vroum !" }
    ];
    actors.forEach((actor) => {
      const node = document.createElement("button");
      node.type = "button";
      node.className = actor.className;
      node.textContent = actor.emoji;
      node.setAttribute("aria-label", actor.label + " — toucher pour interagir");
      node.dataset.bubble = actor.bubble;
      node.addEventListener("click", () => {
        const wasOpen = node.classList.contains("is-greeting");
        layer.querySelectorAll(".is-greeting").forEach((item) => item.classList.remove("is-greeting"));
        if (!wasOpen) {
          node.classList.add("is-greeting");
          window.clearTimeout(node.greetingTimer);
          node.greetingTimer = window.setTimeout(() => node.classList.remove("is-greeting"), 2200);
          const toast = $("toast");
          if (toast) {
            toast.textContent = actor.className.includes("street-walker")
              ? "👋 Tu salues un habitant de Grand-Bassam !"
              : "🚗 Un véhicule passe dans la rue.";
            toast.hidden = false;
            window.clearTimeout(toast.streetLifeTimer);
            toast.streetLifeTimer = window.setTimeout(() => { toast.hidden = true; }, 2200);
          }
        }
      });
      layer.append(node);
    });
    canvas.append(layer);
  }
  function init() {
    phoneState = loadPhone();
    makeStreetLife();
    makePhone();
    const activityList = $("activity-list");
    if (activityList && typeof MutationObserver !== "undefined") new MutationObserver(() => { if (activeTab === "activities" && $("phone-panel") && !$("phone-panel").hidden) renderTab(); }).observe(activityList, { childList: true, subtree: true, characterData: true });
  }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})();