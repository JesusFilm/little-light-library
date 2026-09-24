import type { AuthoredBook } from "./authored-book";
import type { AudioManifest, LocaleData } from "./contracts";
import type { RoomToy } from "./room-shelf";

export interface ShelfToy extends RoomToy {
  sound?: string;
}
const url = (src: string) =>
  src.startsWith("data:") || src.startsWith("./") ? src : `./${src}`;
// Compatibility data for the original two books. Authored books supply their own toys.
const includedToys = {
  eden: [
    {
      id: "adam",
      label: "Adam",
      asset: "assets/art/adam-figurine.webp",
      animation: "rock",
    },
    {
      id: "eve",
      label: "Eve",
      asset: "assets/art/eve-figurine.webp",
      animation: "sway",
    },
    {
      id: "garden-tree",
      label: "Garden tree",
      asset: "assets/art/eden-tree.webp",
      animation: "pulse",
    },
  ],
  noah: [
    {
      id: "noah",
      label: "Noah",
      asset: "assets/art/noah-figurine.webp",
      animation: "rock",
    },
    {
      id: "ark",
      label: "The ark",
      asset: "assets/art/theatre/ark.webp",
      animation: "sway",
    },
    {
      id: "dove",
      label: "Dove",
      asset: "assets/art/theatre/dove-olive.webp",
      animation: "float",
    },
  ],
} as const;
export function shelfToys(
  book: AuthoredBook | undefined,
  storyId: string,
  locale: LocaleData,
  manifest: AudioManifest,
): ShelfToy[] {
  if (book)
    return (book.toys ?? []).map((toy) => ({
      ...toy,
      asset: url(book.assets[toy.asset].src),
      sound: toy.sound ? url(book.assets[toy.sound].src) : undefined,
    }));
  return (includedToys[storyId as keyof typeof includedToys] ?? []).map(
    (toy) => ({
      ...toy,
      label:
        locale.characters[toy.id as keyof typeof locale.characters] ||
        toy.label,
      asset: url(toy.asset),
      sound: manifest[`${locale.id}/names/${toy.id}`]?.src,
    }),
  );
}
