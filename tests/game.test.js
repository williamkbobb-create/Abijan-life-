"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { freshState, validState, calculateActivity, calculateRest, COSTS, ACTIVITIES, PEOPLE, STARTING_BALANCE, STARTING_ENERGY } = require("../game.js");
test("new character starts with the documented demo balance and energy", () => {
  const state = freshState("Aya Kouassi", "Coastal creative");
  assert.equal(state.name, "Aya Kouassi");
  assert.equal(state.balance, STARTING_BALANCE);
  assert.equal(state.energy, STARTING_ENERGY);
  assert.deepEqual(state.actions, []);
  assert.equal(validState(state), true);
});
test("activity costs and energy effects are defined for all playable actions", () => {
  assert.deepEqual(Object.keys(ACTIVITIES).sort(), ["bar","beach","chat","dance","drink","explore","food","freestyle","friend","game","greet","inspect","invite","lavage","meet","photo","restaurant","sit","swim","washcar"].sort());
  assert.equal(COSTS.bar, 500);
  assert.equal(COSTS.washcar, 0);
  assert.ok(ACTIVITIES.washcar.energy < 0);
  assert.equal(COSTS.beach, 0);
  for (const activity of Object.values(ACTIVITIES)) assert.ok(Number.isInteger(activity.energy));
});
test("persisted state validator rejects invalid or unsafe state shapes", () => {
  assert.equal(validState(null), false);
  assert.equal(validState({ version: 1, name: "A", style: "Coastal creative", balance: 5000, energy: 80, actions: [] }), false);
  assert.equal(validState({ version: 1, name: "Aya", style: "Coastal creative", balance: -1, energy: 80, actions: [] }), false);
  assert.equal(validState({ version: 1, name: "Aya", style: "Coastal creative", balance: 5000, energy: 101, actions: [] }), false);
  assert.equal(validState({ version: 1, name: "Aya", style: "Coastal creative", balance: 5000, energy: 80, actions: Array(101).fill({}) }), false);
  assert.equal(validState({ ...freshState("Aya", "Coastal creative"), actions: [{ title: "x".repeat(161), at: new Date().toISOString() }] }), false);
  assert.equal(validState({ ...freshState("Aya", "Coastal creative"), actions: [{ title: "Bad timestamp", at: "not-a-date" }] }), false);
});
test("valid state accepts the known character styles and bounded counters", () => {
  assert.equal(validState(freshState("Koffi", "Ambitious newcomer")), true);
});
test("activity catalog has a non-negative cost for every activity", () => {
  for (const key of Object.keys(ACTIVITIES)) {
    assert.ok(Number.isInteger(COSTS[key]));
    assert.ok(COSTS[key] >= 0);
  }
});
test("activity transition deducts cost, updates energy, and records history", () => {
  const initial = freshState("Aya", "Coastal creative");
  const next = calculateActivity(initial, "bar", "2026-10-17T12:00:00.000Z");
  assert.equal(next.balance, 4500);
  assert.equal(next.energy, 77);
  assert.deepEqual(next.actions, [{ title: ACTIVITIES.bar.title, at: "2026-10-17T12:00:00.000Z" }]);
  assert.equal(initial.balance, 5000, "transition must not mutate previous state");
});
test("activity transition refuses unknown actions, exhausted energy, and insufficient funds", () => {
  const initial = freshState("Aya", "Coastal creative");
  assert.equal(calculateActivity(initial, "unknown"), null);
  assert.equal(calculateActivity({ ...initial, energy: 0 }, "beach"), null);
  assert.equal(calculateActivity({ ...initial, balance: 100 }, "bar"), null);
});
test("activity transition keeps history at the most recent 100 entries", () => {
  const initial = { ...freshState("Aya", "Coastal creative"), actions: Array.from({ length: 100 }, (_, i) => ({ title: "Old " + i, at: "2026-10-17T12:00:00.000Z" })) };
  const next = calculateActivity(initial, "beach", "2026-10-17T12:01:00.000Z");
  assert.equal(next.actions.length, 100);
  assert.equal(next.actions.at(-1).title, ACTIVITIES.beach.title);
});
test("rest recovers energy without exceeding 100", () => {
  const initial = { ...freshState("Aya", "Coastal creative"), energy: 90 };
  const result = calculateRest(initial, "2026-10-17T12:00:00.000Z");
  assert.equal(result.recovered, 10);
  assert.equal(result.state.energy, 100);
  assert.equal(result.state.actions.length, 1);
  assert.equal(initial.energy, 90);
});
test("rest is unavailable when energy is already full", () => {
  assert.equal(calculateRest({ ...freshState("Aya", "Coastal creative"), energy: 100 }), null);
});
test("buying drinks and local food deduct only simulated FCFA", () => {
  const initial = freshState("Aya", "Coastal creative");
  assert.equal(calculateActivity(initial, "drink").balance, 4500);
  assert.equal(calculateActivity(initial, "food").balance, 4250);
});
test("each playable location has a local crowd grouped into sections", () => {
  for (const location of ["beach", "bar", "restaurant", "lavage"]) {
    assert.ok(PEOPLE[location].length >= 3);
    assert.ok(PEOPLE[location].every((person) => person.id && person.name && person.section && person.line));
  }
  assert.ok(PEOPLE.beach.some((person) => person.section !== PEOPLE.beach[0].section));
  assert.ok(PEOPLE.lavage.some((person) => person.section === "Zone de lavage"));
  assert.ok(PEOPLE.lavage.some((person) => person.section === "Parking"));
});
test("sitting can restore energy and is recorded as a game activity", () => {
  const initial = { ...freshState("Aya", "Coastal creative"), energy: 60 };
  const next = calculateActivity(initial, "sit", "2026-10-17T12:00:00.000Z");
  assert.equal(next.energy, 68);
  assert.equal(next.actions[0].title, ACTIVITIES.sit.title);
});


test("phone interface is loaded as a compact side panel with the world still present", () => {
  const fs = require("node:fs");
  const html = fs.readFileSync(require("node:path").join(__dirname, "..", "index.html"), "utf8");
  const css = fs.readFileSync(require("node:path").join(__dirname, "..", "phone.css"), "utf8");
  const js = fs.readFileSync(require("node:path").join(__dirname, "..", "phone.js"), "utf8");
  assert.match(html, /href="phone\.css"/);
  assert.match(html, /src="phone\.js"/);
  assert.match(html, /class="world-scene"/);
  for (const tab of ["messages", "calls", "contacts", "activities", "settings"]) assert.ok(js.includes('data-phone-tab="' + tab + '"'));
  assert.match(css, /\.phone-panel/);
  assert.match(css, /@media\s*\(max-width:\s*650px\)/);
  assert.match(css, /top:132px/);
  assert.match(css, /grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(js, /phone-launcher.*Ouvrir le téléphone du jeu/);
  for (const app of ["💬", "☎️", "👥", "🗓️", "⚙️"]) assert.ok(js.includes(app));
  assert.match(js, /Aucun appel réel ni message en ligne n’est envoyé/);
});


test("French preview UI avoids untranslated map and action labels", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const game = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");
  const phone = fs.readFileSync(path.join(__dirname, "..", "phone.js"), "utf8");
  assert.ok(html.includes("<span>ÉNERGIE</span>"));
  assert.ok(html.includes("GOLFE DE GUINÉE"));
  assert.ok(!html.includes("GULF OF GUINEA"));
  assert.ok(!html.includes("TOUCHE UN LIEU POUR EXPLORERR"));
  assert.ok(!html.includes("💬 Discuter"));
  assert.match(game, /talk.textContent = "Discuter"/);
  assert.match(game, /wave.textContent = "Dire bonjour"/);
  assert.match(phone, /Les appels sont simulés/);
});


 test("branded favicon is linked and exists as an SVG asset", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const favicon = fs.readFileSync(path.join(__dirname, "..", "favicon.svg"), "utf8");
  assert.ok(html.includes('rel="icon" type="image/svg+xml" href="favicon.svg"'));
  assert.match(favicon, /<svg[\s>]/);
  assert.match(favicon, /#092e2c/);
});


test("player feedback is compact and the next-update plan is visible", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const css = fs.readFileSync(path.join(__dirname, "..", "feedback.css"), "utf8");
  const roadmap = fs.readFileSync(path.join(__dirname, "..", "ROADMAP.md"), "utf8");
  assert.ok(html.includes('id="next-update"'));
  assert.ok(html.includes("Un avis rapide suffit."));
  assert.ok(html.includes('maxlength="300"'));
  assert.ok(!html.includes('id="feedback-name"'));
  assert.ok(html.includes('id="feedback-category"'));
  assert.ok(html.includes('id="feedback-message"'));
  assert.ok(css.includes(".next-update-list"));
  assert.ok(roadmap.includes("Tutoriel de première visite"));
  assert.ok(roadmap.includes("URL officielle de NouchiLink doit être confirmée"));
});


 test("preview enters through character creation without an account gate or tutorial", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const root = path.join(__dirname, "..");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(html, /id="welcome-screen"/);
  assert.match(html, /id="character-form"/);
  assert.match(html, /src="game.js" defer/);
  assert.match(html, /src="auth\.js" defer/);
  assert.match(html, /href="auth\.css"/);
  assert.match(html, /id="auth-toggle"/);
  assert.match(html, /@supabase\/supabase-js@2/);
  const auth = fs.readFileSync(path.join(root, "auth.js"), "utf8");
  assert.match(auth, /compte est facultatif/);
  assert.doesNotMatch(auth, /welcome-screen.*hidden = false|game-screen.*hidden = true/);
  assert.doesNotMatch(html, /id="first-play-tutorial"/);
});
