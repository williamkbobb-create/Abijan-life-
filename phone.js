"use strict";
(() => {
  const PHONE_KEY = "abijan-life-phone-v1";
  const $ = (id) => document.getElementById(id);
  const demoMessages = [
    { id: "aya-1", name: "Aya Kouassi", avatar: "👩🏾", text: "Hey! Are you at the beach today?", time: "Just now", unread: true },
    { id: "koffi-1", name: "Koffi Yao", avatar: "🧑🏿", text: "The music at Les Palmiers is getting good 🎶", time: "2 min", unread: true },
    { id: "amina-1", name: "Amina Traoré", avatar: "👩🏿", text: "We should grab something to eat later.", time: "12 min", unread: false }
  ];
  const contacts = [
    { id: "aya", name: "Aya Kouassi", avatar: "👩🏾", status: "At Grand-Bassam Beach" },
    { id: "koffi", name: "Koffi Yao", avatar: "🧑🏿", status: "At Les Palmiers Beach Bar" },
    { id: "amina", name: "Amina Traoré", avatar: "👩🏿", status: "Around town" },
    { id: "issa", name: "Issa Koné", avatar: "🧔🏿", status: "At Lavage International" }
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
  let activeTransferView = false;
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
    const launcher = button("▣", "phone-launcher", togglePhone, "Open in-game phone");
    launcher.id = "phone-launcher";
    launcher.innerHTML = '<span class="phone-glyph" aria-hidden="true">▰</span><span class="phone-launcher-label">PHONE</span><i class="phone-notification-dot" aria-hidden="true"></i>';
    const panel = el("aside", "phone-panel");
    panel.id = "phone-panel";
    panel.hidden = true;
    panel.setAttribute("aria-label", "In-game phone");
    panel.innerHTML = '<div class="phone-top"><div class="phone-camera"></div><div class="phone-status"><span>● BASSAM MOBILE</span><span id="phone-clock">21:39</span></div></div><header class="phone-header"><div><small>YOUR POCKET WORLD</small><h2 id="phone-title">Messages</h2></div><button id="phone-close" type="button" aria-label="Put phone away">−</button></header><nav class="phone-tabs" aria-label="Phone apps"><button type="button" data-phone-tab="messages">Messages <i id="phone-unread">2</i></button><button type="button" data-phone-tab="calls">Calls</button><button type="button" data-phone-tab="contacts">Contacts</button><button type="button" data-phone-tab="activities">Activity</button><button type="button" data-phone-tab="settings">Settings</button></nav><div id="phone-content" class="phone-content"></div><footer class="phone-footer"><span>●</span> ABJ MOBILE <span>·</span> SIMULATED WORLD</footer>';
    game.append(launcher, panel);
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
    activeTransferView = false;
    const title = { messages: "Messages", calls: "Calls", contacts: "Contacts", activities: "Activity", settings: "Settings" }[tab] || "Messages";
    $("phone-title").textContent = title;
    $("phone-panel").querySelectorAll("[data-phone-tab]").forEach((node) => node.classList.toggle("active", node.dataset.phoneTab === tab));
    renderTab();
  }
  function renderTab() {
    const content = $("phone-content");
    content.replaceChildren();
    if (activeTransferView) { renderTransferForm(content); return; }
    if (activeConversation) { renderConversation(content, activeConversation); return; }
    if (activeTab === "messages") renderMessages(content);
    else if (activeTab === "calls") renderCalls(content);
    else if (activeTab === "contacts") renderContacts(content);
    else if (activeTab === "activities") renderActivities(content);
    else renderSettings(content);
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
    content.append(el("p", "phone-intro", "Catch up with people around Grand-Bassam."));
    content.append(button("↗  Send Money", "phone-primary", () => { activeTransferView = true; renderTab(); }));
    const gameState = window.AbijanLifeGame && window.AbijanLifeGame.getState();
    const transactions = gameState && Array.isArray(gameState.transactions) ? gameState.transactions.slice().reverse() : [];
    if (transactions.length) {
      content.append(el("h3", "phone-section-title", "Recent transfers"));
      transactions.slice(0, 5).forEach((transaction) => {
        const card = el("article", "phone-transfer-history");
        card.append(el("b", "", "Sent " + Number(transaction.amount).toLocaleString("en-US") + " FCFA"));
        card.append(el("small", "", "To " + transaction.recipientName + " · " + new Date(transaction.at).toLocaleString()));
        content.append(card);
      });
    }
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
    content.append(el("p", "phone-demo-note", "Demo conversations · messages stay on this device"));
  }
  function renderTransferForm(content) {
    const game = window.AbijanLifeGame;
    const current = game && game.getState();
    if (!current) {
      content.append(button("← Messages", "phone-back", () => { activeTransferView = false; renderTab(); }));
      content.append(el("div", "phone-empty", "The game wallet is not ready yet. Close and reopen the phone."));
      return;
    }
    content.append(button("← Messages", "phone-back", () => { activeTransferView = false; renderTab(); }));
    content.append(el("p", "phone-intro", "Send simulated FCFA to someone in your Grand-Bassam contacts. No real money moves."));
    const form = el("form", "phone-transfer-form");
    const recipientLabel = el("label", "phone-field-label", "Recipient");
    recipientLabel.htmlFor = "phone-transfer-recipient";
    const recipient = el("select");
    recipient.id = "phone-transfer-recipient";
    recipient.required = true;
    contacts.forEach((person) => {
      const option = el("option", "", person.name);
      option.value = person.id;
      recipient.append(option);
    });
    const amountLabel = el("label", "phone-field-label", "Amount (FCFA)");
    amountLabel.htmlFor = "phone-transfer-amount";
    const amount = el("input");
    amount.id = "phone-transfer-amount";
    amount.type = "number";
    amount.min = "1";
    amount.max = String(current.balance);
    amount.step = "1";
    amount.inputMode = "numeric";
    amount.required = true;
    amount.placeholder = "Enter a custom amount";
    const presets = el("div", "phone-transfer-presets");
    [10000, 1000000, 10000000].forEach((value) => {
      const preset = button(value.toLocaleString("en-US"), "phone-transfer-preset", () => {
        amount.value = String(value);
        updatePreview();
      });
      preset.setAttribute("aria-label", "Set amount to " + value.toLocaleString("en-US") + " FCFA");
      presets.append(preset);
    });
    const balance = el("div", "phone-transfer-balance");
    const preview = el("p", "phone-transfer-preview", "");
    const status = el("p", "phone-transfer-status", "");
    status.setAttribute("role", "status");
    const submit = button("Review and send", "phone-primary", () => {});
    submit.type = "submit";
    const note = el("p", "phone-demo-note", "Quick amounts are suggestions. You can enter any positive whole-FCFA amount within your balance.");
    function updatePreview() {
      const value = Number(amount.value);
      balance.textContent = "Available balance: " + Number(current.balance).toLocaleString("en-US") + " FCFA";
      const valid = Number.isSafeInteger(value) && value > 0 && value <= current.balance;
      preview.textContent = valid ? "Balance after transfer: " + (current.balance - value).toLocaleString("en-US") + " FCFA" : "Enter an amount greater than zero and no more than your available balance.";
      submit.disabled = !valid;
      submit.setAttribute("aria-disabled", String(!valid));
    }
    amount.addEventListener("input", updatePreview);
    form.append(recipientLabel, recipient, amountLabel, amount, presets, balance, preview, status, submit, note);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = Number(amount.value);
      if (!Number.isSafeInteger(value) || value <= 0 || value > current.balance) { updatePreview(); return; }
      const contact = contacts.find((person) => person.id === recipient.value);
      if (!contact) { status.textContent = "Choose a valid recipient."; return; }
      submit.disabled = true;
      status.textContent = "Processing transfer…";
      const result = game.transferMoney({ id: contact.id, name: contact.name }, value);
      if (!result.ok) {
        status.textContent = result.error;
        updatePreview();
        return;
      }
      phoneState.sent.push({ to: contact.id, text: "💸 You sent " + value.toLocaleString("en-US") + " simulated FCFA.", at: result.transaction.at, type: "transfer", transferId: result.transaction.id });
      phoneState.sent = phoneState.sent.slice(-100);
      persist();
      activeTransferView = false;
      renderTab();
    });
    content.append(form);
    updatePreview();
  }
  function renderConversation(content, id) {
    const message = phoneState.messages.find((item) => item.id === id);
    if (!message) { activeConversation = null; renderMessages(content); return; }
    content.append(button("← All messages", "phone-back", () => { activeConversation = null; renderTab(); }));
    const thread = el("div", "phone-thread");
    thread.append(el("div", "phone-chat-avatar", message.avatar), el("h3", "", message.name), el("p", "phone-demo-note", "Local demo conversation"));
    thread.append(el("div", "phone-bubble incoming", message.text));
    phoneState.sent.filter((item) => item.to === id).forEach((item) => thread.append(el("div", "phone-bubble outgoing", item.text)));
    const reply = el("form", "phone-reply");
    const input = el("input");
    input.placeholder = "Write a message…";
    input.maxLength = 180;
    input.setAttribute("aria-label", "Write a demo message");
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
  function renderCalls(content) {
    content.append(el("p", "phone-intro", "Call your contacts in this demo world."));
    const callButton = button("＋ New demo call", "phone-primary", () => openTab("contacts"));
    content.append(callButton);
    if (!phoneState.callLog.length) content.append(el("div", "phone-empty", "☎\nNo recent calls yet"));
    phoneState.callLog.slice().reverse().forEach((call) => {
      const contact = contacts.find((item) => item.id === call.contact) || contacts[0];
      const row = personRow(contact, "↗ Outgoing · " + call.time, () => startCall(contact));
      row.append(el("span", "phone-call-icon", "☎"));
      content.append(row);
    });
  }
  function startCall(contact) {
    const existing = $("phone-call-screen");
    if (existing) existing.remove();
    const overlay = el("div", "phone-call-screen");
    overlay.id = "phone-call-screen";
    overlay.append(el("div", "phone-call-avatar", contact.avatar), el("p", "phone-call-kicker", "DEMO OUTGOING CALL"), el("h3", "", contact.name), el("p", "phone-call-status", "Calling…"));
    const end = button("●", "phone-end-call", () => {
      if (callTimer) { clearTimeout(callTimer); callTimer = null; }
      phoneState.callLog.push({ contact: contact.id, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
      phoneState.callLog = phoneState.callLog.slice(-30);
      persist();
      overlay.remove();
      openTab("calls");
    }, "End demo call");
    overlay.append(end, el("p", "phone-demo-note", "Calls are simulated; no phone number is dialled."));
    $("phone-content").append(overlay);
    callTimer = setTimeout(() => {
      const status = overlay.querySelector(".phone-call-status");
      if (status) status.textContent = "No answer · Demo call";
    }, 1800);
  }
  function renderContacts(content) {
    content.append(el("p", "phone-intro", "People you have met around town."));
    contacts.forEach((contact) => {
      const row = personRow(contact, contact.status, () => {
        const found = phoneState.messages.find((m) => m.id === contact.id || m.name === contact.name);
        if (found) { found.unread = false; activeConversation = found.id; persist(); openTab("messages"); activeConversation = found.id; renderTab(); }
        else {
          const newMessage = { id: contact.id, name: contact.name, avatar: contact.avatar, text: "You are connected in the local demo. Say hello!", time: "Now", unread: false };
          phoneState.messages.push(newMessage); persist(); activeConversation = newMessage.id; openTab("messages"); activeConversation = newMessage.id; renderTab();
        }
      }, button("☎", "phone-mini-action", (event) => {}, "Start demo call"));
      const action = row.querySelector(".phone-mini-action");
      action.addEventListener("click", (event) => { event.stopPropagation(); startCall(contact); });
      content.append(row);
    });
  }
  function renderActivities(content) {
    content.append(el("p", "phone-intro", "Your recent life around Grand-Bassam."));
    const source = $("activity-list");
    const entries = source ? Array.from(source.querySelectorAll("li")).map((li) => li.textContent.trim()).filter(Boolean).reverse() : [];
    if (!entries.length) content.append(el("div", "phone-empty", "☀\nYour story starts here. Explore a location to record your first activity."));
    entries.slice(0, 30).forEach((entry) => content.append(el("article", "phone-activity-row", "◷  " + entry)));
  }
  function renderSettings(content) {
    content.append(el("p", "phone-intro", "Make your in-game phone feel right."));
    [["notifications", "Message notifications", "Show a dot for unread demo messages"], ["sound", "Sound effects", "Reserved for a future game audio update"]].forEach(([key, title, note]) => {
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
    content.append(button("Reset demo phone data", "phone-reset", () => {
      if (!window.confirm("Reset local demo messages and call history?")) return;
      phoneState = defaults(); persist(); openTab("settings");
    }));
    content.append(el("p", "phone-demo-note", "This is an in-game phone, not a real mobile service. No real calls or online messages are sent."));
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