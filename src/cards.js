// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
import { PRESETS, QUICK } from "./core.js";
import { ICONS, asList, clamp, devName, esc, fmtCountdown, fmtTime, moreInfo, nameOf, num, parseTime, svgIcon, valid } from "./helpers.js";
import { BASE_STYLE, MINI_STYLE, ring } from "./styles.js";
import { CardBase, withMini } from "./card-base.js";
import { STALE_MS, alexaTimers, durationText, parseDuration, resolve } from "./durations-discovery.js";
import { TIMER_STYLE } from "./styles-2.js";
import { BANNER_STYLE, tmIsNight, tmSceneSvg } from "./illustrated-header.js";

export class TimerCard extends CardBase {
  static getConfigElement() {
    return document.createElement("timer-card-editor");
  }

  getCardSize() {
    return 6;
  }

  _build() {
    return resolve(this._hass, this._config);
  }

  _entityIds(m) {
    return [...m.timers.map((x) => x.entity), ...m.counters.map((x) => x.entity)];
  }

  _emptyKey(m) {
    return m.timers.length || m.counters.length ? null : "no_data";
  }

  // Every timer, running or not: { key, kind, entity, name, sub, status, end, remaining, total, timerId }.
  // Sorted: ringing, running (the next to end first), paused, idle.
  _items(m) {
    const now = Date.now();
    const out = [];
    for (const src of m.timers) {
      const s = this._s(src.entity);
      if (!s) continue;
      const a = s.attributes || {};
      const dev = devName(this._hass.devices?.[this._hass.entities?.[src.entity]?.device_id]);
      if (src.kind === "timer") {
        const total = parseDuration(a.duration);
        const item = { key: src.entity, kind: "timer", entity: src.entity, name: src.name || nameOf(this._hass, src.entity), sub: "", status: s.state, total };
        if (s.state === "active") item.end = parseTime(a.finishes_at) ?? now + (parseDuration(a.remaining) ?? 0);
        else if (s.state === "paused") item.remaining = parseDuration(a.remaining);
        // Unavailable (its integration reloading, a YAML helper removed): no start button that could only fail.
        else item.status = valid(s) ? "idle" : "unavailable";
        out.push(item);
      } else if (src.kind === "google_home") {
        for (const tm of asList(a.timers)) {
          const status = String(tm.status || "").toLowerCase();
          if (!["set", "ringing", "paused"].includes(status)) continue;
          out.push({
            key: `${src.entity}|${tm.timer_id}`,
            kind: "google_home",
            entity: src.entity,
            timerId: tm.timer_id,
            name: tm.label || src.name || this._t("timer"),
            sub: dev,
            status: status === "set" ? "active" : status,
            end: parseTime(tm.local_time_iso) ?? (tm.fire_time ? tm.fire_time * 1000 : null),
            remaining: parseDuration(tm.remaining),
            total: parseDuration(tm.duration),
          });
        }
      } else if (src.kind === "alexa_media") {
        const at = parseTime(a.process_timestamp) ?? parseTime(s.last_updated) ?? now;
        const list = alexaTimers(a.sorted_active);
        if (list.length) {
          list.forEach((tm, i) => {
            const st = String(tm.status || "ON").toUpperCase();
            const left = Number(tm.remainingTime);
            out.push({
              key: `${src.entity}|${tm.id ?? i}`,
              kind: "alexa_media",
              entity: src.entity,
              name: tm.timerLabel || src.name || this._t("timer"),
              sub: dev,
              status: st === "PAUSED" ? "paused" : "active",
              end: st === "PAUSED" || !Number.isFinite(left) ? null : at + left,
              remaining: st === "PAUSED" && Number.isFinite(left) ? left : null,
              total: Number(tm.originalDurationInMillis) || (Number.isFinite(left) ? left : null),
            });
          });
        } else if (parseTime(s.state) !== null && parseTime(s.state) > now) {
          out.push({ key: src.entity, kind: "alexa_media", entity: src.entity, name: a.timer || src.name || this._t("timer"), sub: dev, status: "active", end: parseTime(s.state), total: null });
        }
      } else if (src.kind === "alexa_devices") {
        // Alexa Devices: the state is the end of the next timer, without label, length or pause.
        const end = parseTime(s.state);
        if (end !== null && end > now - STALE_MS) {
          out.push({ key: src.entity, kind: "alexa_devices", entity: src.entity, name: src.name || dev || this._t("timer"), sub: src.name ? dev : "", status: "active", end, total: null });
        }
      }
    }
    // An end gone by: the timer rings (Google Home) or is about to report it is done.
    for (const it of out) if (it.status === "active" && it.end !== null && it.end !== undefined && it.end <= now && it.kind !== "timer") it.status = "ringing";
    const rank = { ringing: 0, active: 1, paused: 2, idle: 3, unavailable: 4 };
    return out.sort((x, y) => rank[x.status] - rank[y.status] || (x.end ?? Number.MAX_SAFE_INTEGER) - (y.end ?? Number.MAX_SAFE_INTEGER) || x.name.localeCompare(y.name));
  }

  // The timer helper the quick starts start: `quick_timer`, else the first idle one.
  _quickTarget(items) {
    const id = this._config.quick_timer;
    if (id) return items.find((it) => it.entity === id && it.kind === "timer") || null;
    return items.find((it) => it.kind === "timer" && it.status === "idle") || null;
  }

  _summary(m) {
    const items = this._items(m);
    const ringing = items.filter((it) => it.status === "ringing");
    const active = items.filter((it) => it.status === "active");
    const paused = items.filter((it) => it.status === "paused");
    let chip = null;
    if (ringing.length) chip = { cls: "crit", text: this._t("ringing"), entity: ringing[0].entity };
    else if (active.length) chip = { cls: "accent", text: active.length === 1 ? this._t("running_one") : this._t("running_n", { n: active.length }) };
    else if (paused.length) chip = { cls: "idle", text: this._t("paused") };
    const parts = [];
    if (active.length) parts.push(active.length === 1 ? this._t("running_one") : this._t("running_n", { n: active.length }));
    if (paused.length) parts.push(paused.length === 1 ? this._t("paused_one") : this._t("paused_n", { n: paused.length }));
    const sub = parts.join(" · ");
    const hero = ringing[0] || active[0] || paused[0] || null;
    return { items, ringing, active, paused, chip, sub, hero, quick: this._quickTarget(items) };
  }

  // A length in the card's language: "5 min", "1 h 30 min", "45 s".
  _length(ms) {
    const locale = this._locale();
    const u = (n, unit) => new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay: "short" }).format(n);
    const s = Math.round(ms / 1000);
    if (s < 60) return u(s, "second");
    const h = Math.floor(s / 3600);
    const m = Math.round((s % 3600) / 60);
    return h ? (m ? `${u(h, "hour")} ${u(m, "minute")}` : u(h, "hour")) : u(m, "minute");
  }

  _left(it) {
    if (it.status === "active" && it.end) return `<span class="num" data-end="${it.end}">${esc(fmtCountdown(it.end - Date.now()))}</span>`;
    if (it.status === "paused" && it.remaining !== null && it.remaining !== undefined) return `<span class="num">${esc(fmtCountdown(it.remaining))}</span>`;
    if (it.status === "ringing") return `<span>${esc(this._t("done"))}</span>`;
    return `<span class="num">${esc(it.total ? fmtCountdown(it.total) : "—")}</span>`;
  }

  _progress(it) {
    const left = it.status === "active" ? (it.end ? it.end - Date.now() : it.total) : it.status === "paused" ? it.remaining : it.status === "ringing" ? 0 : it.total;
    return it.total ? clamp((left ?? 0) / it.total, 0, 1) : it.status === "idle" || (it.status === "active" && !it.end) ? 1 : 0;
  }

  _cls(it) {
    return it.status === "ringing" ? "crit" : it.status === "active" ? "accent" : "idle";
  }

  _ring(it, size, w) {
    const live = it.status === "active" && it.end && it.total ? { end: it.end, total: it.total } : {};
    return ring(size, w, this._progress(it), live);
  }

  _icon(it) {
    return it.status === "ringing" ? ICONS.bell : it.kind === "timer" ? ICONS.timer : ICONS.speaker;
  }

  // The kitchen timer: its face, the live ring and the timer's icon (a bell that shakes when it rings).
  _kt(it, size) {
    const cls = this._cls(it);
    const w = size > 80 ? 8 : 6;
    return `<div class="kt ${cls} ${it.status} clickable" role="button" tabindex="0" data-entity="${esc(it.entity)}" aria-label="${esc(it.name)}">
      <svg class="kt-body" viewBox="0 0 120 120" aria-hidden="true"><rect class="top" x="53" y="3" width="14" height="9" rx="2"/><rect class="top" x="57" y="10" width="6" height="7"/>
<rect class="top" x="90" y="12" width="12" height="5" rx="2" transform="rotate(45 96 14)"/>
        <circle class="face" cx="60" cy="64" r="54"/></svg>
      <div class="kt-dial">${this._ring(it, 96, w)}${it.status === "active" ? this._sweep(w) : ""}</div>
      <div class="kt-icon">${svgIcon(this._icon(it), it.status === "ringing" ? "shake" : "")}</div>
    </div>`;
  }

  // The seconds hand: a dot that goes round once a minute, in step with the clock (its delay is the seconds already
  // gone), on an orbit inside the ring so that it never runs over the arc.
  _sweep(w) {
    const inset = (((w + 3) / 96) * 100).toFixed(2);
    const delay = ((Date.now() / 1000) % 60).toFixed(2);
    return `<div class="sweep" style="inset:${inset}%;animation-delay:-${delay}s" aria-hidden="true"></div>`;
  }

  _big(it) {
    const cls = this._cls(it);
    const v = it.status === "ringing" ? `<b class="done">${esc(this._t("done"))}</b>` : `<b>${this._left(it)}</b>`;
    return `<div class="big ${cls}">${svgIcon(it.status === "ringing" ? ICONS.bell : ICONS.timer)}${v}<span>${esc(it.name)}</span></div>`;
  }

  // A text button (pause, resume, start, +1 min, stop ringing) or a round one (cancel).
  _btn(it, action, icon, label, text, extra = "") {
    return `<button class="btn${extra}" data-action="${action}" data-key="${esc(it.key)}" title="${esc(label)}" aria-label="${esc(`${label} · ${it.name}`)}">${svgIcon(icon)}${text ? `<span>${esc(text)}</span>` : ""}</button>`;
  }

  // The buttons of a timer: pause / resume / +1 min / cancel for a helper, stop or delete for a Google Home timer.
  // In a row (`row`), +1 min is a round button, so that the state keeps its room.
  _actions(it, compact = false, row = false) {
    const out = [];
    if (it.kind === "timer") {
      if (it.status === "active") out.push(this._btn(it, "pause", ICONS.pause, this._t("pause"), this._t("pause")));
      if (it.status === "paused") out.push(this._btn(it, "resume", ICONS.play, this._t("resume"), this._t("resume"), " primary"));
      if (it.status === "idle") out.push(this._btn(it, "start", ICONS.play, this._t("start"), this._t("start")));
      if (it.status === "active" && !compact) out.push(this._btn(it, "add", ICONS.plus, this._t("add_minute"), row ? "" : this._length(6e4), row ? " round" : ""));
      if (it.status !== "idle" && !compact) out.push(this._btn(it, "cancel", ICONS.close, this._t("cancel_timer"), "", " round"));
    } else if (it.kind === "google_home") {
      const label = this._t(it.status === "ringing" ? "stop_ringing" : "delete");
      out.push(this._btn(it, "dismiss", it.status === "ringing" ? ICONS.stop : ICONS.close, label, label, it.status === "ringing" ? " active" : ""));
    }
    return out.join("");
  }

  _hero(sum) {
    const it = sum.hero;
    if (!it) {
      return `<div class="none">${svgIcon(ICONS.timer_off)}<span>${esc(this._t("none_running"))}</span></div>`;
    }
    const cls = this._cls(it);
    // An active timer whose end is not known (Alexa Media without its remaining time) says neither ringing nor paused.
    const ends =
      it.status === "active"
        ? it.end
          ? this._t("ends_at", { time: fmtTime(this._hass, this._config, it.end) })
          : ""
        : it.status === "paused"
          ? this._t("paused")
          : this._t("ringing");
    const endLine = [ends, it.sub].filter(Boolean).join(" · ");
    const next = sum.active.find((x) => x !== it && x.end);
    const lines = [
      endLine ? `<div class="line ${cls}">${svgIcon(it.status === "ringing" ? ICONS.bell : it.status === "paused" ? ICONS.pause : ICONS.bell_ring)}<span>${esc(endLine)}</span></div>` : "",
      it.total ? `<div class="line">${svgIcon(ICONS.timer)}<span>${esc(this._t("of", { length: this._length(it.total) }))}</span></div>` : "",
      next ? `<div class="line">${svgIcon(ICONS.sand)}<span>${esc(this._t("next_timer", { name: next.name, time: fmtTime(this._hass, this._config, next.end) }))}</span></div>` : "",
    ];
    const acts = this._actions(it);
    return `<div class="hero ${it.status}">
      ${this._kt(it, 120)}
      <div class="hero-body">${this._big(it)}${lines.join("")}${acts ? `<div class="acts">${acts}</div>` : ""}</div>
    </div>`;
  }

  // "8:42 left · ends at 12:38 PM", "Paused · 12:00 left", "6 min", "Ringing".
  _state(it) {
    const left = (ms) => `<span class="num">${esc(this._t("left", { time: fmtCountdown(ms) }))}</span>`;
    let parts;
    if (it.status === "active" && it.end) parts = [`<span class="num" data-end="${it.end}" data-fmt="left">${esc(this._t("left", { time: fmtCountdown(it.end - Date.now()) }))}</span>`, esc(this._t("ends_at", { time: fmtTime(this._hass, this._config, it.end) }))];
    else if (it.status === "paused") parts = [esc(this._t("paused")), it.remaining !== null && it.remaining !== undefined ? left(it.remaining) : ""];
    else if (it.status === "ringing") parts = [esc(this._t("ringing"))];
    else if (it.status === "unavailable") parts = [esc(this._t("unavailable"))];
    else parts = [it.total ? esc(this._length(it.total)) : ""];
    return [...parts, it.sub ? esc(it.sub) : ""].filter(Boolean).join(" · ");
  }

  _row(it) {
    const cls = this._cls(it);
    const badge = it.status === "paused" ? `<span class="badge" style="--b: var(--tm-idle)">${svgIcon(ICONS.pause)}</span>` : "";
    const ringed = it.status === "active" || it.status === "ringing";
    const acts = this._actions(it, false, true);
    return `<div class="row">
      <div class="row-icon ${cls} ${it.status}">${ringed ? this._ring(it, 40, 3) : ""}${svgIcon(this._icon(it), it.status === "ringing" ? "shake" : "")}${badge}</div>
      <div class="row-text clickable" role="button" tabindex="0" data-entity="${esc(it.entity)}"><div class="row-name">${esc(it.name)}</div><div class="row-state ${cls}">${this._state(it)}</div></div>
      ${acts ? `<div class="acts">${acts}</div>` : ""}
    </div>`;
  }

  _quick(sum) {
    const q = sum.quick;
    if (!q || this._config.show_quick === false) return "";
    const chips = QUICK.map((n) => `<button class="btn" data-action="quick" data-key="${esc(q.key)}" data-min="${n}">${svgIcon(ICONS.play)}<span>${esc(this._length(n * 6e4))}</span></button>`).join("");
    return `<div class="quick"><span class="ql">${esc(this._t("quick_start", { name: q.name }))}</span>${chips}<button class="btn" data-action="start" data-key="${esc(q.key)}">${svgIcon(ICONS.plus)}<span>${esc(this._t("other"))}</span></button></div>`;
  }

  _counterRow(c) {
    const s = this._s(c.entity);
    if (!s) return "";
    const v = num(s);
    const a = s.attributes || {};
    const step = Number(a.step) || 1;
    const name = c.name || nameOf(this._hass, c.entity);
    const off = !valid(s);
    const lo = off || (a.minimum !== null && a.minimum !== undefined && v !== null && v - step < Number(a.minimum));
    const hi = off || (a.maximum !== null && a.maximum !== undefined && v !== null && v + step > Number(a.maximum));
    return `<div class="row">
      <div class="row-icon idle">${svgIcon(ICONS.counter)}</div>
      <div class="row-text clickable" role="button" tabindex="0" data-entity="${esc(c.entity)}"><div class="row-name">${esc(name)}</div>${a.minimum !== undefined || a.maximum !== undefined ? `<div class="row-state">${esc([a.minimum, a.maximum].map((x) => x ?? "∞").join(" – "))}</div>` : ""}</div>
      <button class="btn round" data-action="dec" data-entity="${esc(c.entity)}" title="${esc(this._t("decrement"))}" aria-label="${esc(`${this._t("decrement")} · ${name}`)}"${lo ? " disabled" : ""}>${svgIcon(ICONS.minus)}</button>
      <span class="counter-val num">${esc(v ?? "—")}</span>
      <button class="btn round" data-action="inc" data-entity="${esc(c.entity)}" title="${esc(this._t("increment"))}" aria-label="${esc(`${this._t("increment")} · ${name}`)}"${hi ? " disabled" : ""}>${svgIcon(ICONS.plus)}</button>
    </div>`;
  }

  // The header: the illustrated banner (its picture and icon colour follow the timers' state), or the classic header
  // (`illustration: false`). Both have the same status pill on the title row, in the icon's colour.
  _head(sum, sub) {
    const st = sum.ringing.length ? "crit" : sum.active.length ? "accent" : sum.paused.length ? "warn" : "idle";
    const icon = sum.ringing.length ? ICONS.bell : ICONS.timer;
    const title = this._config.title || this._t("timers");
    // The status pill (in the icon's colour) says the first state; the subtitle keeps the other counts.
    const n = (k1, kn, len) => (len === 1 ? this._t(k1) : this._t(kn, { n: len }));
    const running = sum.active.length ? n("running_one", "running_n", sum.active.length) : "";
    const paused = sum.paused.length ? n("paused_one", "paused_n", sum.paused.length) : "";
    const label = sum.ringing.length ? this._t("ringing") : running || paused || this._t("idle");
    const text = (sum.ringing.length ? [running, paused] : running ? [paused] : []).filter(Boolean).join(" · ");
    const entity = sum.chip?.entity;
    const pill = `<span class="chip ${st}${entity ? " clickable" : ""}"${moreInfo(entity)} title="${esc(label)}" aria-label="${esc(label)}"><span class="dot"></span><span class="chip-text">${esc(label)}</span></span>`;
    const head = `<div class="type-icon ${st}">${svgIcon(icon)}</div><div class="titles"><div class="trow"><div class="name">${esc(title)}</div>${pill}</div>${sub && text ? `<div class="sub" title="${esc(text)}">${esc(text)}</div>` : ""}</div>`;
    if (this._config.illustration === false) return `<div class="header">${head}${this._zoomButton()}</div>`;
    const scene = sum.ringing.length ? "finished" : sum.active.length ? "running" : sum.paused.length ? "paused" : "idle";
    const night = tmIsNight(this._hass, this._config) ? " night" : "";
    return `<div class="banner tm-${scene}${night}">${tmSceneSvg(scene, this._uid)}<div class="ground"></div>
      <div class="htext">${head}</div>
      ${this._zoomButton()}</div>`;
  }

  // The banner's styles, only when it is shown.
  _bannerStyle() {
    return this._config.illustration === false ? "" : BANNER_STYLE;
  }

  _render() {
    const { m, error } = this._ready();
    if (error) return error;
    const c = this._config;
    const sum = this._summary(m);
    const parts = [];
    if (c.show_hero !== false && m.timers.length) parts.push(this._hero(sum));
    // The timer shown in large is not listed again.
    const rows = sum.items.filter((it) => !(c.show_hero !== false && it === sum.hero));
    if (c.show_timers !== false && rows.length) {
      parts.push(this._section("timers", ICONS.timer, this._t("timers"), rows.length, `<div class="rows">${rows.map((it) => this._row(it)).join("")}</div>`));
    }
    parts.push(this._quick(sum));
    if (c.show_counters !== false && m.counters.length) {
      parts.push(this._section("counters", ICONS.counter, this._t("counters"), m.counters.length, `<div class="rows">${m.counters.map((x) => this._counterRow(x)).join("")}</div>`));
    }
    return `<style>${BASE_STYLE}${TIMER_STYLE}${this._bannerStyle()}</style>
      <ha-card>
        ${this._head(sum, sum.sub)}
        <div class="content">${parts.filter(Boolean).join("")}</div>
      </ha-card>`;
  }

  _item(key) {
    return this._summary(this._resolve()).items.find((it) => it.key === key);
  }

  _action(action, el) {
    const key = el.dataset.key;
    if (action === "inc" || action === "dec") {
      this._call("counter", action === "inc" ? "increment" : "decrement", { entity_id: el.dataset.entity });
      return true;
    }
    const it = key ? this._item(key) : null;
    if (!it) return false;
    if (action === "pause") this._call("timer", "pause", { entity_id: it.entity });
    else if (action === "resume") this._call("timer", "start", { entity_id: it.entity });
    else if (action === "cancel") this._call("timer", "cancel", { entity_id: it.entity });
    else if (action === "add") this._call("timer", "change", { entity_id: it.entity, duration: "0:01:00" });
    else if (action === "quick") this._call("timer", "start", { entity_id: it.entity, duration: durationText(Number(el.dataset.min)) });
    else if (action === "dismiss") this._call("google_home", "delete_timer", { entity_id: it.entity, timer_id: it.timerId });
    else if (action === "start") {
      const minutes = it.total ? Math.max(1, Math.round(it.total / 6e4)) : 5;
      this._openDialog({ key: it.key, entity: it.entity, name: it.name, minutes });
    } else return false;
    return true;
  }

  _dialogAction(action, el) {
    const d = this._dialog;
    if (action === "dur_minus" || action === "dur_plus") {
      const step = d.minutes > 30 || (d.minutes === 30 && action === "dur_plus") ? 5 : 1;
      d.minutes = clamp(d.minutes + (action === "dur_plus" ? step : -step), 1, 24 * 60);
      this._update();
    } else if (action === "dur_preset") {
      d.minutes = Number(el.dataset.min);
      this._update();
    } else if (action === "dialog_ok") {
      this._closeDialog();
      this._call("timer", "start", { entity_id: d.entity, duration: durationText(d.minutes) });
    }
  }

  // "25 min" in the card's language, its unit small ("25 мин", "25 λεπ."): the number and the unit apart.
  _minutes(n) {
    let parts;
    try {
      parts = new Intl.NumberFormat(this._locale(), { style: "unit", unit: "minute", unitDisplay: "short" }).formatToParts(n);
    } catch {
      parts = [{ type: "integer", value: String(n) }, { type: "literal", value: " " }, { type: "unit", value: "min" }];
    }
    const value = parts.filter((p) => p.type !== "unit" && p.type !== "literal").map((p) => p.value).join("");
    const unit = parts.filter((p) => p.type === "unit").map((p) => p.value).join("");
    return `${esc(value)}${unit ? `<small>${esc(unit)}</small>` : ""}`;
  }

  _dialogHtml() {
    const d = this._dialog;
    const presets = PRESETS.map((n) => `<button class="preset${n === d.minutes ? " on" : ""}" data-action="dur_preset" data-min="${n}" aria-pressed="${n === d.minutes}">${esc(this._length(n * 6e4))}</button>`).join("");
    const body = `<div class="stepper" role="group" aria-label="${esc(this._t("duration"))}">
          <button class="btn round" data-action="dur_minus" aria-label="${esc(this._t("less"))}" title="${esc(this._t("less"))}"${d.minutes <= 1 ? " disabled" : ""}>${svgIcon(ICONS.minus)}</button>
          <div class="val num" aria-live="polite">${this._minutes(d.minutes)}</div>
          <button class="btn round" data-action="dur_plus" aria-label="${esc(this._t("more"))}" title="${esc(this._t("more"))}">${svgIcon(ICONS.plus)}</button>
        </div>
        <div class="presets">${presets}</div>`;
    return this._modal(this._t("start_timer", { name: d.name }), body, this._t("start"), ICONS.play);
  }
}

export class TimerMiniCard extends withMini(TimerCard) {
  static getConfigElement() {
    return document.createElement("timer-mini-card-editor");
  }

  _renderMini() {
    const { m, error } = this._ready();
    if (error) return error;
    const sum = this._summary(m);
    const it = sum.hero;
    const others = sum.items.filter((x) => x !== it && x.status !== "idle" && x.status !== "unavailable");
    // The other timers, their countdowns live (data-end, ticked by _syncCountdown).
    const short = (x) => {
      if (x.status === "active" && x.end) return `<span class="num" data-end="${x.end}">${esc(fmtCountdown(x.end - Date.now()))}</span>`;
      if (x.status === "paused") return `<span class="num">${esc(fmtCountdown(x.remaining ?? x.total ?? 0))}</span> ${esc(this._t("paused").toLowerCase())}`;
      if (x.status === "ringing") return esc(this._t("ringing"));
      return `<span class="num">${esc(x.total ? fmtCountdown(x.total) : "—")}</span>`;
    };
    const rest = others.length
      ? `<div class="line">${svgIcon(ICONS.sand)}<span>${others
          .slice(0, 2)
          .map((x) => `${esc(x.name)} ${short(x)}`)
          .join(" · ")}</span></div>`
      : "";
    const q = sum.quick;
    let controls = "";
    if (it?.kind === "timer" && it.status === "active") controls = this._btn(it, "pause", ICONS.pause, this._t("pause"), "", " round");
    else if (it?.kind === "timer" && it.status === "paused") controls = this._btn(it, "resume", ICONS.play, this._t("resume"), "", " round primary");
    else if (it?.kind === "google_home") {
      const label = this._t(it.status === "ringing" ? "stop_ringing" : "delete");
      controls = this._btn(it, "dismiss", it.status === "ringing" ? ICONS.stop : ICONS.close, label, "", it.status === "ringing" ? " round active" : " round");
    } else if (!it && q && this._config.show_quick !== false) {
      controls = `<button class="btn round primary" data-action="start" data-key="${esc(q.key)}" title="${esc(this._t("start_timer", { name: q.name }))}" aria-label="${esc(this._t("start_timer", { name: q.name }))}">${svgIcon(ICONS.play)}</button>`;
    }
    const body = it ? `${this._big(it)}${rest}` : `<div class="line">${svgIcon(ICONS.timer_off)}<span>${esc(this._t("none_running"))}</span></div>`;
    return `<style>${BASE_STYLE}${TIMER_STYLE}${MINI_STYLE}${this._bannerStyle()}</style>
      <ha-card>
        ${this._head(sum, this._config.illustration === false ? "" : sum.sub)}
        <div class="content mini">
          ${it ? this._kt(it, 72) : ""}
          <div class="info">${body}</div>
          ${controls ? `<div class="controls">${controls}</div>` : ""}
        </div>
      </ha-card>`;
  }
}
