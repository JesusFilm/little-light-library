import type { AuthoredBook, BookSpread } from "./authored-book";
export const localeIds = [
  "en-US",
  "en-GB",
  "es",
  "fr",
  "hi",
  "it",
  "ja",
  "pt-BR",
  "zh-CN",
] as const;
export type LocaleId = (typeof localeIds)[number];
export type StoryId = string;
export interface Segment {
  id: string;
  text: string;
}
export interface Page {
  authored?: { book: AuthoredBook; spread: BookSpread };
  id: string;
  title: string;
  segments: Segment[];
  image: string;
  passage: string;
}
export interface Story {
  id: StoryId;
  title: string;
  subtitle: string;
  pages: Page[];
}
export interface LocaleData {
  id: LocaleId;
  name: string;
  voice: string;
  ui: Record<string, string>;
  characters: Record<"adam" | "eve" | "noah", string>;
  stories: Story[];
}
export interface AudioCue {
  src: string;
  duration: number;
}
export type AudioManifest = Record<string, AudioCue>;
// Cue keys: `${locale}/${story}/${page.id}/${segment.id}` and `${locale}/names/${character}`.
// Assets use relative paths under public: assets/art/eden-01.webp etc.
// Locales load from public/content/{locale}.json; audio index public/audio-manifest.json.
