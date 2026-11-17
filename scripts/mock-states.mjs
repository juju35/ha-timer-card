// Mock Home Assistant registries and states for the screenshots and the tests: four timer helpers (pasta running,
// laundry running, oven paused, eggs idle), the timers of a Google Home speaker (tea, running) and of an Echo
// (bread, running, from Alexa Media Player), and a counter helper. Entity ids are in French on purpose (the cards never
// rely on them); the names shown are neutral English ones. Every time is relative to NOW, a fixed instant, so that
// the captures never change. `mockData(variant)` returns everything a card needs for one capture.
export const NOW = Date.parse("2026-11-16T12:29:18Z");
const iso = (ms) => new Date(ms).toISOString();
const MIN = 6e4;
const hms = (ms) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

const base = () => {
  const states = {};
  const entities = {};
  const devices = {
    kitchen: { id: "kitchen", name: "Kitchen speaker", name_by_user: null },
    living: { id: "living", name: "Living room Echo", name_by_user: null },
  };
  const entity = (entity_id, state, attributes = {}, extra = {}) => {
    entities[entity_id] = { entity_id, device_id: extra.device_id ?? null, platform: extra.platform ?? domainOf(entity_id), translation_key: extra.translation_key ?? null };
    states[entity_id] = { entity_id, state: String(state), attributes, last_changed: iso(NOW - MIN), last_updated: iso(NOW - MIN) };
  };
  const domainOf = (id) => id.split(".")[0];
  const timer = (id, name, state, duration, left) =>
    entity(id, state, {
      friendly_name: name,
      duration: hms(duration),
      editable: true,
      ...(state === "active" ? { finishes_at: iso(NOW + left), remaining: hms(left) } : {}),
      ...(state === "paused" ? { remaining: hms(left) } : {}),
    });
  timer("timer.pates", "Pasta", "active", 12 * MIN, 8 * MIN + 42e3);
  timer("timer.lessive", "Laundry", "active", 80 * MIN, 47 * MIN + 10e3);
  timer("timer.four", "Oven", "paused", 20 * MIN, 12 * MIN);
  timer("timer.oeufs", "Eggs", "idle", 6 * MIN, 0);
  // Google Home (community integration): the timers of the kitchen speaker, in an attribute of its timers sensor.
  entity(
    "sensor.cuisine_minuteurs",
    iso(NOW + 3 * MIN + 15e3),
    {
      friendly_name: "Kitchen speaker Timers",
      next_timer_status: "set",
      timers: [{ timer_id: "timer/5b2e6a1e-1111-4c7e-9d6f-0123456789ab", fire_time: (NOW + 3 * MIN + 15e3) / 1000, local_time: "", local_time_iso: iso(NOW + 3 * MIN + 15e3), duration: "0:05:00", remaining: null, status: "set", label: "Tea" }],
    },
    { platform: "google_home", translation_key: "timers", device_id: "kitchen" },
  );
  // Alexa Media Player: the next timer of the Echo, its timers in `sorted_active` (time left when last processed).
  entity(
    "sensor.salon_prochain_minuteur",
    iso(NOW + 25 * MIN),
    {
      friendly_name: "Living room Echo Next timer",
      process_timestamp: iso(NOW - MIN),
      status: "ON",
      timer: "Bread",
      sorted_active: [{ id: "a1", status: "ON", remainingTime: 26 * MIN, originalDurationInMillis: 45 * MIN, timerLabel: "Bread" }],
    },
    { platform: "alexa_media", translation_key: "next_timer", device_id: "living" },
  );
  entity("counter.cafes", "3", { friendly_name: "Coffees today", initial: 0, step: 1, minimum: 0, maximum: 10 });
  return { states, entities, devices, areas: {}, api: {}, ws: {}, subs: {} };
};

// The variants of the captures:
//   default — as above
//   ringing — the Google Home tea timer rings (its end gone by)
//   idle    — nothing runs: every helper idle, no speaker timer
//   paused  — nothing runs, the pasta and the oven paused: every other helper idle, no speaker timer
export const mockData = (variant = "default") => {
  const d = base();
  if (variant === "ringing") {
    const g = d.states["sensor.cuisine_minuteurs"];
    g.attributes.timers[0] = { ...g.attributes.timers[0], status: "ringing", local_time_iso: iso(NOW - 20e3), fire_time: (NOW - 20e3) / 1000 };
    g.attributes.next_timer_status = "ringing";
  }
  if (variant === "idle" || variant === "paused") {
    for (const id of variant === "paused" ? ["timer.lessive"] : ["timer.pates", "timer.lessive", "timer.four"]) {
      const s = d.states[id];
      d.states[id] = { ...s, state: "idle", attributes: { friendly_name: s.attributes.friendly_name, duration: s.attributes.duration, editable: true } };
    }
    d.states["sensor.cuisine_minuteurs"] = { ...d.states["sensor.cuisine_minuteurs"], state: "unavailable", attributes: { friendly_name: "Kitchen speaker Timers", timers: [] } };
    d.states["sensor.salon_prochain_minuteur"] = { ...d.states["sensor.salon_prochain_minuteur"], state: "unknown", attributes: { friendly_name: "Living room Echo Next timer" } };
  }
  if (variant === "paused") {
    const p = d.states["timer.pates"];
    d.states["timer.pates"] = { ...p, state: "paused", attributes: { friendly_name: p.attributes.friendly_name, duration: p.attributes.duration, editable: true, remaining: "0:08:42" } };
  }
  return d;
};
