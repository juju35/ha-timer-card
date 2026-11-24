// ---------------------------------------------------------------------------
// Illustrated header
// ---------------------------------------------------------------------------

// The banner's picture, at the right of a 200 × 80 view box drawn at the banner's height above its ground strip: a
// tiled kitchen wall, the worktop, a hob with a pot and a kitchen timer. Its state follows the timers: running (the
// hob glows, the pot steams, the timer's hand turns), paused (the hand stops, a pause badge, a faint wisp), finished
// (a timer rings: it shakes and rings out, the pot boils) and idle (all still, the hob off). `uid` keeps the ids of
// each card's gradients apart on a page with several cards.
export const tmSceneSvg = (state, uid) => {
  const on = state !== "idle";
  const joints = [
    ...Array.from({ length: 21 }, (_, i) => `<line x1="${i * 10}" y1="0" x2="${i * 10}" y2="56"/>`),
    ...[14, 28, 42].map((y) => `<line x1="0" y1="${y}" x2="200" y2="${y}"/>`),
  ].join("");
  const wisp = (x, d = 0) => `<path style="animation-delay:${d}s" d="M${x} -28q-3 -5 0 -9q3 -4 0 -8"/>`;
  const steam = state === "running" ? wisp(-6) + wisp(6, 0.75) : state === "finished" ? wisp(-9) + wisp(0, 0.5) + wisp(9, 1) : state === "paused" ? wisp(0) : "";
  // The timer's hand: at 12 when idle or done, stopped where it was when paused, turning while it runs.
  const angle = state === "paused" ? 130 : 0;
  const ticks = [0, 90, 180, 270].map((a) => `<line class="tm-tick" x1="0" y1="-19" x2="0" y2="-17.6" transform="rotate(${a} 0 -12)"/>`).join("");
  return `<svg class="tm-scene" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
    <defs><radialGradient id="tm-glow-${uid}"><stop offset="0" stop-color="#ff7a3c" stop-opacity=".75"/><stop offset="1" stop-color="#ff7a3c" stop-opacity="0"/></radialGradient></defs>
    <g class="tm-joints">${joints}</g>
    <rect class="tm-top" x="0" y="56" width="200" height="24"/>
    <rect class="tm-edge" x="0" y="56" width="200" height="1.4"/>
    <rect class="tm-hob" x="60" y="52" width="120" height="4" rx="1"/>
    <rect class="tm-knob" x="66" y="53.2" width="5" height="1.6" rx=".8"/><rect class="tm-knob" x="74" y="53.2" width="5" height="1.6" rx=".8"/>
    ${on ? `<ellipse class="tm-glow" cx="100" cy="51" rx="26" ry="7" fill="url(#tm-glow-${uid})"/><rect class="tm-heat" x="83" y="52.4" width="34" height="1.2" rx=".6"/>` : ""}
    <g transform="translate(100 52)">
      <rect class="tm-handle" x="-22" y="-15" width="5" height="2.4" rx="1.2"/><rect class="tm-handle" x="17" y="-15" width="5" height="2.4" rx="1.2"/>
      <rect class="tm-pot" x="-16" y="-18" width="32" height="18" rx="3"/>
      <rect class="tm-lid" x="-19" y="-20" width="38" height="4" rx="2"/>
      <rect class="tm-lidknob" x="-3" y="-24" width="6" height="4" rx="1.5"/>
      ${steam ? `<g class="tm-steam">${steam}</g>` : ""}
    </g>
    <g class="tm-kt">
      <g transform="translate(160 52)">
        ${state === "finished" ? '<g class="tm-rings"><path d="M-15 -19a10 10 0 0 0 0 14"/><path d="M-19 -22a15 15 0 0 0 0 20"/><path d="M15 -19a10 10 0 0 1 0 14"/><path d="M19 -22a15 15 0 0 1 0 20"/></g>' : ""}
        <rect class="tm-ktknob" x="-2.5" y="-27" width="5" height="4.4" rx="1"/>
        <circle class="tm-ktbody" cy="-12" r="11"/>
        <circle class="tm-ktface" cy="-12" r="8"/>
        ${ticks}
        <g class="tm-hand"><g transform="rotate(${angle} 0 -12)"><line x1="0" y1="-12" x2="0" y2="-18.2"/></g></g>
        <circle class="tm-pin" cy="-12" r="1.1"/>
        ${state === "paused" ? '<g class="tm-pause" transform="translate(9 -21)"><circle r="4.2"/><rect x="-1.9" y="-2" width="1.3" height="4" rx=".4"/><rect x=".6" y="-2" width="1.3" height="4" rx=".4"/></g>' : ""}
      </g>
    </g>
  </svg>`;
};

// Night picture: forced by illustration_theme, else Home Assistant's dark theme alone (a light theme keeps the day
// picture after sunset).
export const tmIsNight = (hass, config) => {
  const theme = config?.illustration_theme;
  if (theme === "night") return true;
  if (theme === "day") return false;
  return !!hass?.themes?.darkMode;
};

// The banner, 90 px high on the full and the mini card: the kitchen's wall colour behind the title, the picture at the
// right, a 10 px tiled floor strip edge to edge at the bottom. The round icon's colour is the timers' state: running
// (the card's accent), paused (amber), ringing (red), idle (grey), day and night.
export const BANNER_STYLE = `
  .banner { position: relative; overflow: hidden; height: 90px; --g: 10px; --scene-w: min(200px, 54%);
            background: #eef3f4; color: #0d2a45; --sky-muted: #3b5b78; }
  .banner.night { background: #283040; color: #fff; --sky-muted: rgba(255,255,255,.78); }
  .tm-scene { position: absolute; right: 0; bottom: var(--g); height: calc(100% - var(--g)); width: var(--scene-w);
              -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 14%); mask-image: linear-gradient(90deg, transparent 0, #000 14%); }
  .ground { position: absolute; left: 0; right: 0; bottom: 0; height: var(--g);
            background: repeating-linear-gradient(90deg, #d9dfe3 0 18px, #c6cdd2 18px 19px); box-shadow: inset 0 2px 0 #b8c0c6; }
  .night .ground { background: repeating-linear-gradient(90deg, #3a4250 0 18px, #2e3542 18px 19px); box-shadow: inset 0 2px 0 #4a5466; }
  .htext { position: absolute; z-index: 1; left: 0; top: 0; bottom: var(--g); right: max(0px, calc(var(--scene-w) - 60px)); display: flex; align-items: center; gap: 10px;
           padding: 8px 8px 8px 14px; min-width: 0; box-sizing: border-box; }
  .htext .titles { flex: 1 1 auto; min-width: 0; }
  .htext .name { font-size: 16px; font-weight: 500; }
  .htext .sub { font-size: 13px; color: var(--sky-muted); }
  .banner .type-icon { background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 24%, transparent); }
  .banner .type-icon .icon { fill: var(--c); }
  .banner .type-icon.idle .icon { fill: color-mix(in srgb, var(--tm-idle) 80%, #0d2a45); }
  .banner.night .type-icon { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .banner.night .type-icon .icon { fill: color-mix(in srgb, var(--c) 78%, #fff); }
  .banner.night .type-icon.idle .icon { fill: color-mix(in srgb, var(--tm-idle) 80%, #fff); }
  /* The mini card's detail button: a frosted round button in the banner's top-right corner. */
  .banner .zoom { all: unset; position: absolute; z-index: 2; top: 5px; right: 5px; margin: 0; cursor: pointer; width: 24px; height: 24px;
                  border-radius: 50%; display: grid; place-items: center; box-sizing: border-box; color: #33506b; background: rgba(255,255,255,.55);
                  box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
  .banner .zoom .icon { width: 16px; height: 16px; }
  .banner .zoom:hover { background: rgba(255,255,255,.75); color: #33506b; }
  .banner.night .zoom { color: #ffffff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner.night .zoom:hover { background: rgba(255,255,255,.22); color: #ffffff; }
  .banner .zoom:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .htext .titles { align-self: stretch; justify-content: center; }
  /* The status pill on the banner: the status colour on frosted glass. */
  .banner .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px;
                  font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; box-sizing: border-box;
                  background: color-mix(in srgb, var(--c, var(--tm-accent)) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c, var(--tm-accent)) 45%, #0d2a45); }
  .banner.night .chip { background: color-mix(in srgb, var(--c, var(--tm-accent)) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c, var(--tm-accent)) 35%, #ffffff); }
  .banner .chip .dot { width: 7px; height: 7px; border-radius: 50%; flex: none; background: var(--c, var(--tm-accent)); }
  /* The picture: the wall's joints, the worktop, the hob, the pot and the kitchen timer. */
  .tm-joints line { stroke: #dfe7ea; stroke-width: .6; } .night .tm-joints line { stroke: #343d4f; }
  .tm-top { fill: #fff; } .night .tm-top { fill: #323b4e; }
  .tm-edge { fill: #dfe5e9; } .night .tm-edge { fill: #3c465a; }
  .tm-hob { fill: #2a3038; } .tm-knob { fill: #59636f; }
  .tm-heat { fill: #ff5a36; } .tm-glow { animation: tm-glow 3s ease-in-out infinite; }
  .tm-paused .tm-heat { fill: #c9653e; } .tm-paused .tm-glow { opacity: .45; animation: none; }
  .tm-pot { fill: #9aa3ae; } .tm-lid { fill: #7d8793; } .tm-lidknob, .tm-handle { fill: #5f6b7a; }
  .night .tm-pot { fill: #8a94a0; } .night .tm-lid { fill: #6f7985; }
  .tm-steam path { fill: none; stroke: #c9d2da; stroke-width: 1.4; stroke-linecap: round; animation: tm-steam 1.5s ease-out infinite; }
  .night .tm-steam path { stroke: #7d8793; }
  .tm-paused .tm-steam path { opacity: .45; animation: none; }
  .tm-finished .tm-steam path { animation-duration: 1s; }
  .tm-ktbody { fill: #f5b400; } .tm-ktknob { fill: #d68f00; } .tm-ktface { fill: #fff; }
  .night .tm-ktbody { fill: #e0a400; } .night .tm-ktface { fill: #f4f1e6; }
  .tm-tick { stroke: #9aa3ae; stroke-width: .8; }
  .tm-hand line { stroke: #e5484d; stroke-width: 1.4; stroke-linecap: round; } .tm-pin { fill: #e5484d; }
  .tm-hand { transform-box: view-box; transform-origin: 160px 40px; }
  .tm-running .tm-hand { animation: tm-turn 3s linear infinite; }
  .tm-pause circle { fill: var(--tm-warn); } .tm-pause rect { fill: #fff; }
  .tm-kt { transform-box: view-box; transform-origin: 160px 52px; }
  .tm-finished .tm-kt { animation: tm-shake .5s ease-in-out infinite; }
  .tm-rings path { fill: none; stroke: var(--tm-crit); stroke-width: 1.3; stroke-linecap: round; animation: tm-ring 1s ease-out infinite; }
  .tm-rings path:nth-child(2n) { animation-delay: .25s; }
  @keyframes tm-turn { to { transform: rotate(360deg); } }
  @keyframes tm-steam { from { opacity: .9; transform: translateY(0); } to { opacity: 0; transform: translateY(-6px); } }
  @keyframes tm-glow { 0%, 100% { opacity: .75; } 50% { opacity: 1; } }
  @keyframes tm-shake { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-9deg); } 75% { transform: rotate(9deg); } }
  @keyframes tm-ring { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) {
    .tm-hand, .tm-kt, .tm-steam path, .tm-glow, .tm-rings path { animation: none !important; }
  }
  .banner ~ .content { padding-top: 12px; }
  /* Narrow card: no room for the picture beside the title, the wall alone stays. */
  @container tm-card (max-width: 280px) { .tm-scene { display: none; } .banner { --scene-w: 0px; } .banner .htext { padding-right: 36px; } }
`;
