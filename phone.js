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
    const hud = game.querySelector(".game-hud");\n    if (hud) hud.append(launcher); else game.append(launcher);\n    game.append(panel);
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
  function init() {
    phoneState = loadPhone();
    makePhone();
    const activityList = $("activity-list");
    if (activityList && typeof MutationObserver !== "undefined") new MutationObserver(() => { if (activeTab === "activities" && $("phone-panel") && !$("phone-panel").hidden) renderTab(); }).observe(activityList, { childList: true, subtree: true, characterData: true });
  }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})();