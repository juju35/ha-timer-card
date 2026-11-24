// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

export const TIMER_STYLE = `
  /* The kitchen timer of the hero: its face, the button on top and the live ring of the timer shown in large. */
  .kt { position: relative; width: 120px; height: 120px; flex: none; --c: var(--tm-idle); }
  .kt.accent { --c: var(--tm-accent); } .kt.crit { --c: var(--tm-crit); }
  .kt-body { position: absolute; inset: 0; }
  .kt-body .face { fill: color-mix(in srgb, var(--c) 10%, var(--ha-card-background, var(--card-background-color, #fff))); }
  .kt-body .top { fill: var(--c); }
  .kt-dial { position: absolute; left: 12px; top: 16px; width: 96px; height: 96px; }
  .kt-dial .ring-svg { width: 100%; height: 100%; }
  .kt-icon { position: absolute; left: 12px; top: 16px; width: 96px; height: 96px; display: grid; place-items: center; color: color-mix(in srgb, var(--c) 70%, var(--primary-text-color)); }
  .kt-icon .icon { width: 36px; height: 36px; }
  /* The seconds sweep: a dot runs round the dial while the timer runs. */
  .sweep { position: absolute; inset: 0; border-radius: 50%; animation: tm-sweep 3s linear infinite; pointer-events: none; }
  .sweep::before { content: ""; position: absolute; top: 0; left: 50%; width: 8px; height: 8px; margin-left: -4px; border-radius: 50%;
                   background: var(--c); box-shadow: 0 0 6px var(--c); }
  @keyframes tm-sweep { to { transform: rotate(360deg); } }
  .ringing .prog, .row-icon.ringing .prog { animation: tm-flash .8s steps(2, jump-none) infinite; }
  @keyframes tm-flash { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }
  .shake { animation: tm-shake .9s ease-in-out infinite; transform-origin: 50% 10%; }
  @keyframes tm-shake { 0%, 50%, 100% { transform: rotate(0); } 10%, 30% { transform: rotate(-14deg); } 20%, 40% { transform: rotate(14deg); } }
  .big b span { font-size: inherit; color: inherit; overflow: visible; }
  .big.idle b { color: var(--secondary-text-color); }
  .big b.done { font-size: 26px; }
  .acts { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 3px; }
  .row .acts { flex-wrap: nowrap; margin: 0; flex: none; }
  .quick { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  .quick .ql { font-size: 12px; color: var(--secondary-text-color); flex-basis: 100%; }
  .counter-val { font-size: 16px; font-weight: 500; min-width: 2.5ch; text-align: center; flex: none; }
  .none { display: flex; align-items: center; gap: 10px; color: var(--secondary-text-color); font-size: 14px; }
  .mini .kt { width: 72px; height: 72px; }
  .mini .kt-dial, .mini .kt-icon { left: 7px; top: 10px; width: 58px; height: 58px; }
  .mini .kt-icon .icon { width: 24px; height: 24px; }
  .mini .big b { font-size: 26px; }
  /* Narrow card: the timer above its texts, one button per row. */
  @container tm-card (max-width: 300px) {
    .hero { flex-direction: column; align-items: stretch; gap: 8px; }
    .hero .kt { align-self: center; }
    .row { gap: 8px; }
    .row .acts .btn:not(:first-child):not([data-action="add"]) { display: none; }
    .row .acts .btn span { display: none; }
    .row .acts .btn { width: 34px; height: 34px; padding: 0; border-radius: 50%; }
    .mini .kt { width: 60px; height: 60px; }
    .mini .kt-dial, .mini .kt-icon { left: 6px; top: 8px; width: 48px; height: 48px; }
  }
  @container tm-card (max-width: 200px) {
    .mini .kt { display: none; }
    .mini .big b { font-size: 22px; }
  }
`;
