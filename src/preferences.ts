import { localeIds, type LocaleId } from "./contracts";
export interface Preferences {
  language: LocaleId;
  speed: number;
  audio: boolean;
  volume: number;
}
interface StorageLike {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}
export const defaults: Preferences = {
  language: "en-US",
  speed: 1,
  audio: true,
  volume: 0.8,
};
export function readPreferences(storage: StorageLike): Preferences {
  try {
    const p = JSON.parse(storage.getItem("little-light-preferences") || "{}");
    return {
      language: localeIds.includes(p.language) ? p.language : defaults.language,
      speed: [0.75, 1, 1.25, 1.5].includes(p.speed) ? p.speed : 1,
      audio: typeof p.audio === "boolean" ? p.audio : true,
      volume:
        typeof p.volume === "number" && p.volume >= 0 && p.volume <= 1
          ? p.volume
          : 0.8,
    };
  } catch {
    return { ...defaults };
  }
}
export function savePreferences(storage: StorageLike, p: Preferences) {
  try {
    storage.setItem("little-light-preferences", JSON.stringify(p));
  } catch {
    /* Reading remains available when storage is disabled. */
  }
}
