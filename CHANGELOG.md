# Changelog

## 1.2.2 - 2026-11-20

### Fixes
- An unavailable timer helper reads "Unavailable", with no start button (a start could only fail), is listed last and is never the quick-start target; the mini card no longer lists it among the other timers.
- Duration popup: the minute unit is written in the card's language ("мин.", "λεπ.") instead of a fixed "min".
- Visual editor: `timers` / `counters` written in YAML as objects (`entity` + `name`) are no longer shown in an entity picker that would drop their names on the next change; the field is hidden (YAML only) and comes back for plain entity lists.

### Performance
- The entity ids are listed once per state update and shared by every card and call, instead of a full scan of the states each time.

### Maintenance
- CI: npm downloads cached (validate, release, screenshots); the screenshots job no longer installs the unused `gh` package.

## 1.2.1 - 2026-11-18

### Fixes
- Illustrated header: `auto` now follows the Home Assistant theme alone — a light theme keeps the day picture after sunset, a dark theme still shows the night one.

## 1.2.0 - 2026-11-17

### Features
- Illustrated header, 90 px high on the full and the mini card: a kitchen scene beside the title (tiled wall, worktop, a pot on the hob and a kitchen timer) with a tiled floor strip, that follows the timers' state: running (the hob glows, the pot steams, the timer's hand turns), paused (the hand stops, a pause badge), finished (a speaker timer rings: the kitchen timer shakes and rings out) and idle (all still).
- The header icon's colour is the state: orange running, amber paused, red ringing, grey idle, day and night.
- Day and night pictures: night when `sun.sun` is below the horizon or with the dark theme, forced with `illustration_theme: day | night`; `illustration: false` keeps the classic header with its status chip. Both options are in the visual editors.
- Mini card: the subtitle (how many timers run, are paused or ring) shows in the illustrated header.
- The status pill is back in the illustrated header, on the title row right after the title, in the icon's colour (Ringing, N running, N paused, Idle); the subtitle keeps the other counts. It stays there only when the whole title and its whole label fit (measured, in every language); otherwise it takes its own line under the subtitle (then kept to one line), and only its dot when even that does not fit in the banner above the floor or beside the picture, or on a card 200 px wide or less. The mini card's detail button sits in the banner's top-right corner, in the frosted style of the other cards.
- With `illustration: false`, the classic header has the same status pill on the title row (Ringing, N running, N paused, Idle) in its own style and in the icon's colour, with the same placement rule; its subtitle no longer repeats the count the pill gives.
- Night picture with the dark theme even while the sun is up (a day picture would glare on a dark dashboard); `illustration_theme: day | night` still forces one.

## 1.1.0 - 2026-11-16

### Features
- New look, in line with the other cards: a kitchen timer with the live ring of the next timer in the hero, its time in large with when it ends, its length and the next timer after it; text buttons (Pause, +1 min, Resume, Start).
- Timers as rows with their own live ring, the time left and when they end in color, a pause badge when paused; the timer shown in large is no longer listed again.
- Mini card: a small kitchen timer, the time in large and the other timers on one line.
- Timers of Alexa Devices (core): the *Next timer* sensor of each Echo, ending at its state.

### Fixes
- Mini card: the other timers' countdowns are live again.
- A running timer whose end is not known (Alexa Media without its remaining time) no longer reads "Paused" or "Ringing".
- Rows keep +1 min and cancel as round buttons; on narrow cards the main action and +1 min stay.
- "No timer running" is said once.
- Alexa Media Player: older formats of `sorted_active` (a JSON string, or a list of `[id, timer]` pairs) are read too.

## 1.0.0 - 2026-11-16

First release.

### Features
- **Timer Card** (`custom:timer-card`): the next timer to end in a large dial (time left, length, end time, speaker), every timer with its ring and live countdown, quick starts and counters; collapsible sections.
- **Timer Mini Card** (`custom:timer-mini-card`): compact view with the next timer's ring, the running timers and a pause, dismiss or start button; the detail button switches to the full card.
- Timer helpers (start with a duration popup, pause, resume, add a minute, cancel), Google Home timers (Google Home community integration, dismissed with `google_home.delete_timer`) and Alexa timers (Alexa Media Player), found through the entity registry; counter helpers with − and +.
- Animations while the next timer runs (a dot sweeps round its dial) and while a speaker timer rings (dial and ring flashing, bell shaking).
- Visual editor for both cards; light and dark themes; 22 languages, English in the bundle and every other language in its own file loaded on demand.
