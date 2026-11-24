// ---------------------------------------------------------------------------
// Durations and discovery
// ---------------------------------------------------------------------------
import { asList, domainOf, nameOf, stateIds } from "./helpers.js";

// A duration in ms from "H:MM:SS", "1 day, 2:00:00", "MM:SS" or a number of seconds; null otherwise.
export const parseDuration = (v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v * 1000;
  const s = String(v).trim();
  if (/^\d+(\.\d+)?$/.test(s)) return Number(s) * 1000;
  const m = /^(?:(\d+) days?,\s*)?(?:(\d+):)?(\d+):(\d+)(?:\.\d+)?$/.exec(s);
  if (!m) return null;
  return (((Number(m[1] || 0) * 24 + Number(m[2] || 0)) * 60 + Number(m[3])) * 60 + Number(m[4])) * 1000;
};

// "0:05:00": a number of minutes as the timer services take it.
export const durationText = (minutes) => {
  const total = Math.round(minutes * 60);
  return `${Math.floor(total / 3600)}:${String(Math.floor((total % 3600) / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

// Where timers come from: timer helpers, Google Home timers sensors, Alexa Media Player next-timer sensors and the
// "Next timer" sensors of Alexa Devices (core; their alarm and reminder sensors are left out).
export const sourceKind = (hass, id) => {
  const e = hass.entities?.[id];
  if (domainOf(id) === "timer") return "timer";
  if (e?.platform === "google_home" || /_timers$/.test(id)) return "google_home";
  if (e?.platform === "alexa_devices") return e.translation_key === "timer" ? "alexa_devices" : null;
  if (e?.platform === "alexa_media" || /_next_timer$/.test(id)) return "alexa_media";
  return null;
};

// The active timers of Alexa Media Player: a list of objects, or in older versions a JSON string, or a list of
// [id, timer] pairs.
export const alexaTimers = (raw) => {
  let list = raw;
  if (typeof list === "string") {
    try {
      list = JSON.parse(list);
    } catch {
      return [];
    }
  }
  return asList(list)
    .map((tm) => (Array.isArray(tm) ? tm[1] : tm))
    .filter((tm) => tm && typeof tm === "object");
};

// A timer of Alexa Devices whose end went by more than this long ago is a stale state, not a ringing timer.
export const STALE_MS = 6e4;

export const _cache = new WeakMap();

// The timer sources and the counters of the configuration, else every timer helper, Google Home timers sensor,
// Alexa next-timer sensor and counter helper.
export const resolve = (hass, config) => {
  let per = _cache.get(hass.entities);
  if (!per) _cache.set(hass.entities, (per = new Map()));
  const sig = `${JSON.stringify([config.timers, config.counters])}|${stateIds(hass.states).length}`;
  if (per.has(sig)) return per.get(sig);
  const byName = (a, b) => nameOf(hass, a).localeCompare(nameOf(hass, b));
  let timers;
  if (config.timers) {
    timers = asList(config.timers)
      .map((x) => (typeof x === "string" ? { entity: x } : x))
      .filter((x) => x?.entity && sourceKind(hass, x.entity))
      .map((x) => ({ ...x, kind: sourceKind(hass, x.entity) }));
  } else {
    const ids = stateIds(hass.states);
    const helpers = ids.filter((id) => domainOf(id) === "timer").sort(byName);
    const speakers = Object.values(hass.entities || {})
      .filter((e) => domainOf(e.entity_id) === "sensor" && hass.states[e.entity_id] && ((e.platform === "google_home" && (e.translation_key === "timers" || /_timers$/.test(e.entity_id))) || (e.platform === "alexa_media" && (e.translation_key === "next_timer" || /_next_timer$/.test(e.entity_id))) || (e.platform === "alexa_devices" && e.translation_key === "timer")))
      .map((e) => e.entity_id)
      .sort(byName);
    timers = [...helpers, ...speakers].map((entity) => ({ entity, kind: sourceKind(hass, entity) }));
  }
  const counters = config.counters
    ? asList(config.counters).map((x) => (typeof x === "string" ? { entity: x } : x)).filter((x) => x?.entity)
    : stateIds(hass.states)
        .filter((id) => domainOf(id) === "counter")
        .sort(byName)
        .map((entity) => ({ entity }));
  const out = { timers, counters };
  per.set(sig, out);
  return out;
};
