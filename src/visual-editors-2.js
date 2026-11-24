// ---------------------------------------------------------------------------
// Visual editors
// ---------------------------------------------------------------------------
import { VERSION } from "./core.js";
import { asList, t } from "./helpers.js";
import { EditorBase } from "./visual-editors.js";
import { register } from "./register.js";
import { TimerCard, TimerMiniCard } from "./cards.js";

export class TimerCardEditor extends EditorBase {
  static get toggles() {
    return [
      ["illustration", true],
      ["show_title", true],
      ["show_subtitle", true],
      ["show_hero", true],
      ["show_timers", true],
      ["show_quick", true],
      ["show_counters", true],
    ];
  }

  static get sections() {
    return ["timers", "counters"];
  }

  static get defaults() {
    return { illustration_theme: "auto" };
  }

  _fields() {
    const tr = (k) => t(this._hass, this._config, k);
    // `timers` / `counters` written in YAML with objects ({ entity, name }) stay YAML-only: an entity picker would
    // show them empty and drop their names on the first change.
    const plain = (k) => asList(this._config?.[k]).every((x) => typeof x === "string");
    return [
      ...(plain("timers") ? [{ name: "timers", selector: { entity: { multiple: true, domain: ["timer", "sensor"] } } }] : []),
      ...(plain("counters") ? [{ name: "counters", selector: { entity: { multiple: true, domain: "counter" } } }] : []),
      { name: "quick_timer", selector: { entity: { domain: "timer" } } },
      { name: "illustration_theme", selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((v) => ({ value: v, label: tr(`theme_${v}`) })) } } },
    ];
  }
}

// The mini card's detail view is the full card: its editor offers the full card's options, plus the detail button.
export class TimerMiniCardEditor extends TimerCardEditor {
  static get toggles() {
    return [...TimerCardEditor.toggles, ["zoom", true]];
  }
}

register(
  [
    ["timer-card", TimerCard, { name: "Timer Card", description: "Timers with live countdown rings (timer helpers, Google Home, Alexa), quick starts and counters." }],
    ["timer-mini-card", TimerMiniCard, { name: "Timer Mini Card", description: "Compact timers: the next to end in a ring, the running ones and a pause or start button." }],
    ["timer-card-editor", TimerCardEditor],
    ["timer-mini-card-editor", TimerMiniCardEditor],
  ],
  "https://github.com/juju35/ha-timer-card",
);

console.info(`%c TIMER-CARD %c v${VERSION} `, "color: white; background: #fb8c00; font-weight: 700;", "color: #fb8c00; background: white; font-weight: 700;");
