"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { freshState, validState, migrateState, calculateActivity, calculateRest, calculateEnergyPurchase, calculateTransfer, calculateWorkShift, calculatePurchase, calculateHomeSleep, calculateHomeUpgrade, calculateTravel, calculateCarPurchase, advanceTime, JOBS, SHOP_ITEMS, HOME_UPGRADES, HOME_STORE_ITEMS, CAR_PRICE, TRANSPORT, DAILY_SHIFT_LIMIT, COSTS, ACTIVITIES, PEOPLE, STARTING_BALANCE, MAX_BALANCE, STARTING_ENERGY, ENERGY_PACK_COST, ENERGY_PACK_AMOUNT } = require("../game.js");
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
  assert.equal(next.balance, STARTING_BALANCE - 500);
  assert.equal(next.energy, 77);
  assert.deepEqual(next.actions, [{ title: ACTIVITIES.bar.title, at: "2026-10-17T12:00:00.000Z" }]);
  assert.equal(initial.balance, STARTING_BALANCE, "transition must not mutate previous state");
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
  assert.equal(calculateActivity(initial, "drink").balance, STARTING_BALANCE - 500);
  assert.equal(calculateActivity(initial, "food").balance, STARTING_BALANCE - 750);
});
test("each playable location has a local crowd grouped into sections", () => {
  for (const location of ["beach", "bar", "restaurant", "lavage"]) {
    assert.ok(PEOPLE[location].length >= 3);
    assert.ok(PEOPLE[location].every((person) => person.id && person.name && person.section && person.line));
  }
  assert.ok(PEOPLE.beach.some((person) => person.section !== PEOPLE.beach[0].section));
  assert.ok(PEOPLE.lavage.some((person) => person.section === "Wash bay"));
  assert.ok(PEOPLE.lavage.some((person) => person.section === "Parking area"));
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
  assert.match(js, /No real calls or online messages are sent/);
  assert.match(js, /Send Money/);
  assert.match(js, /10000000/);
  assert.match(js, /window\.AbijanLifeGame/);
  assert.match(html, /id="buy-energy-button"/);
  assert.match(html, /id="life-panel"/);
  assert.match(fs.readFileSync(require("node:path").join(__dirname, "..", "styles.css"), "utf8"), /\.life-grid/);
  assert.match(css, /\.phone-transfer-form/);
});


test("new characters start with 100 million simulated FCFA and state accepts the new cap", () => {
  const state = freshState("Aya", "Coastal creative");
  assert.equal(STARTING_BALANCE, 100000000);
  assert.equal(state.balance, 100000000);
  assert.equal(validState({ ...state, balance: MAX_BALANCE }), true);
  assert.equal(validState({ ...state, balance: MAX_BALANCE + 1 }), false);
});
test("legacy version 1 saves migrate without changing the player's existing balance or progress", () => {
  const legacy = { version: 1, name: "Aya", style: "Coastal creative", balance: 42000, energy: 44, actions: [{ title: "Old activity", at: "2026-10-17T12:00:00.000Z" }], relationships: { aya: 3 }, createdAt: "2026-10-17T11:00:00.000Z" };
  const migrated = migrateState(legacy);
  assert.equal(migrated.version, 5);
  assert.equal(migrated.balance, 42000);
  assert.equal(migrated.energy, 44);
  assert.equal(migrated.relationships.aya, 3);
  assert.equal(migrated.actions[0].title, "Old activity");
  assert.deepEqual(migrated.transactions, []);
  assert.deepEqual(migrated.inventory, []);
  assert.equal(migrated.day, 1);
  assert.equal(migrated.timeMinutes, 480);
  assert.equal(migrated.location, "beach");
  assert.equal(validState(migrated), true);
});
test("simulated transfers deduct once and preserve transaction history", () => {
  const initial = freshState("Aya", "Coastal creative");
  const result = calculateTransfer(initial, { id: "koffi", name: "Koffi Yao" }, 10000000, "2026-10-18T12:00:00.000Z", "transfer-test-1");
  assert.ok(result);
  assert.equal(result.state.balance, STARTING_BALANCE - 10000000);
  assert.equal(result.transaction.recipientName, "Koffi Yao");
  assert.equal(result.state.transactions.length, 1);
  assert.equal(result.state.actions.length, 1);
  assert.equal(initial.balance, STARTING_BALANCE, "transfer calculation must not mutate prior state");
  assert.equal(calculateTransfer(result.state, { id: "koffi", name: "Koffi Yao" }, 10000000, "2026-10-18T12:00:01.000Z", "transfer-test-1"), null, "duplicate transfer ID must be rejected");
});
test("simulated transfers reject invalid, unsafe, and unaffordable amounts", () => {
  const initial = freshState("Aya", "Coastal creative");
  const recipient = { id: "aya", name: "Aya Kouassi" };
  assert.equal(calculateTransfer(initial, recipient, 0, undefined, "zero"), null);
  assert.equal(calculateTransfer(initial, recipient, -10, undefined, "negative"), null);
  assert.equal(calculateTransfer(initial, recipient, STARTING_BALANCE + 1, undefined, "too-much"), null);
  assert.equal(calculateTransfer(initial, recipient, 1.5, undefined, "fraction"), null);
  assert.equal(calculateTransfer(initial, null, 1000, undefined, "no-recipient"), null);
});

test("buying energy deducts simulated FCFA and caps energy at 100", () => {
  const initial = { ...freshState("Aya", "Coastal creative"), energy: 90 };
  const result = calculateEnergyPurchase(initial, "2026-10-18T12:00:00.000Z");
  assert.equal(result.cost, ENERGY_PACK_COST);
  assert.equal(result.recovered, 10);
  assert.equal(result.state.energy, 100);
  assert.equal(result.state.balance, STARTING_BALANCE - ENERGY_PACK_COST);
  assert.equal(initial.balance, STARTING_BALANCE);
  assert.equal(calculateEnergyPurchase({ ...initial, energy: 100 }), null);
  assert.equal(calculateEnergyPurchase({ ...initial, balance: ENERGY_PACK_COST - 1 }), null);
});

test("version 2 saves migrate to version 3 without changing existing wallet and history", () => {
  const v2 = { ...freshState("Aya", "Coastal creative"), version: 2, balance: 654321, energy: 37, actions: [{ title: "Existing progress", at: "2026-10-17T12:00:00.000Z" }] };
  delete v2.inventory; delete v2.day; delete v2.timeMinutes; delete v2.location; delete v2.home; delete v2.work;
  const migrated = migrateState(v2);
  assert.equal(migrated.version, 5);
  assert.equal(migrated.balance, 654321);
  assert.equal(migrated.energy, 37);
  assert.equal(migrated.actions[0].title, "Existing progress");
  assert.equal(migrated.day, 1);
  assert.equal(migrated.timeMinutes, 480);
  assert.equal(validState(migrated), true);
});
test("in-game time advances and starts a new day with fresh job shifts", () => {
  const initial = { ...freshState("Aya", "Coastal creative"), timeMinutes: 1380, work: { day: 1, shifts: 2 } };
  const next = advanceTime(initial, 90, "2026-10-18T12:00:00.000Z");
  assert.equal(next.day, 2);
  assert.equal(next.timeMinutes, 30);
  assert.deepEqual(next.work, { day: 2, shifts: 0 });
  assert.equal(initial.day, 1);
});
test("local jobs pay simulated FCFA, cost energy and obey the daily shift limit", () => {
  const initial = { ...freshState("Aya", "Ambitious newcomer"), energy: 90 };
  const next = calculateWorkShift(initial, "beach_cleanup", "2026-10-18T12:00:00.000Z");
  assert.equal(next.balance, STARTING_BALANCE + JOBS.beach_cleanup.pay);
  assert.equal(next.energy, 72);
  assert.equal(next.work.shifts, 1);
  assert.match(next.actions[0].title, /earned/);
  const second = calculateWorkShift(next, "cafe_shift", "2026-10-18T14:00:00.000Z");
  assert.equal(second.work.shifts, DAILY_SHIFT_LIMIT);
  assert.equal(calculateWorkShift(second, "car_wash"), null);
  assert.equal(calculateWorkShift({ ...initial, energy: 10 }, "beach_cleanup"), null);
  assert.equal(initial.balance, STARTING_BALANCE);
});
test("shop purchases update wallet and inventory without mutating the old save", () => {
  const initial = freshState("Aya", "Coastal creative");
  const next = calculatePurchase(initial, "bottled_water", "2026-10-18T12:00:00.000Z");
  assert.equal(next.balance, STARTING_BALANCE - SHOP_ITEMS.bottled_water.price);
  assert.deepEqual(next.inventory, [{ id: "bottled_water", quantity: 1 }]);
  assert.equal(initial.inventory.length, 0);
  const second = calculatePurchase(next, "bottled_water", "2026-10-18T12:01:00.000Z");
  assert.equal(second.inventory[0].quantity, 2);
  assert.equal(calculatePurchase(initial, "unknown-item"), null);
  assert.equal(calculatePurchase({ ...initial, balance: 0 }, "bottled_water"), null);
});
test("sleeping at home restores energy and advances eight in-game hours", () => {
  const initial = { ...freshState("Aya", "Coastal creative"), energy: 21, timeMinutes: 600 };
  const next = calculateHomeSleep(initial, "2026-10-18T12:00:00.000Z");
  assert.equal(next.energy, 100);
  assert.equal(next.timeMinutes, 1080);
  assert.equal(next.location, "beach");
  assert.match(next.actions[0].title, /sleep/);
  assert.equal(initial.energy, 21);
  assert.equal(calculateHomeSleep({ ...initial, energy: 100 }), null);
});

test("home upgrades charge the correct simulated price and progress up to level three", () => {
  const initial = freshState("Aya", "Coastal creative");
  const level2 = calculateHomeUpgrade(initial, "2026-10-18T12:00:00.000Z");
  assert.equal(level2.home.level, 2);
  assert.equal(level2.balance, STARTING_BALANCE - HOME_UPGRADES[2].cost);
  assert.match(level2.actions[0].title, /Comfortable room/);
  const level3 = calculateHomeUpgrade(level2, "2026-10-18T12:01:00.000Z");
  assert.equal(level3.home.level, 3);
  assert.equal(level3.balance, STARTING_BALANCE - HOME_UPGRADES[2].cost - HOME_UPGRADES[3].cost);
  assert.equal(calculateHomeUpgrade(level3), null);
  assert.equal(calculateHomeUpgrade({ ...initial, balance: HOME_UPGRADES[2].cost - 1 }), null);
  assert.equal(initial.home.level, 1);
});

test("new characters have a default transport mode and travel charges fare, time, and energy", () => {
  const initial = freshState("Aya", "Coastal creative");
  assert.equal(initial.version, 5);
  assert.equal(initial.transportMode, "gbaka");
  assert.equal(validState(initial), true);
  const trip = calculateTravel(initial, "bar", "gbaka", "2026-10-18T12:00:00.000Z");
  assert.equal(trip.location, "bar");
  assert.equal(trip.balance, STARTING_BALANCE - TRANSPORT.gbaka.fare);
  assert.equal(trip.energy, STARTING_ENERGY - TRANSPORT.gbaka.energy);
  assert.equal(trip.timeMinutes, 480 + TRANSPORT.gbaka.minutes);
  assert.equal(trip.transportMode, "gbaka");
  assert.match(trip.actions[0].title, /Travelled to/);
  assert.equal(calculateTravel(initial, "unknown", "walk"), null);
  assert.equal(calculateTravel({ ...initial, balance: 0 }, "bar", "car"), null);
  assert.equal(calculateTravel({ ...initial, energy: 0 }, "bar", "walk"), null);
});
test("version 3 saves migrate to version 4 and keep their existing wallet and progress", () => {
  const v3 = { ...freshState("Aya", "Coastal creative"), version: 3, balance: 876543, energy: 41, day: 3, timeMinutes: 900, location: "restaurant" };
  delete v3.transportMode;
  const migrated = migrateState(v3);
  assert.equal(migrated.version, 5);
  assert.equal(migrated.transportMode, "gbaka");
  assert.equal(migrated.balance, 876543);
  assert.equal(migrated.energy, 41);
  assert.equal(migrated.day, 3);
  assert.equal(migrated.timeMinutes, 900);
  assert.equal(migrated.location, "restaurant");
  assert.equal(validState(migrated), true);
});

test("car purchase costs simulated FCFA and ownership unlocks free personal-car travel", () => {
  const initial = freshState("Aya", "Coastal creative");
  const car = calculateCarPurchase(initial, "2026-10-18T12:00:00.000Z");
  assert.equal(CAR_PRICE, 5000000);
  assert.equal(car.ownsCar, true);
  assert.equal(car.balance, STARTING_BALANCE - CAR_PRICE);
  assert.equal(calculateCarPurchase(car), null, "cannot buy a second car");
  assert.equal(calculateTravel(initial, "bar", "owned_car"), null, "cannot use a car before owning one");
  const trip = calculateTravel({ ...car, transportMode: "owned_car" }, "bar", "owned_car", "2026-10-18T12:05:00.000Z");
  assert.equal(trip.balance, car.balance, "owned-car travel has no fare in Update 1");
  assert.equal(trip.energy, car.energy);
  assert.equal(trip.location, "bar");
  assert.equal(trip.timeMinutes, car.timeMinutes + 10);
  assert.equal(validState({ ...car, transportMode: "owned_car" }), true);
  assert.equal(validState({ ...initial, transportMode: "owned_car" }), false);
});
test("home furniture catalogue is separate from everyday shop items", () => {
  assert.deepEqual(HOME_STORE_ITEMS, ["sofa", "bed", "dining_table"]);
  for (const key of HOME_STORE_ITEMS) assert.ok(SHOP_ITEMS[key]);
  assert.equal(SHOP_ITEMS.sofa.price, 150000);
  assert.equal(SHOP_ITEMS.bed.price, 200000);
  assert.equal(SHOP_ITEMS.dining_table.price, 100000);
});
