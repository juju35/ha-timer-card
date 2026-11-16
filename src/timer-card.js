/*
 * Timer Card for Home Assistant
 * https://github.com/juju35/ha-timer-card
 *
 * Lovelace cards for timers and counters: timer helpers (start with a duration, pause, resume, add a minute,
 * cancel), the timers of Google Home speakers (Google Home community integration) and of Echo devices (Alexa Media
 * Player), with live countdown rings, quick starts, and counter helpers with − and + buttons.
 * Entities are found through the entity registry, so they work whatever the Home Assistant language or entity ids;
 * every one of them can also be set in the configuration.
 */

const VERSION = "__VERSION__";

const CARD_ICONS = {
  bell_ring: "M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21M19.75,3.19L18.33,4.61C20.04,6.3 21,8.6 21,11H23C23,8.07 21.84,5.25 19.75,3.19M1,11H3C3,8.6 3.96,6.3 5.67,4.61L4.25,3.19C2.16,5.25 1,8.07 1,11Z",
  sand: "M6,2V8H6V8L10,12L6,16V16H6V22H18V16H18V16L14,12L18,8V8H18V2H6M16,16.5V20H8V16.5L12,12.5L16,16.5M12,11.5L8,7.5V4H16V7.5L12,11.5Z",
  timer:
    "M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,14H13V8H11M15,1H9V3H15V1Z",
  timer_off:
    "M12,20A7,7 0 0,1 5,13C5,11.72 5.35,10.5 5.95,9.5L15.5,19.04C14.5,19.65 13.28,20 12,20M3,4L1.75,5.27L4.5,8.03C3.55,9.45 3,11.16 3,13A9,9 0 0,0 12,22C13.84,22 15.55,21.45 17,20.5L19.5,23L20.75,21.73L13.04,14L3,4M11,9.44L13,11.44V8H11M15,1H9V3H15M19.04,4.55L17.62,5.97C16.07,4.74 14.12,4 12,4C10.17,4 8.47,4.55 7.05,5.5L8.5,6.94C9.53,6.35 10.73,6 12,6A7,7 0 0,1 19,13C19,14.27 18.65,15.47 18.06,16.5L19.5,17.94C20.45,16.53 21,14.83 21,13C21,10.88 20.26,8.93 19.03,7.39L20.45,5.97L19.04,4.55Z",
  bell: "M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21",
  speaker: "M12,12A3,3 0 0,0 9,15A3,3 0 0,0 12,18A3,3 0 0,0 15,15A3,3 0 0,0 12,12M12,20A5,5 0 0,1 7,15A5,5 0 0,1 12,10A5,5 0 0,1 17,15A5,5 0 0,1 12,20M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8C10.89,8 10,7.1 10,6C10,4.89 10.89,4 12,4M17,2H7C5.89,2 5,2.89 5,4V20A2,2 0 0,0 7,22H17A2,2 0 0,0 19,20V4C19,2.89 18.1,2 17,2Z",
  counter:
    "M4,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M4,6V18H11V6H4M20,18V6H18.76C19,6.54 18.95,7.07 18.95,7.13C18.88,7.8 18.41,8.5 18.24,8.75L15.91,11.3L19.23,11.28L19.24,12.5L14.04,12.47L14,11.47C14,11.47 17.05,8.24 17.2,7.95C17.34,7.67 17.91,6 16.5,6C15.27,6.05 15.41,7.3 15.41,7.3L13.87,7.31C13.87,7.31 13.88,6.65 14.25,6H13V18H15.58L15.57,17.14L16.54,17.13C16.54,17.13 17.45,16.97 17.46,16.08C17.5,15.08 16.65,15.08 16.5,15.08C16.37,15.08 15.43,15.13 15.43,15.95H13.91C13.91,15.95 13.95,13.89 16.5,13.89C19.1,13.89 18.96,15.91 18.96,15.91C18.96,15.91 19,17.16 17.85,17.63L18.37,18H20M8.92,16H7.42V10.2L5.62,10.76V9.53L8.76,8.41H8.92V16Z",
  restart: "M12,4C14.1,4 16.1,4.8 17.6,6.3C20.7,9.4 20.7,14.5 17.6,17.6C15.8,19.5 13.3,20.2 10.9,19.9L11.4,17.9C13.1,18.1 14.9,17.5 16.2,16.2C18.5,13.9 18.5,10.1 16.2,7.7C15.1,6.6 13.5,6 12,6V10.6L7,5.6L12,0.6V4M6.3,17.6C3.7,15 3.3,11 5.1,7.9L6.6,9.4C5.5,11.6 5.9,14.4 7.8,16.2C8.3,16.7 8.9,17.1 9.6,17.4L9,19.4C8,19 7.1,18.4 6.3,17.6Z",
};

// Durations offered when a timer is started from the card, in minutes.
const PRESETS = [1, 3, 5, 10, 15, 20, 30, 45, 60];
// The quick starts under the timers, in minutes.
const QUICK = [5, 10, 15];

const STRINGS = {
  en: {
    timer: "Timer",
    timers: "Timers",
    counters: "Counters",
    ringing: "Ringing",
    running_one: "1 running",
    running_n: "{n} running",
    paused: "Paused",
    paused_one: "1 paused",
    paused_n: "{n} paused",
    none_running: "No timer running",
    done: "Done",
    pause: "Pause",
    resume: "Resume",
    add_minute: "Add a minute",
    cancel_timer: "Cancel",
    stop_ringing: "Stop",
    delete: "Delete",
    ends_at: "Ends at {time}",
    of: "of {length}",
    quick_start: "Quick start · {name}",
    other: "Other",
    decrement: "Decrease",
    increment: "Increase",
    start_timer: "Start {name}",
    no_data: "Nothing to show: no timer or counter found.",
    timers_field: "Timers (timer helpers, Google Home and Alexa timer sensors; empty: automatic)",
    counters_field: "Counters (empty: automatic)",
    quick_timer: "Timer of the quick starts (default: the first idle one)",
    show_hero: "Show the next timer in large",
    show_timers: "Show the timers",
    show_quick: "Show the quick starts",
    show_counters: "Show the counters",
    next_timer: "Next: {name} at {time}",
    start: "Start",
    duration: "Duration",
    less: "Less",
    more: "More",
    cancel: "Cancel",
    left: "{time} left",
    today_at: "today {time}",
    tomorrow_at: "tomorrow {time}",
    yesterday_at: "yesterday {time}",
    zoom_in: "Show details",
    zoom_out: "Show less",
    title: "Title (optional)",
    language: "Language",
    lang_auto: "Automatic",
    collapsed: "Sections folded by default",
    zoom: "Detail button",
    zoom_helper: "Switches the mini card to the full card's content",
    show_title: "Show title",
    show_subtitle: "Show subtitle",
    no_registry: "This card needs Home Assistant 2024.8 or later.",
    unavailable: "Unavailable",
  },
  fr: {
    timer: "Minuteur",
    timers: "Minuteurs",
    counters: "Compteurs",
    ringing: "Sonne",
    running_one: "1 en cours",
    running_n: "{n} en cours",
    paused: "En pause",
    paused_one: "1 en pause",
    paused_n: "{n} en pause",
    none_running: "Aucun minuteur en cours",
    done: "Terminé",
    pause: "Pause",
    resume: "Reprendre",
    add_minute: "Ajouter une minute",
    cancel_timer: "Annuler",
    stop_ringing: "Arrêter",
    delete: "Supprimer",
    ends_at: "Fin à {time}",
    of: "sur {length}",
    quick_start: "Démarrage rapide · {name}",
    other: "Autre",
    decrement: "Diminuer",
    increment: "Augmenter",
    start_timer: "Démarrer {name}",
    no_data: "Rien à afficher : aucun minuteur ni compteur trouvé.",
    timers_field: "Minuteurs (minuteurs, minuteurs Google Home et Alexa ; vide : automatique)",
    counters_field: "Compteurs (vide : automatique)",
    quick_timer: "Minuteur des démarrages rapides (par défaut : le premier à l'arrêt)",
    show_hero: "Afficher le prochain minuteur en grand",
    show_timers: "Afficher les minuteurs",
    show_quick: "Afficher les démarrages rapides",
    show_counters: "Afficher les compteurs",
    next_timer: "Ensuite : {name} à {time}",
    start: "Démarrer",
    duration: "Durée",
    less: "Moins",
    more: "Plus",
    cancel: "Annuler",
    left: "{time} restantes",
    today_at: "aujourd'hui {time}",
    tomorrow_at: "demain {time}",
    yesterday_at: "hier {time}",
    zoom_in: "Afficher les détails",
    zoom_out: "Réduire",
    title: "Titre (facultatif)",
    language: "Langue",
    lang_auto: "Automatique",
    collapsed: "Sections repliées par défaut",
    zoom: "Bouton détail",
    zoom_helper: "Bascule la mini-carte vers le contenu de la carte complète",
    show_title: "Afficher le titre",
    show_subtitle: "Afficher le sous-titre",
    no_registry: "Cette carte nécessite Home Assistant 2024.8 ou plus récent.",
    unavailable: "Indisponible",
  },
  de: {
    timer: "Timer",
    timers: "Timer",
    counters: "Zähler",
    ringing: "Klingelt",
    running_one: "1 läuft",
    running_n: "{n} laufen",
    paused: "Pausiert",
    paused_one: "1 pausiert",
    paused_n: "{n} pausiert",
    none_running: "Kein Timer läuft",
    done: "Fertig",
    pause: "Pause",
    resume: "Fortsetzen",
    add_minute: "Eine Minute hinzufügen",
    cancel_timer: "Abbrechen",
    stop_ringing: "Stoppen",
    delete: "Löschen",
    ends_at: "Endet um {time}",
    of: "von {length}",
    quick_start: "Schnellstart · {name}",
    other: "Andere",
    decrement: "Verringern",
    increment: "Erhöhen",
    start_timer: "{name} starten",
    no_data: "Nichts anzuzeigen: kein Timer oder Zähler gefunden.",
    timers_field: "Timer (Timer-Helfer, Google-Home- und Alexa-Timer; leer: automatisch)",
    counters_field: "Zähler (leer: automatisch)",
    quick_timer: "Timer für den Schnellstart (Standard: der erste inaktive)",
    show_hero: "Nächsten Timer groß anzeigen",
    show_timers: "Timer anzeigen",
    show_quick: "Schnellstart anzeigen",
    show_counters: "Zähler anzeigen",
    next_timer: "Danach: {name} um {time}",
    start: "Starten",
    duration: "Dauer",
    less: "Weniger",
    more: "Mehr",
    cancel: "Abbrechen",
    left: "Noch {time}",
    today_at: "heute {time}",
    tomorrow_at: "morgen {time}",
    yesterday_at: "gestern {time}",
    zoom_in: "Details anzeigen",
    zoom_out: "Weniger anzeigen",
    title: "Titel (optional)",
    language: "Sprache",
    lang_auto: "Automatisch",
    collapsed: "Standardmäßig eingeklappte Bereiche",
    zoom: "Detail-Schaltfläche",
    zoom_helper: "Schaltet die Mini-Karte auf den Inhalt der vollen Karte um",
    show_title: "Titel anzeigen",
    show_subtitle: "Untertitel anzeigen",
    no_registry: "Diese Karte benötigt Home Assistant 2024.8 oder neuer.",
    unavailable: "Nicht verfügbar",
  },
  es: {
    timer: "Temporizador",
    timers: "Temporizadores",
    counters: "Contadores",
    ringing: "Sonando",
    running_one: "1 en marcha",
    running_n: "{n} en marcha",
    paused: "En pausa",
    paused_one: "1 en pausa",
    paused_n: "{n} en pausa",
    none_running: "Ningún temporizador en marcha",
    done: "Terminado",
    pause: "Pausar",
    resume: "Reanudar",
    add_minute: "Añadir un minuto",
    cancel_timer: "Cancelar",
    stop_ringing: "Detener",
    delete: "Eliminar",
    ends_at: "Termina a las {time}",
    of: "de {length}",
    quick_start: "Inicio rápido · {name}",
    other: "Otro",
    decrement: "Disminuir",
    increment: "Aumentar",
    start_timer: "Iniciar {name}",
    no_data: "Nada que mostrar: no se encontró ningún temporizador ni contador.",
    timers_field: "Temporizadores (ayudantes, temporizadores de Google Home y Alexa; vacío: automático)",
    counters_field: "Contadores (vacío: automático)",
    quick_timer: "Temporizador del inicio rápido (por defecto: el primero inactivo)",
    show_hero: "Mostrar el próximo temporizador en grande",
    show_timers: "Mostrar los temporizadores",
    show_quick: "Mostrar el inicio rápido",
    show_counters: "Mostrar los contadores",
    next_timer: "Después: {name} a las {time}",
    start: "Iniciar",
    duration: "Duración",
    less: "Menos",
    more: "Más",
    cancel: "Cancelar",
    left: "Quedan {time}",
    today_at: "hoy {time}",
    tomorrow_at: "mañana {time}",
    yesterday_at: "ayer {time}",
    zoom_in: "Ver detalles",
    zoom_out: "Ver menos",
    title: "Título (opcional)",
    language: "Idioma",
    lang_auto: "Automático",
    collapsed: "Secciones plegadas por defecto",
    zoom: "Botón de detalle",
    zoom_helper: "Cambia la minitarjeta al contenido de la tarjeta completa",
    show_title: "Mostrar título",
    show_subtitle: "Mostrar subtítulo",
    no_registry: "Esta tarjeta necesita Home Assistant 2024.8 o posterior.",
    unavailable: "No disponible",
  },
  it: {
    timer: "Timer",
    timers: "Timer",
    counters: "Contatori",
    ringing: "Suona",
    running_one: "1 in corso",
    running_n: "{n} in corso",
    paused: "In pausa",
    paused_one: "1 in pausa",
    paused_n: "{n} in pausa",
    none_running: "Nessun timer in corso",
    done: "Finito",
    pause: "Pausa",
    resume: "Riprendi",
    add_minute: "Aggiungi un minuto",
    cancel_timer: "Annulla",
    stop_ringing: "Ferma",
    delete: "Elimina",
    ends_at: "Finisce alle {time}",
    of: "su {length}",
    quick_start: "Avvio rapido · {name}",
    other: "Altro",
    decrement: "Diminuisci",
    increment: "Aumenta",
    start_timer: "Avvia {name}",
    no_data: "Niente da mostrare: nessun timer o contatore trovato.",
    timers_field: "Timer (aiutanti timer, timer di Google Home e Alexa; vuoto: automatico)",
    counters_field: "Contatori (vuoto: automatico)",
    quick_timer: "Timer dell'avvio rapido (predefinito: il primo inattivo)",
    show_hero: "Mostra il prossimo timer in grande",
    show_timers: "Mostra i timer",
    show_quick: "Mostra l'avvio rapido",
    show_counters: "Mostra i contatori",
    next_timer: "Poi: {name} alle {time}",
    start: "Avvia",
    duration: "Durata",
    less: "Meno",
    more: "Più",
    cancel: "Annulla",
    left: "{time} rimanenti",
    today_at: "oggi {time}",
    tomorrow_at: "domani {time}",
    yesterday_at: "ieri {time}",
    zoom_in: "Mostra dettagli",
    zoom_out: "Mostra meno",
    title: "Titolo (facoltativo)",
    language: "Lingua",
    lang_auto: "Automatica",
    collapsed: "Sezioni chiuse per impostazione predefinita",
    zoom: "Pulsante dettagli",
    zoom_helper: "Passa la mini scheda al contenuto della scheda completa",
    show_title: "Mostra titolo",
    show_subtitle: "Mostra sottotitolo",
    no_registry: "Questa scheda richiede Home Assistant 2024.8 o successivo.",
    unavailable: "Non disponibile",
  },
  nl: {
    timer: "Timer",
    timers: "Timers",
    counters: "Tellers",
    ringing: "Gaat af",
    running_one: "1 loopt",
    running_n: "{n} lopen",
    paused: "Gepauzeerd",
    paused_one: "1 gepauzeerd",
    paused_n: "{n} gepauzeerd",
    none_running: "Geen timer actief",
    done: "Klaar",
    pause: "Pauzeren",
    resume: "Hervatten",
    add_minute: "Een minuut toevoegen",
    cancel_timer: "Annuleren",
    stop_ringing: "Stoppen",
    delete: "Verwijderen",
    ends_at: "Eindigt om {time}",
    of: "van {length}",
    quick_start: "Snelstart · {name}",
    other: "Andere",
    decrement: "Verlagen",
    increment: "Verhogen",
    start_timer: "{name} starten",
    no_data: "Niets te tonen: geen timer of teller gevonden.",
    timers_field: "Timers (timerhelpers, Google Home- en Alexa-timers; leeg: automatisch)",
    counters_field: "Tellers (leeg: automatisch)",
    quick_timer: "Timer van de snelstart (standaard: de eerste inactieve)",
    show_hero: "Volgende timer groot tonen",
    show_timers: "Timers tonen",
    show_quick: "Snelstart tonen",
    show_counters: "Tellers tonen",
    next_timer: "Daarna: {name} om {time}",
    start: "Starten",
    duration: "Duur",
    less: "Minder",
    more: "Meer",
    cancel: "Annuleren",
    left: "Nog {time}",
    today_at: "vandaag {time}",
    tomorrow_at: "morgen {time}",
    yesterday_at: "gisteren {time}",
    zoom_in: "Details tonen",
    zoom_out: "Minder tonen",
    title: "Titel (optioneel)",
    language: "Taal",
    lang_auto: "Automatisch",
    collapsed: "Standaard ingeklapte secties",
    zoom: "Detailknop",
    zoom_helper: "Schakelt de minikaart naar de inhoud van de volledige kaart",
    show_title: "Titel tonen",
    show_subtitle: "Ondertitel tonen",
    no_registry: "Deze kaart vereist Home Assistant 2024.8 of nieuwer.",
    unavailable: "Niet beschikbaar",
  },
  pt: {
    timer: "Temporizador",
    timers: "Temporizadores",
    counters: "Contadores",
    ringing: "A tocar",
    running_one: "1 em curso",
    running_n: "{n} em curso",
    paused: "Em pausa",
    paused_one: "1 em pausa",
    paused_n: "{n} em pausa",
    none_running: "Nenhum temporizador em curso",
    done: "Terminado",
    pause: "Pausa",
    resume: "Retomar",
    add_minute: "Adicionar um minuto",
    cancel_timer: "Cancelar",
    stop_ringing: "Parar",
    delete: "Eliminar",
    ends_at: "Termina às {time}",
    of: "de {length}",
    quick_start: "Início rápido · {name}",
    other: "Outro",
    decrement: "Diminuir",
    increment: "Aumentar",
    start_timer: "Iniciar {name}",
    no_data: "Nada a mostrar: nenhum temporizador ou contador encontrado.",
    timers_field: "Temporizadores (auxiliares, temporizadores Google Home e Alexa; vazio: automático)",
    counters_field: "Contadores (vazio: automático)",
    quick_timer: "Temporizador do início rápido (por omissão: o primeiro inativo)",
    show_hero: "Mostrar o próximo temporizador em grande",
    show_timers: "Mostrar os temporizadores",
    show_quick: "Mostrar o início rápido",
    show_counters: "Mostrar os contadores",
    next_timer: "A seguir: {name} às {time}",
    start: "Iniciar",
    duration: "Duração",
    less: "Menos",
    more: "Mais",
    cancel: "Cancelar",
    left: "Faltam {time}",
    today_at: "hoje {time}",
    tomorrow_at: "amanhã {time}",
    yesterday_at: "ontem {time}",
    zoom_in: "Mostrar detalhes",
    zoom_out: "Mostrar menos",
    title: "Título (opcional)",
    language: "Idioma",
    lang_auto: "Automático",
    collapsed: "Secções recolhidas por predefinição",
    zoom: "Botão de detalhe",
    zoom_helper: "Muda o minicartão para o conteúdo do cartão completo",
    show_title: "Mostrar título",
    show_subtitle: "Mostrar subtítulo",
    no_registry: "Este cartão requer o Home Assistant 2024.8 ou posterior.",
    unavailable: "Indisponível",
  },
  pl: {
    timer: "Minutnik",
    timers: "Minutniki",
    counters: "Liczniki",
    ringing: "Dzwoni",
    running_one: "1 aktywny",
    running_n: "Aktywne: {n}",
    paused: "Wstrzymany",
    paused_one: "1 wstrzymany",
    paused_n: "Wstrzymane: {n}",
    none_running: "Brak aktywnych minutników",
    done: "Zakończony",
    pause: "Wstrzymaj",
    resume: "Wznów",
    add_minute: "Dodaj minutę",
    cancel_timer: "Anuluj",
    stop_ringing: "Zatrzymaj",
    delete: "Usuń",
    ends_at: "Koniec o {time}",
    of: "z {length}",
    quick_start: "Szybki start · {name}",
    other: "Inny",
    decrement: "Zmniejsz",
    increment: "Zwiększ",
    start_timer: "Uruchom {name}",
    no_data: "Brak danych: nie znaleziono minutnika ani licznika.",
    timers_field: "Minutniki (pomocnicy, minutniki Google Home i Alexa; puste: automatycznie)",
    counters_field: "Liczniki (puste: automatycznie)",
    quick_timer: "Minutnik szybkiego startu (domyślnie: pierwszy nieaktywny)",
    show_hero: "Pokaż najbliższy minutnik w dużym rozmiarze",
    show_timers: "Pokaż minutniki",
    show_quick: "Pokaż szybki start",
    show_counters: "Pokaż liczniki",
    next_timer: "Następny: {name} o {time}",
    start: "Start",
    duration: "Czas trwania",
    less: "Mniej",
    more: "Więcej",
    cancel: "Anuluj",
    left: "Pozostało {time}",
    today_at: "dziś {time}",
    tomorrow_at: "jutro {time}",
    yesterday_at: "wczoraj {time}",
    zoom_in: "Pokaż szczegóły",
    zoom_out: "Pokaż mniej",
    title: "Tytuł (opcjonalnie)",
    language: "Język",
    lang_auto: "Automatycznie",
    collapsed: "Sekcje domyślnie zwinięte",
    zoom: "Przycisk szczegółów",
    zoom_helper: "Przełącza minikartę na zawartość pełnej karty",
    show_title: "Pokaż tytuł",
    show_subtitle: "Pokaż podtytuł",
    no_registry: "Ta karta wymaga Home Assistant 2024.8 lub nowszego.",
    unavailable: "Niedostępne",
  },
  sr: {
    timer: "Тајмер",
    timers: "Тајмери",
    counters: "Бројачи",
    ringing: "Звони",
    running_one: "1 ради",
    running_n: "Раде: {n}",
    paused: "Паузиран",
    paused_one: "1 паузиран",
    paused_n: "Паузирано: {n}",
    none_running: "Ниједан тајмер не ради",
    done: "Готово",
    pause: "Пауза",
    resume: "Настави",
    add_minute: "Додај минут",
    cancel_timer: "Откажи",
    stop_ringing: "Заустави",
    delete: "Обриши",
    ends_at: "Завршава у {time}",
    of: "од {length}",
    quick_start: "Брзи старт · {name}",
    other: "Друго",
    decrement: "Смањи",
    increment: "Повећај",
    start_timer: "Покрени {name}",
    no_data: "Нема шта да се прикаже: није пронађен тајмер ни бројач.",
    timers_field: "Тајмери (помоћници, Google Home и Alexa тајмери; празно: аутоматски)",
    counters_field: "Бројачи (празно: аутоматски)",
    quick_timer: "Тајмер брзог старта (подразумевано: први неактивни)",
    show_hero: "Прикажи следећи тајмер увећано",
    show_timers: "Прикажи тајмере",
    show_quick: "Прикажи брзи старт",
    show_counters: "Прикажи бројаче",
    next_timer: "Затим: {name} у {time}",
    start: "Покрени",
    duration: "Трајање",
    less: "Мање",
    more: "Више",
    cancel: "Откажи",
    left: "Преостало {time}",
    today_at: "данас {time}",
    tomorrow_at: "сутра {time}",
    yesterday_at: "јуче {time}",
    zoom_in: "Прикажи детаље",
    zoom_out: "Прикажи мање",
    title: "Наслов (опционо)",
    language: "Језик",
    lang_auto: "Аутоматски",
    collapsed: "Подразумевано скупљени одељци",
    zoom: "Дугме за детаље",
    zoom_helper: "Пребацује мини картицу на садржај пуне картице",
    show_title: "Прикажи наслов",
    show_subtitle: "Прикажи поднаслов",
    no_registry: "Ова картица захтева Home Assistant 2024.8 или новији.",
    unavailable: "Недоступно",
  },
  "sr-Latn": {
    timer: "Tajmer",
    timers: "Tajmeri",
    counters: "Brojači",
    ringing: "Zvoni",
    running_one: "1 radi",
    running_n: "Rade: {n}",
    paused: "Pauziran",
    paused_one: "1 pauziran",
    paused_n: "Pauzirano: {n}",
    none_running: "Nijedan tajmer ne radi",
    done: "Gotovo",
    pause: "Pauza",
    resume: "Nastavi",
    add_minute: "Dodaj minut",
    cancel_timer: "Otkaži",
    stop_ringing: "Zaustavi",
    delete: "Obriši",
    ends_at: "Završava u {time}",
    of: "od {length}",
    quick_start: "Brzi start · {name}",
    other: "Drugo",
    decrement: "Smanji",
    increment: "Povećaj",
    start_timer: "Pokreni {name}",
    no_data: "Nema šta da se prikaže: nije pronađen tajmer ni brojač.",
    timers_field: "Tajmeri (pomoćnici, Google Home i Alexa tajmeri; prazno: automatski)",
    counters_field: "Brojači (prazno: automatski)",
    quick_timer: "Tajmer brzog starta (podrazumevano: prvi neaktivni)",
    show_hero: "Prikaži sledeći tajmer uvećano",
    show_timers: "Prikaži tajmere",
    show_quick: "Prikaži brzi start",
    show_counters: "Prikaži brojače",
    next_timer: "Zatim: {name} u {time}",
    start: "Pokreni",
    duration: "Trajanje",
    less: "Manje",
    more: "Više",
    cancel: "Otkaži",
    left: "Preostalo {time}",
    today_at: "danas {time}",
    tomorrow_at: "sutra {time}",
    yesterday_at: "juče {time}",
    zoom_in: "Prikaži detalje",
    zoom_out: "Prikaži manje",
    title: "Naslov (opciono)",
    language: "Jezik",
    lang_auto: "Automatski",
    collapsed: "Podrazumevano skupljeni odeljci",
    zoom: "Dugme za detalje",
    zoom_helper: "Prebacuje mini karticu na sadržaj pune kartice",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    no_registry: "Ova kartica zahteva Home Assistant 2024.8 ili noviji.",
    unavailable: "Nedostupno",
  },
  ro: {
    timer: "Cronometru",
    timers: "Cronometre",
    counters: "Contoare",
    ringing: "Sună",
    running_one: "1 pornit",
    running_n: "{n} pornite",
    paused: "În pauză",
    paused_one: "1 în pauză",
    paused_n: "{n} în pauză",
    none_running: "Niciun cronometru pornit",
    done: "Gata",
    pause: "Pauză",
    resume: "Reia",
    add_minute: "Adaugă un minut",
    cancel_timer: "Anulează",
    stop_ringing: "Oprește",
    delete: "Șterge",
    ends_at: "Se termină la {time}",
    of: "din {length}",
    quick_start: "Pornire rapidă · {name}",
    other: "Altul",
    decrement: "Scade",
    increment: "Crește",
    start_timer: "Pornește {name}",
    no_data: "Nimic de afișat: niciun cronometru sau contor găsit.",
    timers_field: "Cronometre (ajutoare, cronometre Google Home și Alexa; gol: automat)",
    counters_field: "Contoare (gol: automat)",
    quick_timer: "Cronometrul pornirii rapide (implicit: primul inactiv)",
    show_hero: "Afișează mare următorul cronometru",
    show_timers: "Afișează cronometrele",
    show_quick: "Afișează pornirea rapidă",
    show_counters: "Afișează contoarele",
    next_timer: "Apoi: {name} la {time}",
    start: "Pornește",
    duration: "Durată",
    less: "Mai puțin",
    more: "Mai mult",
    cancel: "Anulează",
    left: "Mai sunt {time}",
    today_at: "azi {time}",
    tomorrow_at: "mâine {time}",
    yesterday_at: "ieri {time}",
    zoom_in: "Arată detalii",
    zoom_out: "Arată mai puțin",
    title: "Titlu (opțional)",
    language: "Limbă",
    lang_auto: "Automat",
    collapsed: "Secțiuni pliate implicit",
    zoom: "Buton de detalii",
    zoom_helper: "Comută mini cardul la conținutul cardului complet",
    show_title: "Afișează titlul",
    show_subtitle: "Afișează subtitlul",
    no_registry: "Acest card necesită Home Assistant 2024.8 sau mai nou.",
    unavailable: "Indisponibil",
  },
  da: {
    timer: "Timer",
    timers: "Timere",
    counters: "Tællere",
    ringing: "Ringer",
    running_one: "1 kører",
    running_n: "{n} kører",
    paused: "På pause",
    paused_one: "1 på pause",
    paused_n: "{n} på pause",
    none_running: "Ingen timer kører",
    done: "Færdig",
    pause: "Pause",
    resume: "Fortsæt",
    add_minute: "Tilføj et minut",
    cancel_timer: "Annuller",
    stop_ringing: "Stop",
    delete: "Slet",
    ends_at: "Slutter kl. {time}",
    of: "af {length}",
    quick_start: "Hurtigstart · {name}",
    other: "Andet",
    decrement: "Sænk",
    increment: "Hæv",
    start_timer: "Start {name}",
    no_data: "Intet at vise: ingen timer eller tæller fundet.",
    timers_field: "Timere (timerhjælpere, Google Home- og Alexa-timere; tom: automatisk)",
    counters_field: "Tællere (tom: automatisk)",
    quick_timer: "Timer til hurtigstart (standard: den første inaktive)",
    show_hero: "Vis den næste timer stort",
    show_timers: "Vis timerne",
    show_quick: "Vis hurtigstart",
    show_counters: "Vis tællerne",
    next_timer: "Derefter: {name} kl. {time}",
    start: "Start",
    duration: "Varighed",
    less: "Mindre",
    more: "Mere",
    cancel: "Annuller",
    left: "{time} tilbage",
    today_at: "i dag {time}",
    tomorrow_at: "i morgen {time}",
    yesterday_at: "i går {time}",
    zoom_in: "Vis detaljer",
    zoom_out: "Vis mindre",
    title: "Titel (valgfri)",
    language: "Sprog",
    lang_auto: "Automatisk",
    collapsed: "Sektioner foldet sammen som standard",
    zoom: "Detaljeknap",
    zoom_helper: "Skifter minikortet til det fulde korts indhold",
    show_title: "Vis titel",
    show_subtitle: "Vis undertitel",
    no_registry: "Dette kort kræver Home Assistant 2024.8 eller nyere.",
    unavailable: "Utilgængelig",
  },
  sv: {
    timer: "Timer",
    timers: "Timers",
    counters: "Räknare",
    ringing: "Ringer",
    running_one: "1 igång",
    running_n: "{n} igång",
    paused: "Pausad",
    paused_one: "1 pausad",
    paused_n: "{n} pausade",
    none_running: "Ingen timer igång",
    done: "Klar",
    pause: "Pausa",
    resume: "Återuppta",
    add_minute: "Lägg till en minut",
    cancel_timer: "Avbryt",
    stop_ringing: "Stoppa",
    delete: "Ta bort",
    ends_at: "Slutar {time}",
    of: "av {length}",
    quick_start: "Snabbstart · {name}",
    other: "Annan",
    decrement: "Minska",
    increment: "Öka",
    start_timer: "Starta {name}",
    no_data: "Inget att visa: ingen timer eller räknare hittades.",
    timers_field: "Timers (timerhjälpare, Google Home- och Alexa-timers; tom: automatiskt)",
    counters_field: "Räknare (tom: automatiskt)",
    quick_timer: "Timer för snabbstart (standard: den första inaktiva)",
    show_hero: "Visa nästa timer stort",
    show_timers: "Visa timers",
    show_quick: "Visa snabbstart",
    show_counters: "Visa räknare",
    next_timer: "Sedan: {name} kl. {time}",
    start: "Starta",
    duration: "Varaktighet",
    less: "Mindre",
    more: "Mer",
    cancel: "Avbryt",
    left: "{time} kvar",
    today_at: "i dag {time}",
    tomorrow_at: "i morgon {time}",
    yesterday_at: "i går {time}",
    zoom_in: "Visa detaljer",
    zoom_out: "Visa mindre",
    title: "Titel (valfri)",
    language: "Språk",
    lang_auto: "Automatiskt",
    collapsed: "Sektioner hopfällda som standard",
    zoom: "Detaljknapp",
    zoom_helper: "Växlar minikortet till hela kortets innehåll",
    show_title: "Visa titel",
    show_subtitle: "Visa undertitel",
    no_registry: "Det här kortet kräver Home Assistant 2024.8 eller senare.",
    unavailable: "Otillgänglig",
  },
  bg: {
    timer: "Таймер",
    timers: "Таймери",
    counters: "Броячи",
    ringing: "Звъни",
    running_one: "1 работи",
    running_n: "Работят: {n}",
    paused: "На пауза",
    paused_one: "1 на пауза",
    paused_n: "На пауза: {n}",
    none_running: "Няма работещ таймер",
    done: "Готово",
    pause: "Пауза",
    resume: "Продължи",
    add_minute: "Добави минута",
    cancel_timer: "Отказ",
    stop_ringing: "Спри",
    delete: "Изтрий",
    ends_at: "Приключва в {time}",
    of: "от {length}",
    quick_start: "Бърз старт · {name}",
    other: "Друго",
    decrement: "Намали",
    increment: "Увеличи",
    start_timer: "Стартирай {name}",
    no_data: "Няма какво да се покаже: не е открит таймер или брояч.",
    timers_field: "Таймери (помощници, таймери на Google Home и Alexa; празно: автоматично)",
    counters_field: "Броячи (празно: автоматично)",
    quick_timer: "Таймер за бърз старт (по подразбиране: първият неактивен)",
    show_hero: "Показване на следващия таймер в едър план",
    show_timers: "Показване на таймерите",
    show_quick: "Показване на бързия старт",
    show_counters: "Показване на броячите",
    next_timer: "След това: {name} в {time}",
    start: "Старт",
    duration: "Продължителност",
    less: "По-малко",
    more: "Повече",
    cancel: "Отказ",
    left: "Остават {time}",
    today_at: "днес {time}",
    tomorrow_at: "утре {time}",
    yesterday_at: "вчера {time}",
    zoom_in: "Покажи подробности",
    zoom_out: "Покажи по-малко",
    title: "Заглавие (по избор)",
    language: "Език",
    lang_auto: "Автоматично",
    collapsed: "Сгънати по подразбиране раздели",
    zoom: "Бутон за подробности",
    zoom_helper: "Превключва мини картата към съдържанието на пълната карта",
    show_title: "Покажи заглавие",
    show_subtitle: "Покажи подзаглавие",
    no_registry: "Тази карта изисква Home Assistant 2024.8 или по-нов.",
    unavailable: "Недостъпно",
  },
  ru: {
    timer: "Таймер",
    timers: "Таймеры",
    counters: "Счётчики",
    ringing: "Звонит",
    running_one: "1 идёт",
    running_n: "Идут: {n}",
    paused: "На паузе",
    paused_one: "1 на паузе",
    paused_n: "На паузе: {n}",
    none_running: "Нет активных таймеров",
    done: "Готово",
    pause: "Пауза",
    resume: "Продолжить",
    add_minute: "Добавить минуту",
    cancel_timer: "Отменить",
    stop_ringing: "Остановить",
    delete: "Удалить",
    ends_at: "Закончится в {time}",
    of: "из {length}",
    quick_start: "Быстрый старт · {name}",
    other: "Другое",
    decrement: "Уменьшить",
    increment: "Увеличить",
    start_timer: "Запустить {name}",
    no_data: "Нечего показать: таймеры и счётчики не найдены.",
    timers_field: "Таймеры (помощники, таймеры Google Home и Alexa; пусто: автоматически)",
    counters_field: "Счётчики (пусто: автоматически)",
    quick_timer: "Таймер быстрого старта (по умолчанию: первый неактивный)",
    show_hero: "Показывать ближайший таймер крупно",
    show_timers: "Показывать таймеры",
    show_quick: "Показывать быстрый старт",
    show_counters: "Показывать счётчики",
    next_timer: "Далее: {name} в {time}",
    start: "Запустить",
    duration: "Длительность",
    less: "Меньше",
    more: "Больше",
    cancel: "Отмена",
    left: "Осталось {time}",
    today_at: "сегодня {time}",
    tomorrow_at: "завтра {time}",
    yesterday_at: "вчера {time}",
    zoom_in: "Показать подробности",
    zoom_out: "Свернуть",
    title: "Заголовок (необязательно)",
    language: "Язык",
    lang_auto: "Автоматически",
    collapsed: "Свёрнутые по умолчанию разделы",
    zoom: "Кнопка подробностей",
    zoom_helper: "Переключает мини-карточку на содержимое полной карточки",
    show_title: "Показывать заголовок",
    show_subtitle: "Показывать подзаголовок",
    no_registry: "Для этой карточки нужен Home Assistant 2024.8 или новее.",
    unavailable: "Недоступно",
  },
  uk: {
    timer: "Таймер",
    timers: "Таймери",
    counters: "Лічильники",
    ringing: "Дзвонить",
    running_one: "1 працює",
    running_n: "Працюють: {n}",
    paused: "На паузі",
    paused_one: "1 на паузі",
    paused_n: "На паузі: {n}",
    none_running: "Немає активних таймерів",
    done: "Готово",
    pause: "Пауза",
    resume: "Продовжити",
    add_minute: "Додати хвилину",
    cancel_timer: "Скасувати",
    stop_ringing: "Зупинити",
    delete: "Видалити",
    ends_at: "Завершиться о {time}",
    of: "з {length}",
    quick_start: "Швидкий старт · {name}",
    other: "Інше",
    decrement: "Зменшити",
    increment: "Збільшити",
    start_timer: "Запустити {name}",
    no_data: "Нічого показати: таймери й лічильники не знайдено.",
    timers_field: "Таймери (помічники, таймери Google Home і Alexa; порожньо: автоматично)",
    counters_field: "Лічильники (порожньо: автоматично)",
    quick_timer: "Таймер швидкого старту (типово: перший неактивний)",
    show_hero: "Показувати найближчий таймер великим",
    show_timers: "Показувати таймери",
    show_quick: "Показувати швидкий старт",
    show_counters: "Показувати лічильники",
    next_timer: "Далі: {name} о {time}",
    start: "Запустити",
    duration: "Тривалість",
    less: "Менше",
    more: "Більше",
    cancel: "Скасувати",
    left: "Залишилось {time}",
    today_at: "сьогодні {time}",
    tomorrow_at: "завтра {time}",
    yesterday_at: "учора {time}",
    zoom_in: "Показати подробиці",
    zoom_out: "Згорнути",
    title: "Заголовок (необов'язково)",
    language: "Мова",
    lang_auto: "Автоматично",
    collapsed: "Згорнуті за замовчуванням розділи",
    zoom: "Кнопка подробиць",
    zoom_helper: "Перемикає міні-картку на вміст повної картки",
    show_title: "Показувати заголовок",
    show_subtitle: "Показувати підзаголовок",
    no_registry: "Для цієї картки потрібен Home Assistant 2024.8 або новіший.",
    unavailable: "Недоступно",
  },
  hu: {
    timer: "Időzítő",
    timers: "Időzítők",
    counters: "Számlálók",
    ringing: "Csörög",
    running_one: "1 fut",
    running_n: "{n} fut",
    paused: "Szüneteltetve",
    paused_one: "1 szüneteltetve",
    paused_n: "{n} szüneteltetve",
    none_running: "Nincs futó időzítő",
    done: "Kész",
    pause: "Szünet",
    resume: "Folytatás",
    add_minute: "Egy perc hozzáadása",
    cancel_timer: "Mégse",
    stop_ringing: "Leállítás",
    delete: "Törlés",
    ends_at: "Vége: {time}",
    of: "/ {length}",
    quick_start: "Gyorsindítás · {name}",
    other: "Egyéb",
    decrement: "Csökkentés",
    increment: "Növelés",
    start_timer: "{name} indítása",
    no_data: "Nincs mit megjeleníteni: nem található időzítő vagy számláló.",
    timers_field: "Időzítők (segédek, Google Home és Alexa időzítők; üres: automatikus)",
    counters_field: "Számlálók (üres: automatikus)",
    quick_timer: "A gyorsindítás időzítője (alapértelmezés: az első inaktív)",
    show_hero: "A következő időzítő nagyban",
    show_timers: "Időzítők megjelenítése",
    show_quick: "Gyorsindítás megjelenítése",
    show_counters: "Számlálók megjelenítése",
    next_timer: "Utána: {name}, {time}",
    start: "Indítás",
    duration: "Időtartam",
    less: "Kevesebb",
    more: "Több",
    cancel: "Mégse",
    left: "Még {time}",
    today_at: "ma {time}",
    tomorrow_at: "holnap {time}",
    yesterday_at: "tegnap {time}",
    zoom_in: "Részletek",
    zoom_out: "Kevesebb",
    title: "Cím (nem kötelező)",
    language: "Nyelv",
    lang_auto: "Automatikus",
    collapsed: "Alapértelmezetten összecsukott szakaszok",
    zoom: "Részletek gomb",
    zoom_helper: "A minikártyát a teljes kártya tartalmára váltja",
    show_title: "Cím megjelenítése",
    show_subtitle: "Alcím megjelenítése",
    no_registry: "Ehhez a kártyához Home Assistant 2024.8 vagy újabb szükséges.",
    unavailable: "Nem elérhető",
  },
  sk: {
    timer: "Časovač",
    timers: "Časovače",
    counters: "Počítadlá",
    ringing: "Zvoní",
    running_one: "1 beží",
    running_n: "Bežia: {n}",
    paused: "Pozastavený",
    paused_one: "1 pozastavený",
    paused_n: "Pozastavené: {n}",
    none_running: "Žiadny časovač nebeží",
    done: "Hotovo",
    pause: "Pozastaviť",
    resume: "Pokračovať",
    add_minute: "Pridať minútu",
    cancel_timer: "Zrušiť",
    stop_ringing: "Zastaviť",
    delete: "Odstrániť",
    ends_at: "Končí o {time}",
    of: "z {length}",
    quick_start: "Rýchly štart · {name}",
    other: "Iné",
    decrement: "Znížiť",
    increment: "Zvýšiť",
    start_timer: "Spustiť {name}",
    no_data: "Nič na zobrazenie: nenašiel sa žiadny časovač ani počítadlo.",
    timers_field: "Časovače (pomocníci, časovače Google Home a Alexa; prázdne: automaticky)",
    counters_field: "Počítadlá (prázdne: automaticky)",
    quick_timer: "Časovač rýchleho štartu (predvolene: prvý nečinný)",
    show_hero: "Zobraziť ďalší časovač zväčšene",
    show_timers: "Zobraziť časovače",
    show_quick: "Zobraziť rýchly štart",
    show_counters: "Zobraziť počítadlá",
    next_timer: "Potom: {name} o {time}",
    start: "Spustiť",
    duration: "Trvanie",
    less: "Menej",
    more: "Viac",
    cancel: "Zrušiť",
    left: "Zostáva {time}",
    today_at: "dnes {time}",
    tomorrow_at: "zajtra {time}",
    yesterday_at: "včera {time}",
    zoom_in: "Zobraziť podrobnosti",
    zoom_out: "Zobraziť menej",
    title: "Názov (voliteľné)",
    language: "Jazyk",
    lang_auto: "Automaticky",
    collapsed: "Predvolene zbalené sekcie",
    zoom: "Tlačidlo podrobností",
    zoom_helper: "Prepne mini kartu na obsah úplnej karty",
    show_title: "Zobraziť názov",
    show_subtitle: "Zobraziť podnadpis",
    no_registry: "Táto karta vyžaduje Home Assistant 2024.8 alebo novší.",
    unavailable: "Nedostupné",
  },
  cs: {
    timer: "Časovač",
    timers: "Časovače",
    counters: "Počítadla",
    ringing: "Zvoní",
    running_one: "1 běží",
    running_n: "Běží: {n}",
    paused: "Pozastaveno",
    paused_one: "1 pozastaven",
    paused_n: "Pozastaveno: {n}",
    none_running: "Žádný časovač neběží",
    done: "Hotovo",
    pause: "Pozastavit",
    resume: "Pokračovat",
    add_minute: "Přidat minutu",
    cancel_timer: "Zrušit",
    stop_ringing: "Zastavit",
    delete: "Smazat",
    ends_at: "Končí v {time}",
    of: "z {length}",
    quick_start: "Rychlý start · {name}",
    other: "Jiný",
    decrement: "Snížit",
    increment: "Zvýšit",
    start_timer: "Spustit {name}",
    no_data: "Nic k zobrazení: nebyl nalezen žádný časovač ani počítadlo.",
    timers_field: "Časovače (pomocníci, časovače Google Home a Alexa; prázdné: automaticky)",
    counters_field: "Počítadla (prázdné: automaticky)",
    quick_timer: "Časovač rychlého startu (výchozí: první nečinný)",
    show_hero: "Zobrazit další časovač zvětšený",
    show_timers: "Zobrazit časovače",
    show_quick: "Zobrazit rychlý start",
    show_counters: "Zobrazit počítadla",
    next_timer: "Potom: {name} v {time}",
    start: "Spustit",
    duration: "Doba trvání",
    less: "Méně",
    more: "Více",
    cancel: "Zrušit",
    left: "Zbývá {time}",
    today_at: "dnes {time}",
    tomorrow_at: "zítra {time}",
    yesterday_at: "včera {time}",
    zoom_in: "Zobrazit podrobnosti",
    zoom_out: "Zobrazit méně",
    title: "Název (volitelné)",
    language: "Jazyk",
    lang_auto: "Automaticky",
    collapsed: "Ve výchozím stavu sbalené sekce",
    zoom: "Tlačítko podrobností",
    zoom_helper: "Přepne mini kartu na obsah plné karty",
    show_title: "Zobrazit název",
    show_subtitle: "Zobrazit podtitul",
    no_registry: "Tato karta vyžaduje Home Assistant 2024.8 nebo novější.",
    unavailable: "Nedostupné",
  },
  sl: {
    timer: "Časovnik",
    timers: "Časovniki",
    counters: "Števci",
    ringing: "Zvoni",
    running_one: "1 teče",
    running_n: "Tečejo: {n}",
    paused: "Zaustavljen",
    paused_one: "1 zaustavljen",
    paused_n: "Zaustavljeni: {n}",
    none_running: "Noben časovnik ne teče",
    done: "Končano",
    pause: "Premor",
    resume: "Nadaljuj",
    add_minute: "Dodaj minuto",
    cancel_timer: "Prekliči",
    stop_ringing: "Ustavi",
    delete: "Izbriši",
    ends_at: "Konča se ob {time}",
    of: "od {length}",
    quick_start: "Hitri zagon · {name}",
    other: "Drugo",
    decrement: "Zmanjšaj",
    increment: "Povečaj",
    start_timer: "Zaženi {name}",
    no_data: "Ni česa prikazati: ni najdenega časovnika ali števca.",
    timers_field: "Časovniki (pomočniki, časovniki Google Home in Alexa; prazno: samodejno)",
    counters_field: "Števci (prazno: samodejno)",
    quick_timer: "Časovnik hitrega zagona (privzeto: prvi nedejavni)",
    show_hero: "Prikaži naslednji časovnik povečano",
    show_timers: "Prikaži časovnike",
    show_quick: "Prikaži hitri zagon",
    show_counters: "Prikaži števce",
    next_timer: "Nato: {name} ob {time}",
    start: "Zaženi",
    duration: "Trajanje",
    less: "Manj",
    more: "Več",
    cancel: "Prekliči",
    left: "Še {time}",
    today_at: "danes {time}",
    tomorrow_at: "jutri {time}",
    yesterday_at: "včeraj {time}",
    zoom_in: "Prikaži podrobnosti",
    zoom_out: "Prikaži manj",
    title: "Naslov (neobvezno)",
    language: "Jezik",
    lang_auto: "Samodejno",
    collapsed: "Privzeto strnjeni razdelki",
    zoom: "Gumb za podrobnosti",
    zoom_helper: "Preklopi mini kartico na vsebino polne kartice",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    no_registry: "Ta kartica potrebuje Home Assistant 2024.8 ali novejši.",
    unavailable: "Ni na voljo",
  },
  lv: {
    timer: "Taimeris",
    timers: "Taimeri",
    counters: "Skaitītāji",
    ringing: "Zvana",
    running_one: "1 darbojas",
    running_n: "Darbojas: {n}",
    paused: "Pauzēts",
    paused_one: "1 pauzēts",
    paused_n: "Pauzēti: {n}",
    none_running: "Neviens taimeris nedarbojas",
    done: "Gatavs",
    pause: "Pauze",
    resume: "Turpināt",
    add_minute: "Pievienot minūti",
    cancel_timer: "Atcelt",
    stop_ringing: "Apturēt",
    delete: "Dzēst",
    ends_at: "Beigsies {time}",
    of: "no {length}",
    quick_start: "Ātrā palaišana · {name}",
    other: "Cits",
    decrement: "Samazināt",
    increment: "Palielināt",
    start_timer: "Palaist {name}",
    no_data: "Nav ko rādīt: nav atrasts neviens taimeris vai skaitītājs.",
    timers_field: "Taimeri (palīgi, Google Home un Alexa taimeri; tukšs: automātiski)",
    counters_field: "Skaitītāji (tukšs: automātiski)",
    quick_timer: "Ātrās palaišanas taimeris (pēc noklusējuma: pirmais neaktīvais)",
    show_hero: "Rādīt nākamo taimeri lielu",
    show_timers: "Rādīt taimerus",
    show_quick: "Rādīt ātro palaišanu",
    show_counters: "Rādīt skaitītājus",
    next_timer: "Pēc tam: {name} {time}",
    start: "Sākt",
    duration: "Ilgums",
    less: "Mazāk",
    more: "Vairāk",
    cancel: "Atcelt",
    left: "Atlikušas {time}",
    today_at: "šodien {time}",
    tomorrow_at: "rīt {time}",
    yesterday_at: "vakar {time}",
    zoom_in: "Rādīt detaļas",
    zoom_out: "Rādīt mazāk",
    title: "Virsraksts (neobligāts)",
    language: "Valoda",
    lang_auto: "Automātiski",
    collapsed: "Pēc noklusējuma sakļautās sadaļas",
    zoom: "Detaļu poga",
    zoom_helper: "Pārslēdz mini kartīti uz pilnās kartītes saturu",
    show_title: "Rādīt virsrakstu",
    show_subtitle: "Rādīt apakšvirsrakstu",
    no_registry: "Šai kartītei nepieciešams Home Assistant 2024.8 vai jaunāks.",
    unavailable: "Nav pieejams",
  },
  el: {
    timer: "Χρονόμετρο",
    timers: "Χρονόμετρα",
    counters: "Μετρητές",
    ringing: "Χτυπάει",
    running_one: "1 σε λειτουργία",
    running_n: "{n} σε λειτουργία",
    paused: "Σε παύση",
    paused_one: "1 σε παύση",
    paused_n: "{n} σε παύση",
    none_running: "Κανένα χρονόμετρο σε λειτουργία",
    done: "Ολοκληρώθηκε",
    pause: "Παύση",
    resume: "Συνέχεια",
    add_minute: "Προσθήκη ενός λεπτού",
    cancel_timer: "Ακύρωση",
    stop_ringing: "Διακοπή",
    delete: "Διαγραφή",
    ends_at: "Λήγει στις {time}",
    of: "από {length}",
    quick_start: "Γρήγορη έναρξη · {name}",
    other: "Άλλο",
    decrement: "Μείωση",
    increment: "Αύξηση",
    start_timer: "Έναρξη {name}",
    no_data: "Τίποτα για εμφάνιση: δεν βρέθηκε χρονόμετρο ή μετρητής.",
    timers_field: "Χρονόμετρα (βοηθοί, χρονόμετρα Google Home και Alexa· κενό: αυτόματα)",
    counters_field: "Μετρητές (κενό: αυτόματα)",
    quick_timer: "Χρονόμετρο γρήγορης έναρξης (προεπιλογή: το πρώτο ανενεργό)",
    show_hero: "Εμφάνιση του επόμενου χρονομέτρου σε μεγάλο μέγεθος",
    show_timers: "Εμφάνιση των χρονομέτρων",
    show_quick: "Εμφάνιση της γρήγορης έναρξης",
    show_counters: "Εμφάνιση των μετρητών",
    next_timer: "Επόμενο: {name} στις {time}",
    start: "Έναρξη",
    duration: "Διάρκεια",
    less: "Λιγότερο",
    more: "Περισσότερο",
    cancel: "Ακύρωση",
    left: "Απομένουν {time}",
    today_at: "σήμερα {time}",
    tomorrow_at: "αύριο {time}",
    yesterday_at: "χθες {time}",
    zoom_in: "Εμφάνιση λεπτομερειών",
    zoom_out: "Εμφάνιση λιγότερων",
    title: "Τίτλος (προαιρετικό)",
    language: "Γλώσσα",
    lang_auto: "Αυτόματα",
    collapsed: "Ενότητες συμπτυγμένες από προεπιλογή",
    zoom: "Κουμπί λεπτομερειών",
    zoom_helper: "Αλλάζει τη μίνι κάρτα στο περιεχόμενο της πλήρους κάρτας",
    show_title: "Εμφάνιση τίτλου",
    show_subtitle: "Εμφάνιση υπότιτλου",
    no_registry: "Αυτή η κάρτα απαιτεί Home Assistant 2024.8 ή νεότερο.",
    unavailable: "Μη διαθέσιμο",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_ICONS = {
  chevron_down: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
  alert: "M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z",
  plus: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
  minus: "M19,13H5V11H19V13Z",
  play: "M8,5.14V19.14L19,12.14L8,5.14Z",
  pause: "M14,19H18V5H14M6,19H10V5H6V19Z",
  stop: "M18,18H6V6H18V18Z",
  check: "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",
  close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
};
const ICONS = { ...BASE_ICONS, ...CARD_ICONS };

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

// Locale for Intl: the card's language, or Home Assistant's full locale when it has the same base (pt-BR, de-CH).
// A bare "pt" (Home Assistant's code for European Portuguese) becomes "pt-PT", otherwise Intl formats it the Brazilian way.
const intlLocale = (hass, config) => {
  const l = lang(hass, config);
  const src = config?.language || (hass && (hass.locale?.language || hass.language)) || "";
  const out = src && src.split("-")[0] === l.split("-")[0] ? src : l;
  return out === "pt" ? "pt-PT" : out;
};

const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

const valid = (s) => !!s && !["unknown", "unavailable", ""].includes(s.state);

const num = (s) => {
  if (!valid(s)) return null;
  const v = parseFloat(s.state);
  return Number.isFinite(v) ? v : null;
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
// Attributes of an element that opens an entity's more-info (nothing without an entity).
const moreInfo = (id) => (id ? ` role="button" tabindex="0" data-entity="${esc(id)}"` : "");
const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
const domainOf = (id) => String(id || "").split(".")[0];
const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);


// "8:12", "1:05:00": a countdown, rounded up to the second.
const fmtCountdown = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
};

// A time stamp (ISO string, sensor state or input_datetime "YYYY-MM-DD HH:MM:SS") in ms; null otherwise.
const parseTime = (v) => {
  if (v === null || v === undefined || v === "" || v === "unknown" || v === "unavailable") return null;
  if (typeof v === "number") return v > 1e11 ? v : v * 1000;
  const s = String(v);
  const ms = Date.parse(/^\d{4}-\d{2}-\d{2} \d/.test(s) ? s.replace(" ", "T") : s);
  return Number.isFinite(ms) ? ms : null;
};


const fmtTime = (hass, config, ms) =>
  new Intl.DateTimeFormat(intlLocale(hass, config), { hour: "numeric", minute: "2-digit" }).format(new Date(ms));




const devName = (d) => d?.name_by_user || d?.name || "";
const nameOf = (hass, id, fallback) => fallback || hass.states[id]?.attributes?.friendly_name || id;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { --tm-accent: #fb8c00; --tm-ok: var(--success-color, #43a047); --tm-warn: var(--warning-color, #ffa600);
          --tm-crit: var(--error-color, #db4437); --tm-idle: var(--disabled-text-color, #9e9e9e); --tm-active: var(--info-color, #039be5);
          /* Text in a state color is mixed with the text color so that it reads at 4.5:1 at least. */
          --tm-accent-text: color-mix(in srgb, var(--tm-accent) 50%, var(--primary-text-color)); }
  ha-card { overflow: hidden; container-type: inline-size; }
  /* Natural width in a parent that sizes to its content (inline-block, grid "auto" column), without a minimum. */
  :host { display: block; min-width: 0; --tm-natural-width: 380px; }
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, var(--tm-natural-width)); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible { outline: 2px solid var(--primary-color, var(--tm-accent)); outline-offset: 2px; border-radius: 4px; }
  .ok { --c: var(--tm-ok); } .warn { --c: var(--tm-warn); } .crit { --c: var(--tm-crit); } .idle { --c: var(--tm-idle); }
  .active { --c: var(--tm-active); } .accent { --c: var(--tm-accent); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--tm-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; white-space: nowrap;
          background: color-mix(in srgb, var(--c, var(--tm-ok)) 15%, transparent); color: color-mix(in srgb, var(--c, var(--tm-ok)) 50%, var(--primary-text-color));
          flex: 0 1 auto; min-width: 0; max-width: 50%; overflow: hidden; box-sizing: border-box; }
  .chip-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 0; }
  /* The chip sits on the title's line, whether a subtitle follows or not. */
  .header .chip, .header .zoom { align-self: flex-start; margin-top: 10px; }
  .type-icon { position: relative; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex: none;
               --tm-tint: var(--c, var(--tm-accent)); background: color-mix(in srgb, var(--tm-tint) 16%, transparent); transition: background-color .3s ease; }
  .type-icon .icon { width: 24px; height: 24px; fill: color-mix(in srgb, var(--tm-tint) 60%, var(--primary-text-color)); transition: fill .3s ease; }
  .titles { flex: 1 1 0; min-width: 5ch; }
  :host([hide-title]) .titles > .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .warning { padding: 16px; color: color-mix(in srgb, var(--tm-warn) 50%, var(--primary-text-color)); }
  /* Buttons as on the other cards: a smoked-glass background (never a filled color), the icon in the accent color. */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; cursor: pointer; font: inherit; font-size: 13px;
         font-weight: 500; padding: 6px 12px; border-radius: 18px; background: var(--secondary-background-color, rgba(127,127,127,.12));
         color: var(--primary-text-color); min-width: 0; }
  .btn span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .btn:not(:disabled):hover { background: color-mix(in srgb, var(--tm-accent) 12%, var(--secondary-background-color, rgba(127,127,127,.12))); }
  .btn .icon { width: 18px; height: 18px; color: var(--tm-accent); }
  .btn.primary { background: color-mix(in srgb, var(--tm-accent) 16%, transparent); color: var(--tm-accent-text); }
  .btn.primary:not(:disabled):hover { background: color-mix(in srgb, var(--tm-accent) 24%, transparent); }
  .btn.active { background: color-mix(in srgb, var(--tm-active) 16%, transparent); color: color-mix(in srgb, var(--tm-active) 50%, var(--primary-text-color)); }
  .btn.active .icon { color: var(--tm-active); }
  .btn.round { width: 36px; height: 36px; padding: 0; border-radius: 50%; flex: none; }
  .btn:disabled { opacity: .45; cursor: default; }
  .btn:focus-visible { outline: 2px solid var(--primary-color, var(--tm-accent)); outline-offset: 2px; }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px -4px -4px 0; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--tm-idle) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, var(--tm-accent)); outline-offset: 1px; }
  .line { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--secondary-text-color); min-width: 0; }
  .line .icon { width: 16px; height: 16px; }
  .line span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .line.ok, .line.warn, .line.crit, .line.active, .line.accent { color: color-mix(in srgb, var(--c) 50%, var(--primary-text-color)); }
  .line.ok .icon, .line.warn .icon, .line.crit .icon, .line.active .icon, .line.accent .icon { color: var(--c); }
  .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .num { font-variant-numeric: tabular-nums; }
  .content { padding: 8px 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin-bottom: 6px; }
  .section-title.toggle { cursor: pointer; user-select: none; }
  .section-title .icon { width: 16px; height: 16px; }
  .section-title span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .section-title .count { margin-left: 2px; text-transform: none; letter-spacing: 0; font-weight: 400; }
  .section-title.toggle[aria-expanded="false"] { margin-bottom: 0; }
  /* Folded: the chevron points right; unfolded: down. */
  .section-title .chevron { margin-left: auto; width: 16px; height: 16px; transition: transform .2s ease; }
  .section-title.toggle[aria-expanded="false"] .chevron { transform: rotate(-90deg); }
  .empty { font-size: 13px; color: var(--secondary-text-color); padding: 2px 0; }
  .ring-svg { position: absolute; inset: 0; transform: rotate(-90deg); }
  .ring-svg circle { fill: none; }
  .ring-svg .track { stroke: color-mix(in srgb, var(--c, var(--tm-accent)) 18%, transparent); }
  .ring-svg .prog { stroke: var(--c, var(--tm-accent)); stroke-linecap: round; transition: stroke-dashoffset 1s linear; }
  /* Hero, as on the garden and tempo cards: a flat illustration on the left, a big value and a few colored lines on the right. */
  .hero { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .hero-art { flex: none; width: 120px; display: grid; place-items: center; }
  .hero-art svg { width: 100%; height: auto; display: block; }
  .hero-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
  .hero-kick { font-size: 12px; color: var(--secondary-text-color); }
  .big { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
  .big .icon { width: 24px; height: 24px; align-self: center; color: var(--c, var(--tm-accent)); }
  .big b { font-size: 30px; font-weight: 400; line-height: 1; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .big span { font-size: 14px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hero .line { font-size: 12.5px; }
  /* Rows, as the watering zones: a round icon (grey at rest, tinted otherwise, a ring while it runs), name, colored state, a button. */
  .row { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .row-icon { position: relative; width: 40px; height: 40px; border-radius: 50%; flex: none; display: grid; place-items: center;
              --t: var(--c, var(--tm-idle)); background: color-mix(in srgb, var(--t) 18%, transparent); color: color-mix(in srgb, var(--t) 70%, var(--primary-text-color)); }
  .row-icon.idle { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); color: var(--secondary-text-color); }
  .row-icon > .icon, .row-icon > ha-icon { width: 22px; height: 22px; --mdc-icon-size: 22px; }
  .row-icon .ring-svg { inset: -2px; width: 44px; height: 44px; }
  .badge { position: absolute; right: -3px; bottom: -3px; width: 17px; height: 17px; border-radius: 50%; display: grid; place-items: center;
           background: var(--b, var(--tm-ok)); color: #fff; box-shadow: 0 0 0 2px var(--ha-card-background, var(--card-background-color, #fff)); }
  .badge .icon { width: 11px; height: 11px; }
  .row-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .row-name { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row-state { font-size: 12.5px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row-state.ok, .row-state.warn, .row-state.crit, .row-state.active, .row-state.accent { color: color-mix(in srgb, var(--c) 60%, var(--primary-text-color)); }
  .rows { display: flex; flex-direction: column; gap: 8px; }
  /* Tiles, as on room overview: grey, tinted with a border when they need a look; small badges below. */
  .tiles { display: grid; gap: 8px; grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr)); }
  .tile { min-width: 0; display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: 10px; box-sizing: border-box;
          background: var(--secondary-background-color, rgba(127,127,127,.12)); border: 1px solid transparent; }
  .tile.tint { background: color-mix(in srgb, var(--c) 13%, var(--secondary-background-color, rgba(127,127,127,.12)));
               border-color: color-mix(in srgb, var(--c) 30%, transparent); }
  .tile-head { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .tile .row-icon { width: 30px; height: 30px; } .tile .row-icon > .icon { width: 18px; height: 18px; }
  .tile .row-state { font-size: 12px; }
  .badges { display: flex; gap: 4px; flex-wrap: wrap; }
  .pill { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; padding: 1px 7px; border-radius: 10px;
          color: color-mix(in srgb, var(--c, var(--tm-idle)) 60%, var(--primary-text-color)); background: color-mix(in srgb, var(--c, var(--tm-idle)) 14%, transparent); }
  .pill .icon { width: 14px; height: 14px; color: var(--c, var(--tm-idle)); }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  @container (max-width: 230px) {
    .chip { padding: 4px; flex: none; }
    .chip-text { display: none; }
    .header { gap: 6px; }
  }
`;

// Popup at the top of the card, over a backdrop: it stays in view on a long card.
const DIALOG_STYLE = `
  ha-card.dialog-open { position: relative; min-height: 220px; }
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
           box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 12px; }
  .modal .msg { font-size: 15px; font-weight: 500; line-height: 1.3; overflow-wrap: anywhere; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
  .stepper { display: flex; align-items: center; justify-content: center; gap: 14px; }
  .stepper .val { font-size: 28px; font-weight: 400; min-width: 4ch; text-align: center; }
  .stepper .val small { font-size: 14px; color: var(--secondary-text-color); margin-left: 2px; }
  .presets { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
  .preset { font: inherit; font-size: 12px; padding: 4px 10px; border-radius: 14px; cursor: pointer; color: var(--primary-text-color);
            background: transparent; border: 1px solid color-mix(in srgb, var(--primary-text-color) 16%, transparent); }
  .preset.on { border-color: color-mix(in srgb, var(--tm-accent) 60%, transparent); color: var(--tm-accent-text); font-weight: 500;
               background: color-mix(in srgb, var(--tm-accent) 10%, transparent); }
  .field { font: inherit; font-size: 15px; width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 10px; color: var(--primary-text-color);
           background: transparent; border: 1px solid color-mix(in srgb, var(--primary-text-color) 20%, transparent); }
  .field:focus { outline: 2px solid var(--primary-color, var(--tm-accent)); outline-offset: -1px; }
`;

// The mini card: header and a compact row; its detail button switches it to the full card's content.
const MINI_STYLE = `
  :host { --tm-natural-width: 300px; }
  .content.mini { flex-direction: row; align-items: center; gap: 12px; }
  .mini .info { gap: 4px; }
  .mini .line .icon { width: 14px; height: 14px; }
  .controls { display: flex; gap: 6px; flex: none; }
  @container (max-width: 300px) {
    .content.mini { flex-wrap: wrap; row-gap: 8px; }
    .mini .controls { flex-basis: 100%; justify-content: flex-end; }
  }
`;

// Element names of Home Assistant dialogs (a more-info opened from the card): a click there is not "elsewhere".
const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);
const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app) a
// tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to the
// page. It counts when the press and the release are both outside the card (a slider dragged out of the card does not
// fold it), and a scroll does not count (the browser cancels the pointer). Keyboard clicks still go through the click
// event. `tap(ev)` (a press and a release at the same spot) is for the tests.
const watchOutside = (isOut, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = isOut(ev);
  };
  const onUp = (ev) => {
    if (downOutside && isOut(ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && isOut(ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
  };
};
// After a popup closes, clicks on the card are ignored this long (the second click of a double click).
const CONFIRM_GUARD_MS = 400;
// Elements a click acts on, and how one is told from the others across renders (focus kept for keyboard users).
const FOCUS_SELECTOR = "[data-action], [data-entity], [data-keep]";
const focusKey = (el) => {
  const data = Object.entries({ ...el.dataset });
  return data.length ? `${el.tagName}|${JSON.stringify(data)}` : "";
};
// A progress ring (SVG, size × size, stroke width w) whose progress `p` (0..1) is drawn; `end` and `total` (ms) make it
// count down every second in place (see _syncCountdown).
const ring = (size, w, p, { end, total } = {}) => {
  const r = (size - w) / 2;
  const c = 2 * Math.PI * r;
  const live = end && total ? ` data-end="${end}" data-total="${total}" data-c="${c.toFixed(2)}"` : "";
  return `<svg class="ring-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${w}"/><circle class="prog" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${w}" stroke-dasharray="${c.toFixed(2)}" style="stroke-dashoffset:${(c * (1 - clamp(p, 0, 1))).toFixed(2)}"${live}/></svg>`;
};

// ---------------------------------------------------------------------------
// Card base
// ---------------------------------------------------------------------------

// What every card of this file shares: rendering only when something shown changed, no rewrite under a press, focus
// kept for keyboard users, folding sections, a popup at the top of the card, live countdowns, service calls.
// A card defines _build() (its model from the registries and the configuration), _entityIds(m), _render(), and may
// define _action(action, el, ev), _dialogHtml() / _dialogAction(action, el), _extraDeps(), _onConnect() / _onDisconnect().
class CardBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this._inputs = {};
    // No rewrite of the card between a press and its click: Home Assistant updates the card several times a second,
    // and a rewrite under the pointer replaces the element pressed, so that the click lands on the card itself and
    // does nothing. The update held back is drawn once released: by the click (registered before the card's own
    // handler, which renders at once), else right after the release.
    this._onPress = () => {
      this._byPointer = true;
      this._pressing = true;
      window.addEventListener("pointerup", this._onPressEnd, true);
      window.addEventListener("pointercancel", this._onPressEnd, true);
    };
    this._onPressEnd = () => {
      window.removeEventListener("pointerup", this._onPressEnd, true);
      window.removeEventListener("pointercancel", this._onPressEnd, true);
      setTimeout(() => {
        this._pressing = false;
        if (this._dirty) this._update();
      }, 0);
    };
    this._onPressClick = (ev) => {
      if (ev.detail === 0) this._byPointer = false;
      this._pressing = false;
    };
    this.shadowRoot.addEventListener("pointerdown", this._onPress);
    this.shadowRoot.addEventListener("click", this._onPressClick);
    // From the keyboard, the focus is kept across rewrites (with the pointer it would draw the focus ring).
    this.shadowRoot.addEventListener("keydown", () => {
      this._byPointer = false;
    });
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    // Text typed in a field of the card is kept across rewrites (see _update); Enter in it acts as its button.
    this.shadowRoot.addEventListener("input", (ev) => {
      const key = ev.target?.dataset?.keep;
      if (key) this._inputs[key] = ev.target.value;
    });
    this.shadowRoot.addEventListener("keydown", (ev) => {
      const el = ev.target;
      if (ev.key === "Enter" && el?.dataset?.keep && el.dataset.submit) {
        ev.preventDefault();
        this._onClick({ composedPath: () => [{ dataset: { action: el.dataset.submit } }], stopPropagation() {}, detail: 0 });
        return;
      }
      // Enter / Space on an element with the button role acts as a click, as on a <button>.
      if ((ev.key !== "Enter" && ev.key !== " ") || el?.getAttribute?.("role") !== "button") return;
      ev.preventDefault();
      el.click();
    });
    this._onKey = (ev) => {
      if (ev.key !== "Escape" || !this._dialog) return;
      ev.stopPropagation();
      this._closeDialog();
    };
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    return 6;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._html = "";
    this._lastDeps = null;
    this._model = null;
    this._configChanged?.();
    this._update();
  }

  // Home Assistant pushes a new hass on every state change of the whole instance: the card is only rebuilt when
  // something it shows changed (see _deps).
  set hass(hass) {
    this._hass = hass;
    const deps = this._deps();
    const prev = this._lastDeps;
    if (deps && prev && deps.length === prev.length && deps.every((d, i) => d === prev[i])) return;
    this._lastDeps = deps;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  // The registries, the language, the theme, the state objects the card reads, its own data and the minute (the
  // "12 min ago" texts move on their own).
  _deps() {
    const h = this._hass;
    if (!h || !this._config) return null;
    const m = this._resolve();
    const ids = m ? this._entityIds(m) : [];
    return [h.entities, h.devices, h.areas, h.language, h.locale, h.themes?.darkMode, Math.floor(Date.now() / 6e4), ...this._extraDeps(), ...ids.map((id) => h.states[id])];
  }

  _extraDeps() {
    return [];
  }

  // The model is rebuilt when the registries or the set of entities change (a new entity, a device renamed).
  _resolve() {
    const h = this._hass;
    if (!h?.entities || !h?.devices) return null;
    const key = [h.entities, h.devices, h.areas, Object.keys(h.states).length];
    if (this._model && this._modelKey?.every((k, i) => k === key[i])) return this._model;
    this._modelKey = key;
    this._model = this._build();
    return this._model;
  }

  connectedCallback() {
    // A click elsewhere on the page folds the sections back to their defaults and closes the popup.
    this._outside ??= watchOutside(
      (ev) => isOutside(this, ev),
      () => {
        if (!this._toggled?.size && !this._dialog) return;
        this._toggled = new Map();
        if (this._dialog) this._closeDialog();
        else this._update();
      },
    );
    this._outside.on();
    if (this._dialog) window.addEventListener("keydown", this._onKey);
    clearInterval(this._tick);
    this._tick = setInterval(() => {
      if (this._hass) this.hass = this._hass;
    }, 60000);
    this._onConnect?.();
    this._update();
  }

  disconnectedCallback() {
    this._pressing = this._dirty = false;
    window.removeEventListener("pointerup", this._onPressEnd, true);
    window.removeEventListener("pointercancel", this._onPressEnd, true);
    clearInterval(this._tick);
    clearInterval(this._countdown);
    this._tick = this._countdown = null;
    this._outside?.off();
    window.removeEventListener("keydown", this._onKey);
    this._onDisconnect?.();
    // Left (another dashboard view, a conditional card hidden): back to the defaults, so that the card does not come
    // back unfolded or with its popup open.
    this._toggled = new Map();
    this._dialog = null;
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  _locale() {
    return intlLocale(this._hass, this._config);
  }

  _s(id) {
    return id ? this._hass.states[id] : undefined;
  }

  // Service call whose failure Home Assistant already reports (toast): handled here so that it does not end up as
  // "Uncaught (in promise)".
  _call(domain, service, data) {
    const r = this._hass.callService(domain, service, data);
    if (r && typeof r.catch === "function") r.catch(() => {});
    return r;
  }

  // A websocket command, through hass.callWS (or the connection), resolved with null on error.
  async _ws(msg) {
    const h = this._hass;
    try {
      if (h.callWS) return await h.callWS(msg);
      if (h.connection?.sendMessagePromise) return await h.connection.sendMessagePromise(msg);
    } catch {
      return null;
    }
    return null;
  }

  _update() {
    if (!this._hass || !this._config) return;
    // Held back under a press (see the constructor): drawn once released.
    if (this._pressing) {
      this._dirty = true;
      return;
    }
    this._dirty = false;
    let html = this._render();
    if (this._dialog) {
      html = html.replace(/<ha-card(\s[^>]*)?>([\s\S]*)<\/ha-card>\s*$/, (_, attrs = "", inner) => {
        const a = attrs.includes('class="') ? attrs.replace('class="', 'class="dialog-open ') : `${attrs} class="dialog-open"`;
        return `<ha-card${a}>${inner}<style>${DIALOG_STYLE}</style>${this._dialogHtml()}</ha-card>`;
      });
    }
    if (html !== this._html) {
      const active = this.shadowRoot.activeElement;
      const field = active?.dataset?.keep ? { key: active.dataset.keep, start: active.selectionStart, end: active.selectionEnd } : null;
      const focused = this._dialog && active?.dataset?.action;
      const kept = this._dialog || this._byPointer ? null : this._focusedSpot();
      this._html = html;
      this.shadowRoot.innerHTML = html;
      // Fields get back what was typed, and the caret when one had the focus.
      for (const el of this.shadowRoot.querySelectorAll?.("[data-keep]") || []) {
        const v = this._inputs[el.dataset.keep];
        if (v !== undefined) el.value = v;
      }
      if (field) {
        const el = this.shadowRoot.querySelector(`[data-keep="${field.key}"]`);
        el?.focus?.({ preventScroll: true });
        el?.setSelectionRange?.(field.start, field.end);
      } else if (kept) this._restoreFocus(kept);
      if (this._dialog && !field) {
        const sel = focused ? `.modal [data-action="${focused}"]` : ".modal [data-keep], .modal .primary";
        this.shadowRoot.querySelector(sel)?.focus?.({ preventScroll: true });
      }
    }
    this._syncCountdown();
    this._afterUpdate?.();
  }

  // Countdowns move every second in place (no re-render, which would restart the animations): the text of [data-end]
  // elements, and the arc of rings (data-total and data-c). The card is redrawn once a countdown ends.
  _syncCountdown() {
    const els = [...(this.shadowRoot.querySelectorAll?.("[data-end]") || [])];
    if (!els.length) {
      clearInterval(this._countdown);
      this._countdown = null;
      return;
    }
    if (this._countdown) return;
    this._countdown = setInterval(() => {
      const now = Date.now();
      let ended = false;
      for (const el of this.shadowRoot.querySelectorAll("[data-end]")) {
        const left = Number(el.dataset.end) - now;
        if (left <= 0) ended = true;
        if (el.dataset.total) {
          const offset = (Number(el.dataset.c) * (1 - clamp(left / Number(el.dataset.total), 0, 1))).toFixed(2);
          if (el.style.strokeDashoffset !== offset) el.style.strokeDashoffset = offset;
        } else {
          const text = el.dataset.fmt === "left" ? this._t("left", { time: fmtCountdown(left) }) : fmtCountdown(left);
          if (el.textContent !== text) el.textContent = text;
        }
      }
      if (ended) {
        clearInterval(this._countdown);
        this._countdown = null;
        this._lastDeps = null;
        this._update();
      }
    }, 1000);
  }

  _focusedSpot() {
    const el = this.shadowRoot.activeElement;
    if (!el?.dataset) return null;
    const key = focusKey(el);
    if (!key) return null;
    const index = this._focusables(key).indexOf(el);
    return index < 0 ? null : { key, index };
  }

  _focusables(key) {
    return [...this.shadowRoot.querySelectorAll(FOCUS_SELECTOR)].filter((n) => focusKey(n) === key);
  }

  _restoreFocus({ key, index }) {
    this._focusables(key)[index]?.focus({ preventScroll: true });
  }

  _onClick(ev) {
    const path = ev.composedPath();
    const el = path.find((n) => n.dataset && (n.dataset.entity || n.dataset.action));
    if (!this._dialog && Date.now() - (this._dialogClosedAt ?? 0) < CONFIRM_GUARD_MS) {
      ev.stopPropagation();
      return;
    }
    if (this._dialog) {
      ev.stopPropagation();
      const action = el?.dataset.action;
      if (action === "dialog_cancel" || (action === "dialog_backdrop" && path[0] === el)) return this._closeDialog();
      if (action) this._dialogAction(action, el);
      return;
    }
    if (!el) return;
    ev.stopPropagation();
    const { action, entity } = el.dataset;
    if (action === "zoom") return this._toggleZoom(ev);
    if (action === "toggle_section") {
      const key = el.dataset.section;
      this._toggled = new Map(this._toggled).set(key, !this._isCollapsed(key));
      return this._update();
    }
    if (action && this._action(action, el, ev)) return;
    if (entity) this._moreInfo(entity);
  }

  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  _action() {
    return false;
  }

  _dialogAction() {}

  _dialogHtml() {
    return "";
  }

  _openDialog(d) {
    this._dialog = d;
    window.addEventListener("keydown", this._onKey);
    this._update();
    this.shadowRoot.querySelector(".modal [data-keep], .modal .primary")?.focus?.();
  }

  _closeDialog() {
    this._dialog = null;
    this._dialogClosedAt = Date.now();
    window.removeEventListener("keydown", this._onKey);
    this._update();
  }

  // The popup's frame: a message, the content and its buttons (cancel, then the main action).
  _modal(title, body, okLabel, okIcon, okDisabled = false) {
    return `<div class="backdrop" data-action="dialog_backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="msg">${esc(title)}</div>
        ${body}
        <div class="modal-actions">
          <button class="btn" data-action="dialog_cancel"><span>${esc(this._t("cancel"))}</span></button>
          <button class="btn primary" data-action="dialog_ok"${okDisabled ? " disabled" : ""}>${okIcon ? svgIcon(okIcon) : ""}<span>${esc(okLabel)}</span></button>
        </div>
      </div>
    </div>`;
  }

  _isCollapsed(key) {
    if (this._toggled?.has(key)) return this._toggled.get(key);
    return asList(this._config.collapsed ?? this.constructor.defaultCollapsed ?? []).includes(key);
  }

  _sectionTitle(key, icon, label, count = "") {
    const closed = this._isCollapsed(key);
    return `<div class="section-title toggle" role="button" tabindex="0" data-action="toggle_section" data-section="${key}" aria-expanded="${!closed}">${svgIcon(icon)}<span>${esc(
      label,
    )}</span>${count !== "" ? `<span class="count">${esc(count)}</span>` : ""}${svgIcon(ICONS.chevron_down, "chevron")}</div>`;
  }

  // A folding section: its title, and its body unless folded.
  _section(key, icon, label, count, body) {
    return `<div class="section">${this._sectionTitle(key, icon, label, count)}${this._isCollapsed(key) ? "" : body}</div>`;
  }

  // The model ready to draw, or the error card to draw instead: no registries (Home Assistant too old), or nothing to
  // show (_emptyKey(m) names the message).
  _ready() {
    const m = this._resolve();
    if (!m) return { error: this._errorCard("no_registry") };
    const empty = this._emptyKey(m);
    return empty ? { error: this._errorCard(empty) } : { m };
  }

  _emptyKey() {
    return null;
  }

  _errorCard(key) {
    return `<style>${BASE_STYLE}</style><ha-card><div class="warning">${esc(this._t(key))}</div></ha-card>`;
  }

  // Header: the tinted round icon (its tint follows `cls`), the title and subtitle, the status chip on the title's line.
  _header({ icon, cls = "accent", title, sub, chip, extra = "" }) {
    return `
      <div class="header">
        <div class="type-icon ${cls}">${extra}${svgIcon(icon)}</div>
        <div class="titles">
          <div class="name">${esc(title)}</div>
          ${sub ? `<div class="sub">${esc(sub)}</div>` : ""}
        </div>
        ${
          chip
            ? `<span class="chip ${chip.cls}${chip.entity ? " clickable" : ""}"${moreInfo(chip.entity)} title="${esc(chip.text)}" aria-label="${esc(
                chip.text,
              )}"><span class="dot"></span><span class="chip-text">${esc(chip.text)}</span></span>`
            : ""
        }
        ${this._zoomButton()}
      </div>`;
  }

  _zoomButton() {
    return "";
  }

  _toggleZoom() {}
}

// The mini card is the full card drawn compact: its detail button (top right, `zoom: false` removes it) switches it
// to the full card's content and back, and a click anywhere else on the page brings the compact view back.
const withMini = (Full) =>
  class extends Full {
    constructor() {
      super();
      this._unzoom = watchOutside(
        (ev) => isOutside(this, ev),
        () => {
          if (this._zoomed && !this._dialog) this._setZoom(false);
        },
      );
    }

    connectedCallback() {
      super.connectedCallback();
      this._unzoom.on();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this._unzoom.off();
      // Back to the compact view once off the screen (see the full card).
      this._zoomed = false;
    }

    getCardSize() {
      return this._zoomed ? super.getCardSize() : 3;
    }

    getGridOptions() {
      return { ...(this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 }), rows: "auto" };
    }

    _zoomButton() {
      if (this._config.zoom === false) return "";
      const z = this._zoomed;
      const label = esc(this._t(z ? "zoom_out" : "zoom_in"));
      return `<button class="zoom" data-action="zoom" title="${label}" aria-label="${label}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
    }

    _setZoom(on) {
      this._zoomed = on;
      this._update();
      this.dispatchEvent(new CustomEvent("iron-resize", { bubbles: true, composed: true }));
    }

    _toggleZoom(ev) {
      this._setZoom(!this._zoomed);
      if (ev.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
    }

    _render() {
      return this._zoomed ? super._render() : this._renderMini();
    }
  };

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

const LANGUAGES = [
  ["en", "English"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["sr", "Српски"],
  ["sr-Latn", "Srpski (latinica)"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["pt", "Português (Portugal)"],
  ["pl", "Polski"],
  ["ro", "Română"],
  ["da", "Dansk"],
  ["sv", "Svenska"],
  ["bg", "Български"],
  ["ru", "Русский"],
  ["uk", "Українська"],
  ["hu", "Magyar"],
  ["sk", "Slovenčina"],
  ["cs", "Čeština"],
  ["sl", "Slovenščina"],
  ["lv", "Latviešu"],
  ["el", "Ελληνικά"],
];

// An editor is a ha-form: `fields` (the card's options), `toggles` ([name, default] booleans), `defaults` (options
// left out of the YAML when at their default), `sections` (the foldable sections, for `collapsed`). Options written
// in YAML that the form does not show are kept.
class EditorBase extends HTMLElement {
  static get toggles() {
    return [];
  }

  static get defaults() {
    return {};
  }

  static get sections() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _fields() {
    return [];
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    const toggles = this.constructor.toggles;
    const sections = this.constructor.sections;
    return [
      { name: "title", selector: { text: {} } },
      ...this._fields(),
      ...(toggles.length ? [{ type: "grid", name: "", schema: toggles.map(([name]) => ({ name, selector: { boolean: {} } })) }] : []),
      ...(sections.length ? [{ name: "collapsed", selector: { select: { multiple: true, mode: "list", options: sections.map((value) => ({ value, label: tr(value) })) } } }] : []),
      { name: "language", selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANGUAGES.map(([value, label]) => ({ value, label }))] } } },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const toggles = this.constructor.toggles;
    const defaults = { ...Object.fromEntries(toggles), ...this.constructor.defaults };
    if (!this._form) {
      this._form = document.createElement("ha-form");
      // A field's label is its `<name>_field` text when the card also uses `<name>` for something else (a section).
      this._form.computeLabel = (s) => t(this._hass, this._config, STRINGS.en[`${s.name}_field`] ? `${s.name}_field` : s.name);
      this._form.computeHelper = (s) => (STRINGS.en[`${s.name}_helper`] ? t(this._hass, this._config, `${s.name}_helper`) : undefined);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        for (const [k, v] of Object.entries(config)) {
          // Keep the YAML minimal: no empty values, no options left at their default.
          if (v === "" || v === undefined || v === null || (Array.isArray(v) && !v.length) || (k in defaults && JSON.stringify(v) === JSON.stringify(defaults[k]))) delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    if (this._formConfig !== this._config) {
      this._formConfig = this._config;
      this._form.data = { ...defaults, ...this._config };
    }
    const l = lang(this._hass, this._config);
    if (this._schemaLang !== l) {
      this._schemaLang = l;
      this._form.schema = this._schema();
    }
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};

const register = (cards, url) => {
  for (const [name, cls] of cards) define(name, cls);
  window.customCards = window.customCards || [];
  for (const [type, , card] of cards) {
    if (card && !window.customCards.some((c) => c.type === type)) window.customCards.push({ type, ...card, preview: true, documentationURL: url });
  }
};

// ---------------------------------------------------------------------------
// Durations and discovery
// ---------------------------------------------------------------------------

// A duration in ms from "H:MM:SS", "1 day, 2:00:00", "MM:SS" or a number of seconds; null otherwise.
const parseDuration = (v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v * 1000;
  const s = String(v).trim();
  if (/^\d+(\.\d+)?$/.test(s)) return Number(s) * 1000;
  const m = /^(?:(\d+) days?,\s*)?(?:(\d+):)?(\d+):(\d+)(?:\.\d+)?$/.exec(s);
  if (!m) return null;
  return (((Number(m[1] || 0) * 24 + Number(m[2] || 0)) * 60 + Number(m[3])) * 60 + Number(m[4])) * 1000;
};

// "0:05:00": a number of minutes as the timer services take it.
const durationText = (minutes) => {
  const total = Math.round(minutes * 60);
  return `${Math.floor(total / 3600)}:${String(Math.floor((total % 3600) / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

// Where timers come from: timer helpers, Google Home timers sensors, Alexa Media Player next-timer sensors and the
// "Next timer" sensors of Alexa Devices (core; their alarm and reminder sensors are left out).
const sourceKind = (hass, id) => {
  const e = hass.entities?.[id];
  if (domainOf(id) === "timer") return "timer";
  if (e?.platform === "google_home" || /_timers$/.test(id)) return "google_home";
  if (e?.platform === "alexa_devices") return e.translation_key === "timer" ? "alexa_devices" : null;
  if (e?.platform === "alexa_media" || /_next_timer$/.test(id)) return "alexa_media";
  return null;
};

// The active timers of Alexa Media Player: a list of objects, or in older versions a JSON string, or a list of
// [id, timer] pairs.
const alexaTimers = (raw) => {
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
const STALE_MS = 6e4;

const _cache = new WeakMap();

// The timer sources and the counters of the configuration, else every timer helper, Google Home timers sensor,
// Alexa next-timer sensor and counter helper.
const resolve = (hass, config) => {
  let per = _cache.get(hass.entities);
  if (!per) _cache.set(hass.entities, (per = new Map()));
  const sig = `${JSON.stringify([config.timers, config.counters])}|${Object.keys(hass.states).length}`;
  if (per.has(sig)) return per.get(sig);
  const byName = (a, b) => nameOf(hass, a).localeCompare(nameOf(hass, b));
  let timers;
  if (config.timers) {
    timers = asList(config.timers)
      .map((x) => (typeof x === "string" ? { entity: x } : x))
      .filter((x) => x?.entity && sourceKind(hass, x.entity))
      .map((x) => ({ ...x, kind: sourceKind(hass, x.entity) }));
  } else {
    const ids = Object.keys(hass.states);
    const helpers = ids.filter((id) => domainOf(id) === "timer").sort(byName);
    const speakers = Object.values(hass.entities || {})
      .filter((e) => domainOf(e.entity_id) === "sensor" && hass.states[e.entity_id] && ((e.platform === "google_home" && (e.translation_key === "timers" || /_timers$/.test(e.entity_id))) || (e.platform === "alexa_media" && (e.translation_key === "next_timer" || /_next_timer$/.test(e.entity_id))) || (e.platform === "alexa_devices" && e.translation_key === "timer")))
      .map((e) => e.entity_id)
      .sort(byName);
    timers = [...helpers, ...speakers].map((entity) => ({ entity, kind: sourceKind(hass, entity) }));
  }
  const counters = config.counters
    ? asList(config.counters).map((x) => (typeof x === "string" ? { entity: x } : x)).filter((x) => x?.entity)
    : Object.keys(hass.states)
        .filter((id) => domainOf(id) === "counter")
        .sort(byName)
        .map((entity) => ({ entity }));
  const out = { timers, counters };
  per.set(sig, out);
  return out;
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const TIMER_STYLE = `
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
  @container (max-width: 300px) {
    .hero { flex-direction: column; align-items: stretch; gap: 8px; }
    .hero .kt { align-self: center; }
    .row { gap: 8px; }
    .row .acts .btn:not(:first-child) { display: none; }
    .row .acts .btn span { display: none; }
    .row .acts .btn { width: 34px; height: 34px; padding: 0; border-radius: 50%; }
    .mini .kt { width: 60px; height: 60px; }
    .mini .kt-dial, .mini .kt-icon { left: 6px; top: 8px; width: 48px; height: 48px; }
  }
  @container (max-width: 200px) {
    .mini .kt { display: none; }
    .mini .big b { font-size: 22px; }
  }
`;

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

class TimerCard extends CardBase {
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
        else item.status = "idle";
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
    const rank = { ringing: 0, active: 1, paused: 2, idle: 3 };
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
    const sub = parts.length ? parts.join(" · ") : items.length ? this._t("none_running") : "";
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
    const left = it.status === "active" ? (it.end ?? Date.now()) - Date.now() : it.status === "paused" ? it.remaining : it.status === "ringing" ? 0 : it.total;
    return it.total ? clamp((left ?? 0) / it.total, 0, 1) : it.status === "idle" ? 1 : 0;
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
      <div class="kt-dial">${this._ring(it, 96, w)}${it.status === "active" ? '<div class="sweep" aria-hidden="true"></div>' : ""}</div>
      <div class="kt-icon">${svgIcon(this._icon(it), it.status === "ringing" ? "shake" : "")}</div>
    </div>`;
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
  _actions(it, compact = false) {
    const out = [];
    if (it.kind === "timer") {
      if (it.status === "active") out.push(this._btn(it, "pause", ICONS.pause, this._t("pause"), this._t("pause")));
      if (it.status === "paused") out.push(this._btn(it, "resume", ICONS.play, this._t("resume"), this._t("resume"), " primary"));
      if (it.status === "idle") out.push(this._btn(it, "start", ICONS.play, this._t("start"), this._t("start")));
      if (it.status === "active" && !compact) out.push(this._btn(it, "add", ICONS.plus, this._t("add_minute"), this._length(6e4)));
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
    const ends =
      it.status === "active" && it.end
        ? this._t("ends_at", { time: fmtTime(this._hass, this._config, it.end) })
        : it.status === "paused"
          ? this._t("paused")
          : this._t("ringing");
    const next = sum.active.find((x) => x !== it && x.end);
    const lines = [
      `<div class="line ${cls}">${svgIcon(it.status === "ringing" ? ICONS.bell : it.status === "paused" ? ICONS.pause : ICONS.bell_ring)}<span>${esc([ends, it.sub].filter(Boolean).join(" · "))}</span></div>`,
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
    else parts = [it.total ? esc(this._length(it.total)) : ""];
    return [...parts, it.sub ? esc(it.sub) : ""].filter(Boolean).join(" · ");
  }

  _row(it) {
    const cls = this._cls(it);
    const badge = it.status === "paused" ? `<span class="badge" style="--b: var(--tm-idle)">${svgIcon(ICONS.pause)}</span>` : "";
    const ringed = it.status === "active" || it.status === "ringing";
    const acts = this._actions(it, true);
    const cancel = it.kind === "timer" && it.status !== "idle" ? this._btn(it, "cancel", ICONS.close, this._t("cancel_timer"), "", " round") : "";
    return `<div class="row">
      <div class="row-icon ${cls} ${it.status}">${ringed ? this._ring(it, 44, 3) : ""}${svgIcon(this._icon(it), it.status === "ringing" ? "shake" : "")}${badge}</div>
      <div class="row-text clickable" role="button" tabindex="0" data-entity="${esc(it.entity)}"><div class="row-name">${esc(it.name)}</div><div class="row-state ${cls}">${this._state(it)}</div></div>
      ${acts || cancel ? `<div class="acts">${acts}${cancel}</div>` : ""}
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

  _head(sum, sub) {
    const st = sum.ringing.length ? "crit" : sum.active.length ? "accent" : "idle";
    return this._header({ icon: sum.ringing.length ? ICONS.bell : ICONS.timer, cls: st, title: this._config.title || this._t("timers"), sub, chip: sum.chip });
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
    return `<style>${BASE_STYLE}${TIMER_STYLE}</style>
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

  _dialogHtml() {
    const d = this._dialog;
    const presets = PRESETS.map((n) => `<button class="preset${n === d.minutes ? " on" : ""}" data-action="dur_preset" data-min="${n}" aria-pressed="${n === d.minutes}">${esc(this._length(n * 6e4))}</button>`).join("");
    const body = `<div class="stepper" role="group" aria-label="${esc(this._t("duration"))}">
          <button class="btn round" data-action="dur_minus" aria-label="${esc(this._t("less"))}" title="${esc(this._t("less"))}"${d.minutes <= 1 ? " disabled" : ""}>${svgIcon(ICONS.minus)}</button>
          <div class="val num" aria-live="polite">${d.minutes}<small>min</small></div>
          <button class="btn round" data-action="dur_plus" aria-label="${esc(this._t("more"))}" title="${esc(this._t("more"))}">${svgIcon(ICONS.plus)}</button>
        </div>
        <div class="presets">${presets}</div>`;
    return this._modal(this._t("start_timer", { name: d.name }), body, this._t("start"), ICONS.play);
  }
}

class TimerMiniCard extends withMini(TimerCard) {
  static getConfigElement() {
    return document.createElement("timer-mini-card-editor");
  }

  _renderMini() {
    const { m, error } = this._ready();
    if (error) return error;
    const sum = this._summary(m);
    const it = sum.hero;
    const others = sum.items.filter((x) => x !== it && x.status !== "idle");
    const rest = others.length
      ? `<div class="line">${svgIcon(ICONS.sand)}<span>${esc(others.slice(0, 2).map((x) => `${x.name} ${x.status === "active" && x.end ? fmtCountdown(x.end - Date.now()) : x.status === "paused" && x.remaining ? fmtCountdown(x.remaining) : this._t(x.status === "ringing" ? "ringing" : "paused")}`).join(" · "))}</span></div>`
      : "";
    const q = sum.quick;
    const pause = it?.kind === "timer" && it.status === "active" ? `<button class="btn round" data-action="pause" data-key="${esc(it.key)}" title="${esc(this._t("pause"))}" aria-label="${esc(`${this._t("pause")} · ${it.name}`)}">${svgIcon(ICONS.pause)}</button>` : "";
    const controls = it
      ? pause || (it.status === "paused" || it.kind === "google_home" ? this._actions(it, true).replace(/class="btn( primary| active)?"/, 'class="btn round$1"').replace(/<span>[^<]*<\/span>/, "") : "")
      : q && this._config.show_quick !== false
        ? `<button class="btn round primary" data-action="start" data-key="${esc(q.key)}" title="${esc(this._t("start_timer", { name: q.name }))}" aria-label="${esc(this._t("start_timer", { name: q.name }))}">${svgIcon(ICONS.play)}</button>`
        : "";
    const body = it ? `${this._big(it)}${rest}` : `<div class="line">${svgIcon(ICONS.timer_off)}<span>${esc(this._t("none_running"))}</span></div>`;
    return `<style>${BASE_STYLE}${TIMER_STYLE}${MINI_STYLE}</style>
      <ha-card>
        ${this._head(sum, "")}
        <div class="content mini">
          ${it ? this._kt(it, 72) : ""}
          <div class="info">${body}</div>
          ${controls ? `<div class="controls">${controls}</div>` : ""}
        </div>
      </ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Visual editors
// ---------------------------------------------------------------------------

class TimerCardEditor extends EditorBase {
  static get toggles() {
    return [
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

  _fields() {
    return [
      { name: "timers", selector: { entity: { multiple: true, domain: ["timer", "sensor"] } } },
      { name: "counters", selector: { entity: { multiple: true, domain: "counter" } } },
      { name: "quick_timer", selector: { entity: { domain: "timer" } } },
    ];
  }
}

// The mini card's detail view is the full card: its editor offers the full card's options, plus the detail button.
class TimerMiniCardEditor extends TimerCardEditor {
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
