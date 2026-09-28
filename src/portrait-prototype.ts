/** Throwaway portrait experiment: a CSS 3D shelf, using the real book catalog. */
import type { ResolvedRoomEntry } from "./room-library";
import { mobileImageUrl } from "./mobile-images";

let selected = 0;
export function renderPortraitShelf(
  host: HTMLElement,
  books: ResolvedRoomEntry[],
  busy: boolean,
  status: string,
  open: (key: string) => Promise<void>,
) {
  host.replaceChildren();
  const shelf = document.createElement("section");
  shelf.className = "prototype-carousel";
  shelf.setAttribute("aria-label", "Choose a story");
  const track = document.createElement("div");
  track.className = "carousel-track";
  track.setAttribute("aria-roledescription", "carousel");
  let suppressClick = false;
  const cards = books.map((book, index) => {
    const card = document.createElement("button");
    card.className = "carousel-book";
    card.dataset.shelfKey = book.key;
    card.setAttribute("aria-label", `Read ${book.title}`);
    card.disabled = busy;
    card.style.setProperty("--cloth", book.appearance.coverColor);
    card.style.setProperty("--trim", book.appearance.accentColor);
    const art = document.createElement("img");
    art.src = mobileImageUrl(book.cover);
    art.alt = "";
    art.draggable = false;
    const title = document.createElement("strong");
    title.textContent = book.title;
    const ornament = document.createElement("span");
    ornament.textContent = "✦";
    ornament.className = "cover-ornament";
    card.append(ornament, art, title);
    card.onclick = async () => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      if (busy || selected !== index) return;
      await open(book.key);
    };
    track.append(card);
    return card;
  });
  const controls = document.createElement("div");
  controls.className = "carousel-controls";
  const previous = document.createElement("button");
  previous.textContent = "←";
  previous.setAttribute("aria-label", "Previous book");
  const next = document.createElement("button");
  next.textContent = "→";
  next.setAttribute("aria-label", "Next book");
  const label = document.createElement("span");
  label.setAttribute("aria-live", "polite");
  function arrange() {
    cards.forEach((card, i) => {
      let offset = (i - selected + books.length) % books.length;
      if (offset > books.length / 2) offset -= books.length;
      card.style.setProperty("--offset", String(offset));
      card.classList.toggle("selected", offset === 0);
      card.tabIndex = offset === 0 ? 0 : -1;
      card.disabled = busy || offset !== 0;
      card.setAttribute("aria-current", String(offset === 0));
    });
    label.textContent = `${selected + 1} / ${books.length} · Tap the cover to read`;
  }
  const step = (delta: number) => {
    if (busy) return;
    selected = (selected + delta + books.length) % books.length;
    arrange();
  };
  previous.onclick = () => step(-1);
  next.onclick = () => step(1);
  previous.disabled = next.disabled = busy;
  shelf.onkeydown = (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      step(event.key === "ArrowLeft" ? -1 : 1);
      cards[selected].focus();
    }
  };
  let start = 0;
  track.onpointerdown = (event) => {
    suppressClick = false;
    start = event.clientX;
  };
  track.onpointerup = (event) => {
    const delta = event.clientX - start;
    if (Math.abs(delta) > 45) {
      suppressClick = true;
      step(delta < 0 ? 1 : -1);
      event.preventDefault();
    }
  };
  controls.append(previous, label, next);
  const message = document.createElement("p");
  message.className = "carousel-status";
  message.role = "status";
  message.textContent = busy ? "Opening your story…" : status;
  shelf.append(track, controls, message);
  host.append(shelf);
  arrange();
}
