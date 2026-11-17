import assert from "node:assert/strict";
import { test } from "node:test";
import { mockData, NOW } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const tm = load({ names: ["parseDuration", "durationText", "resolve", "STRINGS", "LANGUAGES"] });
const TimerCard = tm.element("timer-card");
const TimerMiniCard = tm.element("timer-mini-card");
// Objects from the sandbox have the sandbox's prototypes: compared as plain JSON.
const same = (a, b, msg) => assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), msg);

const makeHass = (variant = "default", { language = "en", sun } = {}) => {
  const d = mockData(variant);
  if (sun) d.states["sun.sun"] = { entity_id: "sun.sun", state: sun, attributes: {} };
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

// A copy of the mock data with Alexa Devices sensors (core): the next timer of an Echo, and an alarm left out.
const withAlexaDevices = (hass, end) => {
  const add = (id, state, key) => {
    hass.entities[id] = { entity_id: id, platform: "alexa_devices", translation_key: key, device_id: "kitchen_dot" };
    hass.states[id] = { entity_id: id, state, attributes: { device_class: "timestamp", friendly_name: id }, last_changed: new Date(NOW).toISOString(), last_updated: new Date(NOW).toISOString() };
  };
  hass.devices.kitchen_dot = { id: "kitchen_dot", name: "Kitchen Dot", name_by_user: null };
  add("sensor.kitchen_dot_next_timer", end, "timer");
  add("sensor.kitchen_dot_next_alarm", new Date(NOW + 3.6e6).toISOString(), "alarm");
  return hass;
};

test("Alexa Devices (core): the next timer sensor is a timer ending at its state; alarms and stale ends are left out", async () => {
  const hass = withAlexaDevices(makeHass(), new Date(NOW + 7 * 6e4).toISOString());
  const m = tm.resolve(hass, {});
  assert.ok(m.timers.some((x) => x.entity === "sensor.kitchen_dot_next_timer" && x.kind === "alexa_devices"));
  assert.ok(!m.timers.some((x) => x.entity === "sensor.kitchen_dot_next_alarm"));
  const card = new TimerCard();
  card.setConfig({ timers: ["sensor.kitchen_dot_next_timer"] });
  card.hass = hass;
  const items = card._summary(card._resolve()).items;
  same(
    items.map((it) => [it.name, it.status, it.end]),
    [["Kitchen Dot", "active", NOW + 7 * 6e4]],
  );
  // A state long gone by is a stale end, not a ringing timer; unknown is no timer.
  for (const state of [new Date(NOW - 10 * 6e4).toISOString(), "unknown"]) {
    hass.states["sensor.kitchen_dot_next_timer"] = { ...hass.states["sensor.kitchen_dot_next_timer"], state };
    card.hass = { ...hass, states: { ...hass.states } };
    same(card._summary(card._resolve()).items, []);
  }
});

test("Alexa Media Player: older sorted_active formats (JSON string, [id, timer] pairs) are read", async () => {
  const timer = { id: "a1", status: "ON", remainingTime: 26 * 6e4, originalDurationInMillis: 45 * 6e4, timerLabel: "Bread" };
  for (const sorted of [JSON.stringify([timer]), [["a1", timer]], "not json"]) {
    const hass = makeHass();
    const id = "sensor.salon_prochain_minuteur";
    hass.states[id] = { ...hass.states[id], attributes: { ...hass.states[id].attributes, sorted_active: sorted } };
    const card = new TimerCard();
    card.setConfig({ timers: [id] });
    card.hass = hass;
    const items = card._summary(card._resolve()).items;
    if (sorted === "not json") {
      // Unreadable: the state (the next timer's end) is used instead.
      same(items.map((it) => [it.name, it.status]), [["Bread", "active"]]);
      continue;
    }
    same(
      items.map((it) => [it.name, it.status, it.total]),
      [["Bread", "active", 45 * 6e4]],
    );
  }
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
  // The illustrated header: running, its icon in the accent colour; the subtitle counts the timers.
  assert.match(h, /class="banner tm-running"/);
  assert.match(h, /class="type-icon accent"/);
  // The status pill on the title row says the first state, the subtitle the rest.
  assert.match(h, /class="trow"><div class="name">Timers<\/div><span class="chip accent"[^>]*><span class="dot"><\/span><span class="chip-text">4 running</);
  assert.match(h, /class="sub">1 paused</);
  assert.match(h, /class="big accent">.*<span>Tea<\/span>/s);
  assert.match(h, /Next: Pasta at 12:38 PM/);
  assert.match(h, /Ends at 12:32 PM/);
  assert.match(h, /Kitchen speaker/);
  assert.match(h, /data-end="\d+">3:15</);
  assert.match(h, /class="sweep"/);
  // The timer in large is not listed again: 5 timers and the counter.
  assert.equal((h.match(/class="row"/g) || []).length, 6);
  assert.match(h, /data-fmt="left">8:42 left</);
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
  assert.match(html(), /class="banner tm-finished/);
  assert.match(html(), /class="type-icon crit"/);
  assert.match(html(), /class="chip crit clickable"[^>]*>.*?Ringing</s);
  assert.match(html(), /class="sub">3 running · 1 paused</);
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
  // Said once, in the hero; the subtitle has no count to give.
  assert.equal((html().match(/No timer running/g) || []).length, 1);
  assert.match(html(), /data-action="quick"/);
  assert.match(html(), /class="chip idle"[^>]*>.*?Idle</s);
  assert.doesNotMatch(html(), /class="sub"/);
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
  assert.match(html(), /data-action="dismiss"[^>]*class|class="btn round[^"]*" data-action="dismiss"/);
  // The other timers' countdowns are live: ticked by data-end.
  assert.match(html(), /class="line">.*<span class="num" data-end="\d+">/s);
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
  assert.match(html(), /chip-text">4 en cours</);
  assert.match(html(), /class="sub">1 en pause</);
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

test("an active timer without its end (Alexa Media without remaining time) is neither ringing nor paused", async () => {
  const hass = makeHass();
  const id = "sensor.salon_prochain_minuteur";
  const timer = { id: "a1", status: "ON", remainingTime: "n/a", originalDurationInMillis: 45 * 6e4, timerLabel: "Bread" };
  hass.states[id] = { ...hass.states[id], attributes: { ...hass.states[id].attributes, sorted_active: [timer] } };
  for (const Card of [TimerCard, TimerMiniCard]) {
    const card = new Card();
    card.setConfig({ timers: [id] });
    card.hass = hass;
    const h = card.shadowRoot.innerHTML;
    assert.match(h, /Bread/);
    assert.doesNotMatch(h, /Paused|Ringing|Done/, Card.name);
  }
});

test("a paused timer at 0 shows 0:00; rows keep +1 min and cancel", async () => {
  const { card, html } = await mount();
  assert.match(html(), /class="row">[\s\S]*data-action="add"/);
  assert.match(html(), /class="row">[\s\S]*data-action="cancel"/);
  const it = { key: "k", kind: "timer", entity: "timer.x", name: "X", status: "paused", remaining: 0, total: 6e4 };
  assert.match(card._state(it), /0:00/);
});

test("illustrated header: its picture and icon colour follow the state, night by the sun or the option, ids per card", async () => {
  const paused = await mount({}, "paused");
  assert.match(paused.html(), /class="banner tm-paused"/);
  assert.match(paused.html(), /class="type-icon warn"/);
  assert.match(paused.html(), /class="tm-pause"/);
  const idle = await mount({}, "idle");
  assert.match(idle.html(), /class="banner tm-idle"/);
  assert.match(idle.html(), /class="type-icon idle"/);
  assert.doesNotMatch(idle.html(), /class="tm-(steam|glow)"/);
  // Night: the sun below the horizon, unless illustration_theme says otherwise.
  const night = await mount({}, "default", TimerCard, { sun: "below_horizon" });
  assert.match(night.html(), /class="banner tm-running night"/);
  const day = await mount({ illustration_theme: "day" }, "default", TimerCard, { sun: "below_horizon" });
  assert.match(day.html(), /class="banner tm-running"/);
  const forced = await mount({ illustration_theme: "night" });
  assert.match(forced.html(), /tm-running night/);
  // Each card has its own gradient ids.
  const ids = [paused, idle].map(({ html }) => html().match(/id="(tm-glow-\d+)"/)?.[1]);
  assert.ok(ids[0]);
  assert.match(night.html(), /url\(#tm-glow-\d+\)/);
  assert.notEqual(night.html().match(/id="(tm-glow-\d+)"/)[1], ids[0]);
  // The mini card has the banner too, with its detail button on it.
  const mini = await mount({}, "default", TimerMiniCard);
  assert.match(mini.html(), /class="banner tm-running"[\s\S]*class="zoom"/);
});

test("illustration: false keeps the classic header and its status chip", async () => {
  const { html } = await mount({ illustration: false });
  assert.doesNotMatch(html(), /class="banner/);
  assert.match(html(), /class="header"/);
  assert.match(html(), /chip accent[^>]*>.*4 running/s);
  const ringing = await mount({ illustration: false }, "ringing");
  assert.match(ringing.html(), /chip crit[^>]*>.*Ringing/s);
});
