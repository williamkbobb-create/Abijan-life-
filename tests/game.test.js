"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { freshState, validState, COSTS, ACTIVITIES, STARTING_BALANCE, STARTING_ENERGY } = require("../game.js");
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
