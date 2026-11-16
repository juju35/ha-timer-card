# Changelog

## 1.0.0 - 2026-11-16

First release.

### Features
- **Timer Card** (`custom:timer-card`): the next timer to end in a large dial (time left, length, end time, speaker), every timer with its ring and live countdown, quick starts and counters; collapsible sections.
- **Timer Mini Card** (`custom:timer-mini-card`): compact view with the next timer's ring, the running timers and a pause, dismiss or start button; the detail button switches to the full card.
- Timer helpers (start with a duration popup, pause, resume, add a minute, cancel), Google Home timers (Google Home community integration, dismissed with `google_home.delete_timer`) and Alexa timers (Alexa Media Player), found through the entity registry; counter helpers with − and +.
- Animations while the next timer runs (a dot sweeps round its dial) and while a speaker timer rings (dial and ring flashing, bell shaking).
- Visual editor for both cards; light and dark themes; 22 languages, English in the bundle and every other language in its own file loaded on demand.
