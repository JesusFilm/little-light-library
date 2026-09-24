/* Run in the original site's browser DevTools console. Never clears or writes storage.
 * This is a one-off recovery tool, not shipped in the reader. See docs/draft-recovery.md.
 */
(async () => {
  const name = "little-light-author-books";
  const databases = await indexedDB.databases();
  if (!databases.some((database) => database.name === name)) {
    console.info(
      "No Little Light Library author drafts on this browser origin.",
    );
    return;
  }
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open(name);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => request.transaction.abort();
  });
  const read = (store) =>
    new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const values = tx.objectStore(store).getAll();
      const keys = tx.objectStore(store).getAllKeys();
      tx.oncomplete = () =>
        resolve(
          keys.result.map((key, i) => ({ key, value: values.result[i] })),
        );
      tx.onerror = tx.onabort = () => reject(tx.error);
    });
  let books, settings;
  try {
    books = await read("books");
    settings = await read("settings");
  } finally {
    db.close();
  }
  const missingMedia = [];
  for (const { value: entry } of books) {
    for (const [id, asset] of Object.entries(entry.book?.assets || {})) {
      if (asset.src.startsWith("data:")) continue;
      try {
        if (
          !/^[a-zA-Z0-9_./-]+$/.test(asset.src) ||
          asset.src.startsWith("/") ||
          asset.src.split("/").includes("..")
        )
          throw Error("Unsupported asset path; retained unchanged");
        const response = await fetch(new URL(asset.src, location.href));
        if (!response.ok) throw Error(`HTTP ${response.status}`);
        asset.src = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          response.blob().then((blob) => reader.readAsDataURL(blob), reject);
        });
      } catch (error) {
        missingMedia.push({
          key: entry.key,
          asset: id,
          src: asset.src,
          error: String(error),
        });
      }
    }
  }
  const snapshot = {
    format: "little-light-draft-recovery",
    version: 1,
    books,
    settings,
    missingMedia,
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" }),
  );
  const download = document.createElement("a");
  download.href = url;
  download.download = "little-light-draft-recovery.json";
  download.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  console.info(
    `Exported ${books.length} stored books, including deleted entries; ${missingMedia.length} media failures. Storage was not modified. Check the downloaded JSON before clearing any browser data.`,
  );
})();
