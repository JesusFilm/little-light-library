/** Local, resolution-independent brass linework for the library controls. */
const drawings: Record<string, string> = {
  menu: '<path d="M6 9h20M6 16h20M6 23h20"/>',
  text: '<path d="M5 6h22v20H5zM10 11h12M10 16h12M10 21h7"/>',
  play: '<path d="m10 6 13 10-13 10Z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M11 7v18M21 7v18" stroke-width="5"/>',
  previous: '<path d="M25 16H7m8-8-8 8 8 8"/><path d="m24 12 3 4-3 4"/>',
  next: '<path d="M7 16h18m-8-8 8 8-8 8"/><path d="m8 12-3 4 3 4"/>',
  library:
    '<path d="M16 9C12 5 6 5 3 7v19c5-2 9-1 13 2 4-3 8-4 13-2V7c-3-2-9-2-13 2Zm0 0v19M7 11l5 1m-5 5 5 1m8-6 5-1m-5 7 5-1"/>',
  language:
    '<circle cx="16" cy="16" r="12"/><ellipse cx="16" cy="16" rx="5" ry="12"/><path d="M4 16h24M7 9h18M7 23h18"/>',
  settings:
    '<path d="M7 5v22M16 5v22M25 5v22"/><path d="M4 11h6M13 22h6M22 10h6" stroke-width="5"/>',
  close: '<path d="m9 9 14 14M23 9 9 23"/>',
  enter: '<path d="M18 5h9v22h-9M4 16h17m-7-7 7 7-7 7"/>',
};
export function libraryIcon(name: string) {
  return `<svg class="library-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${drawings[name] ?? drawings.library}</svg>`;
}
