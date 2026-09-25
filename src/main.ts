import { validateBook } from "./book-validation";
import { ShelfToyAudio } from "./shelf-toy-audio";
import { shelfToys, type ShelfToy } from "./room-toys";
import { RoomLibrary } from "./room-library";
import { BookNarration } from "./book-reader-audio";
import {
  productionLanguages,
  resolveBook,
  translationIssues,
} from "./book-localization";
import { narrationIssues, type AuthoredBook } from "./authored-book";
import "./style.css";
import {
  localeIds,
  type LocaleId,
  type LocaleData,
  type AudioManifest,
  type StoryId,
  type Story,
} from "./contracts";
import { readPreferences, savePreferences } from "./preferences";
import { ReaderState } from "./state";
import { ReadingSession } from "./reading-session";
import { Narration } from "./playback";
import { LibraryScene, type Selection } from "./scene";
import { Soundscape } from "./soundscape";
declare global {
  interface Window {
    lightBootUi: Record<string, string>;
    storyLoading: {
      status: (s: string) => void;
      ready: () => void;
      fail: (s: string) => void;
    };
    libraryDebug: () => unknown;
    libraryReview: (
      time?: number,
      age?: number,
      foldProgress?: number,
      focusAge?: number,
    ) => void;
    libraryRoomReview: (selection?: Selection, age?: number) => void;
  }
}
const names: Record<LocaleId, string> = {
  "en-US": "English · US",
  "en-GB": "English · UK",
  es: "Español",
  fr: "Français",
  hi: "हिन्दी",
  it: "Italiano",
  ja: "日本語",
  "pt-BR": "Português · Brasil",
  "zh-CN": "简体中文",
};
const $ = <T extends HTMLElement = HTMLElement>(s: string) =>
  document.querySelector<T>(s)!;
const prefs = readPreferences(localStorage),
  state = new ReaderState();
state.language = prefs.language;
let locale: LocaleData,
  manifest: AudioManifest = {},
  scene: LibraryScene,
  narration: Narration | BookNarration,
  entered = false;
let soundscape: Soundscape | undefined;
let entering = false;
let toyAudio: ShelfToyAudio | undefined;
let currentToys: ShelfToy[] = [];
let lastHighlight = "";
let activeBook: AuthoredBook | undefined;
let bookLocale = "";
let standardNarration: Narration;
let bookNarration: BookNarration;
let viewBook: AuthoredBook | undefined;
let viewSource: AuthoredBook | undefined;
function localizedBook() {
  if (viewSource !== activeBook || viewBook?.locale !== bookLocale) {
    viewSource = activeBook;
    viewBook = resolveBook(activeBook!, bookLocale || activeBook!.locale);
  }
  return viewBook!;
}
const roomLibrary = new RoomLibrary();
type RoomBook = Awaited<ReturnType<RoomLibrary["resolve"]>>[number];
let roomBooks: RoomBook[] = [];
let readerNeedsReload = false;
let session: ReadingSession<RoomBook>;
let shownMediaFailure: "artwork" | "narration" | null = null;

async function shelfAction(action: () => Promise<void>) {
  return session.run(action);
}
async function refreshRoomBooks() {
  const books = await roomLibrary.resolve(locale);
  const table = session.snapshot.table;
  if (table && !books.some((book) => book.key === table)) {
    toyAudio?.stop();
    currentToys = [];
    await scene.setShelfToys([]);
    await scene.close();
    session.clearTable();
    state.close();
  }
  roomBooks = books;
  await scene.setShelfBooks(books);
}
function renderShelf() {
  const { inspected, busy, status } = session.snapshot;
  $("#panel").replaceChildren();
  if (inspected) {
    const entry = inspected;
    $("#panel").innerHTML =
      `<section class="shelf-preview" aria-label="Selected book"><p class="eyebrow">${entry.book ? escaped(entry.book.locale) : escaped(locale.name)}</p><h1>${escaped(entry.title)}</h1><div><button id="shelf-read" class="primary" ${busy ? "disabled" : ""}>Read</button><button id="shelf-return" ${busy ? "disabled" : ""}>Return</button></div><p role="status">${escaped(status)}</p></section>`;
    $("#shelf-read").onclick = () => void readShelfBook();
    $("#shelf-return").onclick = () => void returnShelfBook();
  } else if (status) {
    const message = document.createElement("p");
    message.className = "shelf-status";
    message.role = "status";
    message.textContent = status;
    $("#panel").append(message);
  }
}
async function inspectShelfBook(key: string) {
  if (session.snapshot.busy || !entered) return;
  if (key === session.snapshot.table) {
    await resumeReading();
    return;
  }
  const entry = roomBooks.find((book) => book.key === key);
  if (!entry) return;
  if (await session.inspect(entry)) $("#shelf-read")?.focus();
}
async function returnShelfBook() {
  const key = session.snapshot.inspected?.key;
  if (key && (await session.returnInspected()))
    document
      .querySelector<HTMLButtonElement>(`[data-shelf-key="${CSS.escape(key)}"]`)
      ?.focus();
}
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    session?.snapshot.inspected &&
    !session.snapshot.busy &&
    !document.querySelector("dialog[open]")
  ) {
    event.preventDefault();
    void returnShelfBook();
  }
});
async function readShelfBook() {
  await session.openInspected();
}
async function resumeReading() {
  await session.continueReading();
}

function currentStory(): Story {
  if (activeBook && state.book === activeBook.id) {
    const book = localizedBook();
    return {
      id: activeBook.id,
      title: book.title,
      subtitle: book.subtitle,
      pages: book.spreads.map((spread) => ({
        id: spread.id,
        title: spread.title,
        passage: spread.source,
        segments: spread.segments,
        image: book.assets[spread.backdrop.asset].src,
        authored: { book, spread },
      })),
    };
  }
  return locale.stories.find((s) => s.id === state.book)!;
}
const onsetSamples: {
  locale: string;
  book: string;
  page: number;
  segment: number;
  speed: number;
  errorMs: number;
}[] = [];
const escaped = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const t = (key: string) => locale?.ui[key] || window.lightBootUi?.[key] || key;
const button = (id: string, label: string, cls = "") =>
  `<button id="${id}" class="${cls}">${label}</button>`;
const transportButton = (
  id: "previous" | "play" | "next",
  icon: string,
  label: string,
  cls = "",
) =>
  `<button id="${id}" class="reader-transport ${cls}" aria-label="${escaped(label)}"><span class="transport-icon" aria-hidden="true">${icon}</span><span class="transport-label">${escaped(label)}</span></button>`;
const persist = () => savePreferences(localStorage, prefs);
function notice(message = "", language: string = locale?.id) {
  $("#notice").lang = language;
  $("#notice").textContent = message;
}
async function fetchLocale(id: LocaleId) {
  const r = await fetch(`./content/${id}.json`);
  if (!r.ok) throw Error("locale");
  return (await r.json()) as LocaleData;
}
function header() {
  $("#header").innerHTML =
    `<a class="brand" href="./" aria-label="${escaped(t("back"))}"><span class="brand-star">✦</span><span>${escaped(t("appTitle"))}</span></a><nav>${state.book ? button("shelf", session.snapshot.browsing ? "↪ Continue reading" : "↩ " + escaped(t("library"))) : ""}${button("language", "🌐", "icon")}${button("settings", "⚙", "icon")}</nav>`;
  $("#language").setAttribute("aria-label", t("language"));
  $("#settings").setAttribute("aria-label", t("settings"));
  $("#language").onclick = () => languageDialog(false);
  $("#settings").onclick = settingsDialog;
  if (state.book)
    $("#shelf").onclick = () =>
      void (session.snapshot.browsing ? resumeReading() : room());
  $("#header")
    .querySelectorAll<HTMLButtonElement>("button")
    .forEach((b) => (b.disabled = session.snapshot.busy));
}
function localizeLoader() {
  document.documentElement.lang = locale.id;
  document.title = t("appTitle");
  $("#loading h2").textContent = t("appTitle");
  $("#loading").setAttribute("aria-label", t("loading"));
  $("#loading-text").textContent = t("loading");
  $(".loading-retry").textContent = t("retry");
  $(".loading-pause").setAttribute("aria-label", t("loadingPause"));
}
function languageDialog(startup: boolean) {
  const d = $<HTMLDialogElement>("#language-dialog");
  d.innerHTML = `<span class="eyebrow">✦</span><h1>${escaped(t("appTitle"))}</h1><p>${escaped(t("chooseLanguage"))}</p><div class="language-grid">${localeIds.map((id) => `<button lang="${id}" data-locale="${id}" class="${id === prefs.language ? "selected" : ""}" aria-pressed="${id === prefs.language}">${names[id]}</button>`).join("")}</div>${button("enter", escaped(t(startup ? "enter" : "close")), "primary wide")}`;
  d.oncancel = (e) => {
    if (startup) e.preventDefault();
  };
  d.querySelectorAll<HTMLButtonElement>("[data-locale]").forEach(
    (b) =>
      (b.onclick = async () => {
        const id = b.dataset.locale as LocaleId;
        await session.changeLanguage(id);
      }),
  );
  $("#enter").onclick = async () => {
    if (startup) {
      if (entering || entered) return;
      entering = true;
      try {
        standardNarration = new Narration();
        narration = standardNarration;
        bookNarration = new BookNarration(narration.context);
        await narration.unlock();
        soundscape = new Soundscape(narration.context);
        toyAudio = new ShelfToyAudio(narration.context);
        toyAudio.settings(prefs.volume, prefs.audio);
        soundscape.settings(prefs.volume, prefs.audio);
        narration.speed(prefs.speed);
        narration.volume(prefs.volume, prefs.audio);
        entered = true;
        d.close();
        await room();
      } catch {
        soundscape?.dispose();
        void narration?.context.close().catch(() => {});
        entered = false;
        notice(t("error"));
      } finally {
        entering = false;
      }
    } else d.close();
  };
  if (!d.open) d.showModal();
}
function settingsDialog() {
  const d = $<HTMLDialogElement>("#settings-dialog");
  d.innerHTML = `<h2>${escaped(t("settings"))}</h2><label>${escaped(t("speed"))}<select id="speed">${[0.75, 1, 1.25, 1.5].map((v) => `<option ${prefs.speed === v ? "selected" : ""}>${v}</option>`).join("")}</select></label><label class="check">${escaped(t("audio"))}<input id="audio" type="checkbox" ${prefs.audio ? "checked" : ""}></label><label>${escaped(t("volume"))}<input id="volume" type="range" min="0" max="1" step=".05" value="${prefs.volume}"></label>${button("settings-language", "🌐 " + escaped(t("language")), "wide")}<p class="help">${escaped(t("helpText"))}</p>${button("settings-close", escaped(t("close")), "primary wide")}`;
  $<HTMLSelectElement>("#speed").onchange = (e) => {
    session.setSpeed(Number((e.target as HTMLSelectElement).value));
  };
  $<HTMLInputElement>("#audio").onchange = (e) => {
    session.setAudio((e.target as HTMLInputElement).checked);
  };
  $<HTMLInputElement>("#volume").oninput = (e) => {
    session.setVolume(Number((e.target as HTMLInputElement).value));
  };
  $("#settings-language").onclick = () => {
    d.close();
    languageDialog(false);
  };
  $("#settings-close").onclick = () => d.close();
  d.showModal();
}
async function room() {
  await session.browseLibrary();
}
function failure(error?: unknown) {
  notice(
    error instanceof Error ? `${t("error")} ${error.message}` : t("error"),
  );
  $("#notice").append(
    Object.assign(document.createElement("button"), {
      textContent: t("retry"),
      onclick: () => location.reload(),
    }),
  );
  window.storyLoading.fail(t("error"));
}
function updatePageNavigation() {
  const loading = session.snapshot.loading;
  const previous = document.querySelector<HTMLButtonElement>("#previous");
  const next = document.querySelector<HTMLButtonElement>("#next");
  if (previous) previous.disabled = loading || state.page === 0;
  if (next) next.disabled = loading || next.dataset.lastPage === "true";
}
function renderMediaFailure() {
  const failure = session.snapshot.failure;
  if (failure === shownMediaFailure) return;
  shownMediaFailure = failure;
  if (!failure) return;
  const message = t(failure === "artwork" ? "imageError" : "audioError");
  notice(message);
  $("#notice").append(
    Object.assign(document.createElement("button"), {
      textContent: t("retry"),
      onclick: () => void session.retryMedia(),
    }),
  );
  if (failure === "narration") {
    const status = document.querySelector("#play-status");
    if (status) status.textContent = message;
  }
}
async function renderPage(
  autoplay: boolean,
  resume: boolean,
  pageTurn: boolean,
  current: () => boolean,
) {
  if (!resume) readerNeedsReload = false;
  const previousReady = session.snapshot.playback.ready;
  session.setReady(false);
  lastHighlight = "";
  const preserveBookSoundtrack = Boolean(
    pageTurn && narration instanceof BookNarration,
  );
  if (!resume) {
    if (preserveBookSoundtrack) bookNarration.preparePageTurn();
    else narration.stop();
  }
  notice();
  document.body.classList.add("reading");
  header();
  const story = currentStory();
  const page = story.pages[state.page];
  narration = page.authored ? bookNarration : standardNarration;
  narration.speed(prefs.speed);
  narration.volume(prefs.volume, prefs.audio);
  soundscape?.pause(document.hidden);
  soundscape?.ambience(!page.authored);
  soundscape?.scene(
    page.authored
      ? "hope"
      : story.id === "eden"
        ? "eden"
        : state.page === 3
          ? "storm"
          : "hope",
  );
  const pageCount = `${t("page")} ${state.page + 1} ${t("of")} ${story.pages.length}`;
  $("#panel").innerHTML =
    `<article class="reader"><div class="reader-meta"><span>${escaped(pageCount)}</span></div><h1>${escaped(page.title)}</h1><div class="story-text">${page.segments.map((s, i) => `<span data-segment="${i}">${escaped(s.text)}</span>`).join(" ")}</div><div class="reader-footer"><span id="play-status" role="status">${escaped(t("loading"))}</span></div><div class="reader-controls">${transportButton("previous", "←", t("previous"))}${transportButton("play", "▶", t("play"), "primary")}${transportButton("next", "→", t("next"))}</div></article>`;
  const next = $<HTMLButtonElement>("#next");
  next.dataset.lastPage = String(state.page >= story.pages.length - 1);
  next.disabled = next.dataset.lastPage === "true";
  if (page.authored) {
    const { book, spread } = page.authored;
    $(".reader").setAttribute("lang", book.locale);
    $(".reader-controls").setAttribute("lang", locale.id);
    const interactiveElements = spread.elements.filter((e) => e.interaction);
    if (interactiveElements.length) {
      const interactions = document.createElement("div");
      interactions.className = "authored-interactions";
      interactions.setAttribute("aria-label", "Story interactions");
      for (const element of interactiveElements) {
        const b = document.createElement("button");
        b.textContent = element.interaction!.label;
        b.dataset.element = element.id;
        b.onclick = () => {
          const result = scene.activateAuthored(element.id);
          if (result) {
            notice(result.response, book.locale);
            if (result.sound) soundscape?.cue(result.sound);
          }
        };
        interactions.append(b);
      }
      $(".reader-controls").before(interactions);
    }
  }
  $("#previous").setAttribute("aria-label", t("previous"));
  $("#next").setAttribute("aria-label", t("next"));
  $<HTMLButtonElement>("#previous").disabled = state.page === 0;
  $("#previous").onclick = () => {
    void session.turnPage(-1);
  };
  $("#next").onclick = () => {
    void session.turnPage(1);
  };
  $("#play").onclick = () => {
    // Safari requires resume to begin in the tap task, before the scene wait.
    void narration.unlock().catch(() => {});
    void session.togglePlayback(current);
  };
  if (resume) {
    session.setReady(previousReady);
    if (
      page.authored &&
      narrationIssues({
        ...page.authored.book,
        spreads: [page.authored.spread],
      }).length &&
      !page.authored.book.soundtracks?.length
    ) {
      $<HTMLButtonElement>("#play").disabled = true;
      $("#play-status").textContent = "Narration needs an update";
    }
    updatePlayback();
    return;
  }
  try {
    await scene.spread(story, page, locale);
    if (!current()) return;
  } catch (error) {
    session.reportFailure("artwork", current);
    return;
  }
  if (!current()) return;
  try {
    const authored = page.authored;
    if (
      authored &&
      narrationIssues({ ...authored.book, spreads: [authored.spread] }).length
    ) {
      notice(
        "Narration is not available for this page. You can still read the story and try its interactions.",
      );
      $("#play-status").textContent = "Narration needs an update";
      if (!authored.book.soundtracks?.length) {
        $<HTMLButtonElement>("#play").disabled = true;
        state.hide();
        return;
      }
    }
    const loaded = authored
      ? await bookNarration.loadBook(authored.book, state.page, {
          preserveSoundtracks: preserveBookSoundtrack,
        })
      : await standardNarration.load(
          page.segments.map(
            (s) => manifest[`${locale.id}/${story.id}/${page.id}/${s.id}`],
          ),
        );
    if (!current() || !loaded) return;
    const active = narration;
    if (!(await scene.waitForUnfold(() => current() && narration === active)))
      return;
    if (autoplay && !document.hidden) {
      await active.play();
      if (!current() || narration !== active) return;
      if (active.clock.playing) state.play();
    } else state.hide();
    session.setReady(true);
  } catch (error) {
    if (current()) {
      state.hide();
      session.reportFailure("narration", current);
    }
  }
  updatePlayback();
}
async function playToy(id: string) {
  if (session.snapshot.busy || !entered || document.hidden) return;
  const toy = currentToys.find((item) => item.id === id);
  if (!toy?.sound) return;
  try {
    await toyAudio?.play(toy.sound);
  } catch {
    notice("This toy’s sound could not play. Please try again.");
  }
}
function updatePlayback() {
  if (!state.book) return;
  const { playing, ready } = session.snapshot.playback;
  const b = document.querySelector<HTMLButtonElement>("#play");
  if (b) {
    const label = t(playing ? "pause" : "play");
    const icon = b.querySelector<HTMLElement>(".transport-icon");
    const text = b.querySelector<HTMLElement>(".transport-label");
    if (icon) icon.textContent = playing ? "Ⅱ" : "▶";
    if (text && text.textContent !== label) text.textContent = label;
    b.setAttribute("aria-label", label);
    b.setAttribute("aria-pressed", String(playing));
  }
  if (
    playing &&
    ready &&
    (!(narration instanceof BookNarration) || narration.narrationActive)
  ) {
    const segment = narration.clock.segment;
    const key = `${session.revision}/${segment}`;
    if (key !== lastHighlight) {
      lastHighlight = key;
      const boundary = narration.clock.durations
        .slice(0, segment)
        .reduce((a, b) => a + b, 0);
      const errorMs =
        ((narration.clock.position - boundary) / prefs.speed) * 1000;
      onsetSamples.push({
        locale: locale.id,
        book: state.book!,
        page: state.page,
        segment,
        speed: prefs.speed,
        errorMs,
      });
      if (onsetSamples.length > 1000) onsetSamples.shift();
    }
  }
  document
    .querySelectorAll<HTMLElement>("[data-segment]")
    .forEach((el) =>
      el.classList.toggle(
        "active",
        ready && Number(el.dataset.segment) === narration.clock.segment,
      ),
    );
  const status = $("#play-status");
  if (status && ready) {
    const label = narration.clock.ended ? t("finished") : "";
    if (status.textContent !== label) status.textContent = label;
  }
}
document.addEventListener("visibilitychange", () => {
  session?.visibilityChanged(document.hidden);
});
function frame() {
  scene?.playback(Boolean(narration?.clock.playing));
  scene?.authoredPlayback(
    narration?.clock.position || 0,
    narration instanceof BookNarration
      ? narration.narrationActive
      : Boolean(narration?.clock.playing),
    narration?.clock.durations,
  );
  soundscape?.narration(Boolean(narration?.clock.playing));
  updatePlayback();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.libraryReview = (time, age, foldProgress, focusAge) =>
  scene?.review(time, age, foldProgress, focusAge);
window.libraryRoomReview = (selection, age) =>
  scene?.reviewRoom(selection, age);
window.libraryDebug = () => ({
  scene: scene?.debug(),
  session: session?.snapshot,
  state: { ...state },
  pagePending: session?.snapshot.loading ?? false,
  ready: session?.snapshot.playback.ready ?? false,
  shelf: {
    browsing: session?.snapshot.browsing ?? true,
    busy: session?.snapshot.busy ?? false,
    inspected: session?.snapshot.inspected?.key ?? null,
    table: session?.snapshot.table ?? null,
    books: roomBooks.map((book) => ({ key: book.key, title: book.title })),
    toys: currentToys.map(({ id, label }) => ({ id, label })),
    toyAudioPlaying: toyAudio?.playing ?? false,
  },
  position: session?.snapshot.playback.position,
  playing: session?.snapshot.playback.playing,
  segment: narration?.clock.segment,
  speed: session?.snapshot.playback.speed,
  volume: session?.snapshot.playback.volume,
  audio: session?.snapshot.playback.audio,
  onsetSamples: [...onsetSamples],
});
async function boot() {
  try {
    locale = await fetchLocale(prefs.language);
    localizeLoader();
    try {
      const r = await fetch("./audio-manifest.json");
      if (r.ok) manifest = await r.json();
    } catch {
      /* Missing audio retains readable story and retry. */
    }
    scene = new LibraryScene(
      $("#scene"),
      (id) => {
        if (!entered || session.snapshot.busy) return;
        if (id === "table-book") void resumeReading();
        else if (id.startsWith("shelf:")) void inspectShelfBook(id.slice(6));
        else if (id.startsWith("toy:")) void playToy(id.slice(4));
      },
      () => soundscape?.cue("tap"),
    );
    session = new ReadingSession<RoomBook>(
      scene,
      () => {
        narration?.pause();
        state.hide();
        soundscape?.pause(true);
      },
      () => {
        header();
        if (session.snapshot.browsing) renderShelf();
        else updatePageNavigation();
        renderMediaFailure();
        updatePlayback();
      },
      (error) =>
        notice(
          `The book could not be moved: ${String(error)}. Please try again.`,
        ),
      {
        reading: () => ({
          book: state.book,
          page: state.page,
          pageCount: state.pageCount,
          toys: currentToys.map(({ id }) => id),
        }),
        validate: (entry) => {
          if (!entry.book) return;
          const validation = validateBook(entry.book);
          if (!validation.book)
            throw Error(
              validation.errors
                .map(({ path, message }) => `${path}: ${message}`)
                .join("; "),
            );
        },
        stop: () => {
          narration.stop();
          state.hide();
          toyAudio?.stop();
        },
        clearToys: async () => {
          currentToys = [];
          await scene.setShelfToys([]);
        },
        closeBook: async () => {
          await scene.close();
          state.close();
        },
        landBook: (entry) => scene.landShelfBook(entry.key),
        activateBook: (entry) => {
          activeBook = entry.book ? structuredClone(entry.book) : undefined;
          bookLocale =
            activeBook &&
            productionLanguages(activeBook).includes(locale.id) &&
            !translationIssues(activeBook, locale.id).length
              ? locale.id
              : activeBook?.locale || "";
          const id = activeBook?.id || entry.storyId!;
          state.open(
            id,
            activeBook?.spreads.length ||
              locale.stories.find((story) => story.id === id)!.pages.length,
          );
          soundscape?.cue("open");
        },
        showFirstPage: () => session.loadPage(true),
        loadToys: async () => {
          currentToys = shelfToys(activeBook, state.book!, locale, manifest);
          await scene.setShelfToys(currentToys);
        },
        suspendPage: async () => {
          readerNeedsReload ||= Boolean(
            session.snapshot.loading || session.snapshot.failure,
          );
          narration?.pause();
          state.hide();
          scene.browseShelf();
          await session.waitForPage();
        },
        prepareLibrary: async () => {
          soundscape?.ambience(true);
          soundscape?.scene("room");
          soundscape?.pause(false);
          notice();
          document.body.classList.remove("reading");
          await refreshRoomBooks();
          scene.browseShelf();
          if (!state.book) session.setReady(true);
          window.storyLoading.ready();
        },
        resumePage: async () => {
          scene.resumeTable();
          document.body.classList.add("reading");
          await session.loadPage(false, !readerNeedsReload);
          soundscape?.pause(document.hidden);
        },
      },
      {
        cancel: () => scene.cancelPendingSpread(),
        commitTurn: (target) => {
          soundscape?.cue("page");
          state.turn(target);
        },
        render: ({ autoplay, resume, pageTurn, current }) =>
          renderPage(autoplay, resume, pageTurn, current),
      },
      {
        snapshot: () => ({
          playing: Boolean(narration?.clock.playing),
          position: narration?.clock.position ?? 0,
          speed: prefs.speed,
          audio: prefs.audio,
          volume: prefs.volume,
        }),
        play: async (current) => {
          const active = narration;
          if (
            !(await scene.waitForUnfold(
              () => current() && narration === active,
            ))
          )
            return false;
          await active.play();
          if (
            !current() ||
            narration !== active ||
            !session.snapshot.playback.ready
          )
            return false;
          if (active.clock.playing) state.play();
          return active.clock.playing;
        },
        pause: () => {
          narration?.pause();
          state.hide();
        },
        setSpeed: (value) => {
          prefs.speed = value;
          narration?.speed(value);
          persist();
        },
        setAudio: (value) => {
          prefs.audio = value;
          narration?.volume(prefs.volume, value);
          soundscape?.settings(prefs.volume, value);
          toyAudio?.settings(prefs.volume, value);
          persist();
        },
        setVolume: (value) => {
          prefs.volume = value;
          narration?.volume(value, prefs.audio);
          soundscape?.settings(value, prefs.audio);
          toyAudio?.settings(value, prefs.audio);
          persist();
        },
        visibility: (hidden) => {
          soundscape?.pause(hidden);
          if (!hidden) return;
          toyAudio?.stop();
          narration?.pause();
          state.hide();
        },
      },
      {
        current: () => state.language,
        fetch: fetchLocale,
        pause: () => {
          narration?.stop();
          toyAudio?.stop();
          readerNeedsReload = Boolean(state.book);
          state.hide();
          notice();
        },
        commit: (id, data) => {
          locale = data;
          state.changeLanguage(id);
          if (
            activeBook &&
            productionLanguages(activeBook).includes(id) &&
            !translationIssues(activeBook, id).length
          )
            bookLocale = id;
          prefs.language = id;
          persist();
          localizeLoader();
          header();
          languageDialog(!entered);
        },
        refresh: async (reading, current) => {
          if (!entered || !current()) return;
          if (reading) {
            await session.loadPage(false);
            if (!current()) return;
            currentToys = shelfToys(activeBook, state.book!, locale, manifest);
            await scene.setShelfToys(currentToys);
          } else {
            await scene.returnShelfPreview();
            if (!current()) return;
            session.clearInspection();
            await refreshRoomBooks();
            if (!current()) return;
            if (state.book) {
              currentToys = shelfToys(activeBook, state.book, locale, manifest);
              await scene.setShelfToys(currentToys);
            }
            scene.browseShelf();
            if (!state.book) session.setReady(true);
            renderShelf();
          }
        },
        recover: async () => {
          if (!entered) return;
          if (session.snapshot.browsing) {
            await refreshRoomBooks();
            scene.browseShelf();
            renderShelf();
          } else if (state.book) await session.loadPage(false);
        },
        error: () => notice(t("error")),
      },
    );
    header();
    roomBooks = await roomLibrary.resolve(locale);
    await scene.room(locale, roomBooks);
    window.storyLoading.ready();
    languageDialog(true);
  } catch (error) {
    failure(error);
  }
}
void boot();
