"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { freshState, validState, calculateActivity, calculateRest, COSTS, ACTIVITIES, STARTING_BALANCE, STARTING_ENERGY } = require("../game.js");
test("new character starts with the documented demo balance and energy", () => {
  const state = freshState("Aya Kouassi", "Coastal creative");
  assert.equal(state.name, "Aya Kouassi");
  assert.equal(state.balance, STARTING_BALANCE);
  assert.equal(state.energy, STARTING_ENERGY);
  assert.deepEqual(state.actions, []);
  assert.equal(validState(state), true);
});
test("activity costs and energy effects are defined for all four locations", () => {
  assert.deepEqual(Object.keys(ACTIVITIES).sort(), ["bar", "beach", "lavage", "market"]);
  assert.equal(COSTS.bar, 500);
  assert.equal(COSTS.beach, 0);
  for (const activity of Object.values(ACTIVITIES)) assert.ok(activity.energy < 0);
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
test("rest and activity history are bounded in the documented demo state", () => {
  const state = freshState("Aya", "Coastal creative");
  assert.equal(state.actions.length, 0);
  assert.equal(state.energy, 80);
  assert.equal(state.balance, 5000);
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
  const initial = {
    ...freshState("Aya", "Coastal creative"),
    actions: Array.from({ length: 100 }, (_, i) => ({ title: "Old " + i, at: "2026-10-17T12:00:00.000Z" }))
  };
  const next = calculateActivity(initial, "beach", "2026-10-17T12:01:00.000Z");
  assert.equal(next.actions.length, 100);
  assert.equal(next.actions.at(-1).title, ACTIVITIES.beach.title);
});

test("rest recovers up to 25 energy without exceeding 100", () => {
  const initial = { ...freshState("Aya", "Coastal creative"), energy: 90 };
  const result = calculateRest(initial, "2026-10-17T12:00:00.000Z");
  assert.equal(result.recovered, 10);
  assert.equal(result.state.energy, 100);
  assert.equal(result.state.actions.length, 1);
  assert.equal(initial.energy, 90, "rest transition must not mutate previous state");
});
test("rest is unavailable when energy is already full", () => {
  const initial = { ...freshState("Aya", "Coastal creative"), energy: 100 };
  assert.equal(calculateRest(initial), null);
});
