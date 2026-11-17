// The README screenshots (PNG) and animations (GIF) rendered by scripts/screenshots.mjs.
// Every capture has a twin in the other theme ("-dark" for a light capture) that shows exactly the same state: only
// the theme differs (checked by test/screenshots.test.mjs). `variant` picks the mock data (scripts/mock-states.mjs).
const twins = (list) => list.flatMap((s) => [{ ...s, theme: "light" }, { ...s, file: `${s.file}-dark`, theme: "dark" }]);

export const shots = twins([
  { file: "card", type: "timer-card", width: 460, config: {} },
  { file: "card-start", type: "timer-card", width: 460, config: { show_counters: false }, clicks: ['[data-action="start"][data-key="timer.oeufs"]', '[data-action="dur_preset"][data-min="10"]'] },
  { file: "card-idle", type: "timer-card", width: 460, config: {}, variant: "idle" },
  { file: "mini-card", type: "timer-mini-card", width: 380, config: {} },
  { file: "mini-card-idle", type: "timer-mini-card", width: 380, config: {}, variant: "idle" },
  { file: "mini-card-paused", type: "timer-mini-card", width: 380, config: {}, variant: "paused" },
  { file: "mini-card-zoom", type: "timer-mini-card", width: 460, config: {}, clicks: [".zoom"] },
  // Narrow cards: the full card at 6 columns of a phone's Sections view and the mini card at its minimum width.
  { file: "card-narrow", type: "timer-card", width: 238, config: { show_counters: false } },
  { file: "mini-card-narrow", type: "timer-mini-card", width: 170, config: {} },
]);

// One looping GIF per distinct animated state:
//   running — the next timer to end: a dot sweeps round its dial; in the header, the pot steams and the timer's hand turns
//   ringing — a timer rings: its dial and ring flash, the bell shakes; in the header, the kitchen timer shakes and rings
export const gifs = twins([
  { file: "running", type: "timer-card", width: 460, config: { show_timers: false, show_counters: false, show_quick: false } },
  { file: "ringing", type: "timer-card", width: 460, config: { show_counters: false, show_quick: false }, variant: "ringing" },
]);
