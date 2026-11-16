import assert from "node:assert/strict";
import { test } from "node:test";
import { mockData, NOW } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const tm = load({ names: ["parseDuration", "durationText", "resolve", "STRINGS", "LANGUAGES"] });
const TimerCard = tm.element("timer-card");
const TimerMiniCard = tm.element("timer-mini-card");
// Objects from the sandbox have the sandbox's prototypes: compared as plain JSON.
const same = (a, b, msg) => assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), msg);

const makeHass = (variant = "default", { language = "en" } = {}) => {
  const d = mockData(variant);
  const calls = [];
  return { calls, ...d, language, locale: { language }, callService: (...a) => calls.push(a) };
};

const mount = async (config = {}, variant = "default", Card = TimerCard, opts = {}) => {
  const card = new Card();
  card._connected = true;
  card.setConfig(config);
  const hass = makeHass(variant, opts);
  card.hass = hass;
  card.connectedCallback();
  await new Promise((r) => setTimeout(r, 0));
  // Intl puts narrow no-break spaces in times ("12:32 PM"): plain spaces for the assertions.
  return { card, hass, html: () => card.shadowRoot.innerHTML.replace(/[   ]/g, " ") };
};

const click = (card, dataset) => card._onClick({ composedPath: () => [{ dataset }], stopPropagation() {}, detail: 1 });

test("durations: H:MM:SS, days, seconds; and back for the timer services", () => {
  assert.equal(tm.parseDuration("0:05:00"), 300000);
  assert.equal(tm.parseDuration("1:20:00"), 4800000);
  assert.equal(tm.parseDuration("1 day, 2:00:00"), 93600000);
  assert.equal(tm.parseDuration(90), 90000);
  assert.equal(tm.parseDuration("soon"), null);
  assert.equal(tm.durationText(10), "0:10:00");
  assert.equal(tm.durationText(75), "1:15:00");
});

test("timer helpers, Google Home and Alexa timers sensors and counters are discovered", () => {
  const m = tm.resolve(makeHass(), {});
  same(
    m.timers.map((x) => [x.entity, x.kind]),
    [
      ["timer.oeufs", "timer"],
      ["timer.lessive", "timer"],
      ["timer.four", "timer"],
      ["timer.pates", "timer"],
      ["sensor.cuisine_minuteurs", "google_home"],
      ["sensor.salon_prochain_minuteur", "alexa_media"],
    ],
  );
  same(
    m.counters.map((x) => x.entity),
    ["counter.cafes"],
  );
});

test("every timer with its state, end and length; sorted by what ends first", async () => {
  const { card } = await mount();
  const items = card._summary(card._resolve()).items;
  same(
    items.map((it) => [it.name, it.status]),
    [
      ["Tea", "active"],
      ["Pasta", "active"],
      ["Bread", "active"],
      ["Laundry", "active"],
      ["Oven", "paused"],
      ["Eggs", "idle"],
    ],
  );
  const bread = items.find((it) => it.name === "Bread");
  // Alexa: the time left when last processed, from then.
  assert.equal(bread.end, NOW - 6e4 + 26 * 6e4);
  assert.equal(bread.total, 45 * 6e4);
  assert.equal(items.find((it) => it.name === "Oven").remaining, 12 * 6e4);
});

test("header, hero and rows: the next timer in large, live countdowns, its speaker", async () => {
  const { html } = await mount();
  const h = html();
  assert.match(h, /chip accent[^>]*>.*4 running/s);
  assert.match(h, /4 running · 1 paused/);
  assert.match(h, /class="label">Tea</);
  assert.match(h, /Ends at 12:32 PM/);
  assert.match(h, /Kitchen speaker/);
  assert.match(h, /data-end="\d+">3:15</);
  assert.match(h, /class="sweep"/);
  assert.equal((h.match(/class="row"/g) || []).length >= 7, true);
});

test("timer helper buttons call the timer services; quick starts and the duration popup start one", async () => {
  const { card, hass, html } = await mount();
  click(card, { action: "pause", key: "timer.pates" });
  click(card, { action: "add", key: "timer.pates" });
  click(card, { action: "cancel", key: "timer.lessive" });
  click(card, { action: "resume", key: "timer.four" });
  click(card, { action: "quick", key: "timer.oeufs", min: "10" });
  same(hass.calls, [
    ["timer", "pause", { entity_id: "timer.pates" }],
    ["timer", "change", { entity_id: "timer.pates", duration: "0:01:00" }],
    ["timer", "cancel", { entity_id: "timer.lessive" }],
    ["timer", "start", { entity_id: "timer.four" }],
    ["timer", "start", { entity_id: "timer.oeufs", duration: "0:10:00" }],
  ]);
  click(card, { action: "start", key: "timer.oeufs" });
  assert.match(html(), /class="modal"/);
  assert.match(html(), /Start Eggs/);
  card._dialogAction("dur_preset", { dataset: { min: "20" } });
  card._dialogAction("dur_plus", { dataset: {} });
  card._dialogAction("dialog_ok", { dataset: {} });
  same(hass.calls.at(-1), ["timer", "start", { entity_id: "timer.oeufs", duration: "0:21:00" }]);
  assert.doesNotMatch(html(), /class="modal"/);
});

test("a Google Home timer is dismissed with its service; a ringing one rings in the header", async () => {
  const { card, hass, html } = await mount({}, "ringing");
  assert.match(html(), /chip crit[^>]*>.*Ringing/s);
  assert.match(html(), /shake/);
  click(card, { action: "dismiss", key: "sensor.cuisine_minuteurs|timer/5b2e6a1e-1111-4c7e-9d6f-0123456789ab" });
  same(hass.calls.at(-1), ["google_home", "delete_timer", { entity_id: "sensor.cuisine_minuteurs", timer_id: "timer/5b2e6a1e-1111-4c7e-9d6f-0123456789ab" }]);
});

test("counters: − and + call the counter services, disabled at their bounds", async () => {
  const { card, hass, html } = await mount();
  click(card, { action: "inc", entity: "counter.cafes" });
  click(card, { action: "dec", entity: "counter.cafes" });
  same(hass.calls, [
    ["counter", "increment", { entity_id: "counter.cafes" }],
    ["counter", "decrement", { entity_id: "counter.cafes" }],
  ]);
  hass.states["counter.cafes"] = { ...hass.states["counter.cafes"], state: "10" };
  card.hass = { ...hass, states: { ...hass.states } };
  assert.match(html(), /data-action="inc" data-entity="counter.cafes"[^>]*disabled/);
});

test("nothing running: the hero says so, the quick starts stay", async () => {
  const { html } = await mount({}, "idle");
  assert.match(html(), /No timer running/);
  assert.match(html(), /data-action="quick"/);
  assert.doesNotMatch(html(), /class="chip/);
});

test("options: sections hidden, folded, and a click elsewhere folds them back", async () => {
  const { card, html } = await mount({ show_counters: false, show_quick: false, collapsed: ["timers"] });
  assert.doesNotMatch(html(), /Coffees today/);
  assert.doesNotMatch(html(), /data-action="quick"/);
  assert.doesNotMatch(html(), /Laundry/);
  click(card, { action: "toggle_section", section: "timers" });
  assert.match(html(), /Laundry/);
  card._outside.tap({ composedPath: () => [] });
  assert.doesNotMatch(html(), /Laundry/);
});

test("configured timers and counters are used as given", async () => {
  const { card, html } = await mount({ timers: ["timer.pates"], counters: [] });
  assert.equal(card._resolve().timers.length, 1);
  assert.doesNotMatch(html(), /Laundry|Coffees/);
});

test("mini card: the next timer's ring, the running ones and a pause button; the detail button shows the full card", async () => {
  const { card, html } = await mount({}, "default", TimerMiniCard);
  assert.match(html(), /content mini/);
  assert.match(html(), /Tea/);
  assert.match(html(), /data-action="dismiss"/);
  click(card, { action: "zoom" });
  assert.match(html(), /TIMERS|section-title/);
  card._unzoom.tap({ composedPath: () => [] });
  assert.match(html(), /content mini/);
});

test("nothing found: a clear message instead of an empty card", () => {
  const card = new TimerCard();
  card.setConfig({});
  card.hass = { states: {}, entities: {}, devices: {}, language: "en" };
  assert.match(card.shadowRoot.innerHTML, /no timer or counter found/);
});

test("French: texts and lengths in the card's language", async () => {
  const { html } = await mount({ language: "fr" });
  assert.match(html(), /4 en cours · 1 en pause/);
  assert.match(html(), /Démarrage rapide · Eggs/);
});

test("every language has every text, with the same placeholders as English", () => {
  const en = tm.STRINGS.en;
  const ph = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  for (const [l, table] of Object.entries(tm.STRINGS)) {
    assert.deepEqual(Object.keys(table).sort(), Object.keys(en).sort(), l);
    for (const k of Object.keys(en)) assert.deepEqual(ph(table[k]), ph(en[k]), `${l}.${k}`);
  }
  assert.equal(tm.LANGUAGES.length, Object.keys(tm.STRINGS).length);
});

test("visual editor: fields labelled apart from the sections, defaults left out of the YAML; the mini editor adds the detail button", () => {
  const Editor = tm.element("timer-card-editor");
  const MiniEditor = tm.element("timer-mini-card-editor");
  const doc = tm.window.document;
  const create = doc.createElement;
  let form;
  doc.createElement = (tag) => (form = { tag, listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; } });
  try {
    const ed = new Editor();
    let out;
    ed.dispatchEvent = (ev) => {
      out = ev.detail.config;
    };
    ed.setConfig({ type: "custom:timer-card" });
    ed.hass = makeHass();
    assert.match(form.computeLabel({ name: "timers" }), /empty: automatic/);
    form.listeners["value-changed"]({ stopPropagation() {}, detail: { value: { type: "custom:timer-card", show_quick: true, show_counters: false, timers: [] } } });
    same(out, { type: "custom:timer-card", show_counters: false });
  } finally {
    doc.createElement = create;
  }
  assert.ok(MiniEditor.toggles.some(([n]) => n === "zoom"));
});

test("every clickable element can be reached and used from the keyboard", async () => {
  const { html } = await mount();
  for (const m of html().matchAll(/<(div|span)[^>]*data-(entity|action)=[^>]*>/g)) {
    assert.match(m[0], /role="button"/, m[0]);
    assert.match(m[0], /tabindex="0"/, m[0]);
  }
});
