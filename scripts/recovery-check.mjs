import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

// Entirely synthetic origin and storage: never opens a person's existing browser profile.
const recovery = await fs.readFile("scripts/recover-browser-drafts.js", "utf8");
const output = path.resolve(
  process.env.ROOM_CHECK_OUTPUT || ".test-output/room",
);
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({
  ...(process.env.CI ? {} : { channel: "chrome" }),
  headless: true,
});
const context = await browser.newContext({ acceptDownloads: true });
const page = await context.newPage();
const origin = "https://recovery-fixture.invalid/reader/";
const localImage = Buffer.from("fixture-local-image");
await context.route("**/*", async (route) => {
  const url = route.request().url();
  if (url === origin)
    return route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Draft recovery fixture</title>",
    });
  if (url === origin + "assets/cover.png")
    return route.fulfill({ contentType: "image/png", body: localImage });
  return route.fulfill({ status: 404, body: "Fixture missing media" });
});
const stored = [
  {
    key: "saved-live",
    updatedAt: 123,
    book: {
      id: "same-authored-id",
      assets: {
        cover: { kind: "image", src: "assets/cover.png" },
        embedded: { kind: "audio", src: "data:audio/wav;base64,ZW1iZWRkZWQ=" },
      },
    },
  },
  {
    key: "saved-deleted",
    updatedAt: 124,
    deletedAt: 125,
    book: {
      id: "same-authored-id",
      assets: {
        missing: { kind: "image", src: "assets/missing.png" },
      },
    },
  },
];
try {
  await page.goto(origin);
  let downloads = 0;
  page.on("download", () => downloads++);
  await page.evaluate(recovery);
  assert.deepEqual(
    await page.evaluate(() => indexedDB.databases()),
    [],
    "Recovery must not create an absent author database",
  );
  assert.equal(downloads, 0);
  await page.evaluate(async (entries) => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open("little-light-author-books", 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("books", { keyPath: "key" });
        request.result.createObjectStore("settings");
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(
        ["books", "settings"],
        "readwrite",
      );
      for (const entry of entries) transaction.objectStore("books").put(entry);
      transaction.objectStore("settings").put(["saved-live"], "room-shelf-v1");
      transaction
        .objectStore("settings")
        .put({ selected: "saved-deleted" }, "workspace");
      transaction.oncomplete = resolve;
      transaction.onerror = transaction.onabort = () =>
        reject(transaction.error);
    });
    database.close();
  }, stored);
  const readStorage = () =>
    page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open("little-light-author-books");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      try {
        return await Promise.all(
          ["books", "settings"].map(
            (store) =>
              new Promise((resolve, reject) => {
                const tx = db.transaction(store, "readonly");
                const values = tx.objectStore(store).getAll();
                const keys = tx.objectStore(store).getAllKeys();
                tx.oncomplete = () =>
                  resolve(
                    keys.result.map((key, i) => ({
                      key,
                      value: values.result[i],
                    })),
                  );
                tx.onerror = tx.onabort = () => reject(tx.error);
              }),
          ),
        );
      } finally {
        db.close();
      }
    });
  const before = await readStorage();
  const downloadReady = page.waitForEvent("download");
  await page.evaluate(recovery);
  const download = await downloadReady;
  const downloadedPath = path.join(output, "synthetic-draft-recovery.json");
  await download.saveAs(downloadedPath);
  const snapshot = JSON.parse(await fs.readFile(downloadedPath, "utf8"));
  assert.equal(snapshot.format, "little-light-draft-recovery");
  assert.equal(snapshot.version, 1);
  assert.equal(snapshot.books.length, 2);
  assert.deepEqual(snapshot.settings, before[1]);
  const expected = structuredClone(before[0]);
  expected.find(({ key }) => key === "saved-live").value.book.assets.cover.src =
    "data:image/png;base64," + localImage.toString("base64");
  assert.deepEqual(
    snapshot.books,
    expected,
    "Includes deleted records, duplicate authored IDs, metadata, and all embedded media",
  );
  assert.equal(snapshot.missingMedia.length, 1);
  assert.equal(snapshot.missingMedia[0].key, "saved-deleted");
  assert.equal(snapshot.missingMedia[0].src, "assets/missing.png");
  assert.match(snapshot.missingMedia[0].error, /404/);
  assert.deepEqual(
    await readStorage(),
    before,
    "Recovery leaves every original record and asset unchanged",
  );
  const result = {
    passed: true,
    absentDatabaseNotCreated: true,
    books: 2,
    settings: 2,
    embeddedAndRelativeMediaPreserved: true,
    deletedEntriesPreserved: true,
    missingMediaReported: true,
    storageUnchanged: true,
    syntheticDownload: downloadedPath,
  };
  await fs.writeFile(
    path.join(output, "recovery-results.json"),
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  await context.close();
  await browser.close();
}
