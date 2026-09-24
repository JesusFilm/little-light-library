import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import test, { type TestContext } from "node:test";
import {
  narrateBook,
  narrationPlan,
  localServer,
} from "../scripts/book-narrate";
import { fixture, fixtureBook, readJson, wav } from "./book-tool-fixtures";
import { sourceTranslation } from "../src/book-localization";

async function lab(
  t: TestContext,
  synthesize: (
    ordinal: number,
    body: { text: string; voice: string; speed: number },
    response: http.ServerResponse,
  ) => void | Promise<void>,
) {
  let requests = 0,
    recordings = 0;
  const server = http.createServer(async (request, response) => {
    requests++;
    if (request.url === "/api/voices") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({ voices: ["af_heart", "bf_emma", "ef_dora"] }),
      );
      return;
    }
    if (request.url !== "/api/synthesize" || request.method !== "POST") {
      response.writeHead(404);
      response.end();
      return;
    }
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    await synthesize(
      ++recordings,
      JSON.parse(Buffer.concat(chunks).toString()),
      response,
    );
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  t.after(
    () =>
      new Promise<void>((resolve, reject) => {
        server.closeAllConnections();
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  );
  return {
    url: `http://127.0.0.1:${(server.address() as { port: number }).port}`,
    requests: () => requests,
    recordings: () => recordings,
  };
}
const respondWav = (response: http.ServerResponse) => {
  response.writeHead(200, { "Content-Type": "audio/wav" });
  response.end(wav());
};

test("dry-run lists only affected cues without contacting lab or changing files", async (t) => {
  const f = await fixture(t);
  const server = await lab(t, (_n, _body, response) => respondWav(response));
  const before = await fs.readFile(f.file, "utf8");
  const result = await narrateBook(f.file, {
    dryRun: true,
    publicRoot: f.publicRoot,
    server: server.url,
  });
  assert.equal(result.planned, 2);
  assert.equal(server.requests(), 0);
  assert.equal(await fs.readFile(f.file, "utf8"), before);
  assert.deepEqual((await fs.readdir(f.books)).sort(), [
    "catalog.json",
    "fixture.book.json",
  ]);
});

test("local narration writes measured owned WAVs and skips an unchanged second run", async (t) => {
  const f = await fixture(t);
  const server = await lab(t, (_n, body, response) => {
    assert.equal(body.voice, "af_heart");
    assert.equal(body.speed, 1);
    assert.match(body.text, /test/i);
    respondWav(response);
  });
  const result = await narrateBook(f.file, {
    publicRoot: f.publicRoot,
    server: server.url,
  });
  assert.equal(result.generated, 2);
  const book = await readJson(f.file);
  assert.deepEqual(book.assets.cover, f.book.assets.cover);
  assert.deepEqual(
    book.spreads[0].segments.map((cue: { text: string }) => cue.text),
    f.book.spreads[0].segments.map((cue) => cue.text),
  );
  for (const cue of book.spreads[0].segments) {
    assert.equal(cue.narration.recordedText, cue.text);
    assert.equal(cue.narration.duration, 0.1);
    assert.match(
      book.assets[cue.narration.asset].src,
      /^assets\/books\/fixture\/audio\/en-US\//,
    );
    assert.deepEqual(
      await fs.readFile(
        path.join(f.publicRoot, book.assets[cue.narration.asset].src),
      ),
      wav(),
    );
  }
  const before = await fs.readFile(f.file, "utf8");
  assert.equal(
    (
      await narrateBook(f.file, {
        publicRoot: f.publicRoot,
        server: server.url,
      })
    ).generated,
    0,
  );
  assert.equal(server.requests(), 3); // One voice list and two WAVs; repeat is offline.
  assert.equal(await fs.readFile(f.file, "utf8"), before);
});

test("interrupted batch preserves completed cue and resumes without resynthesizing it", async (t) => {
  const f = await fixture(t);
  const server = await lab(t, (n, _body, response) => {
    if (n === 2) {
      response.writeHead(503);
      response.end();
    } else respondWav(response);
  });
  await assert.rejects(
    narrateBook(f.file, { publicRoot: f.publicRoot, server: server.url }),
    /HTTP 503/,
  );
  const partial = await readJson(f.file);
  assert.ok(partial.spreads[0].segments[0].narration);
  assert.equal(partial.spreads[0].segments[1].narration, undefined);
  assert.equal(
    (
      await narrateBook(f.file, {
        publicRoot: f.publicRoot,
        server: server.url,
      })
    ).generated,
    1,
  );
  const complete = await readJson(f.file);
  assert.deepEqual(
    complete.spreads[0].segments[0],
    partial.spreads[0].segments[0],
  );
  assert.equal(server.recordings(), 3);
});

test("targeted replacement preserves other cues, previous assets, and review records", async (t) => {
  const f = await fixture(t);
  f.book.assets.previous = {
    kind: "audio",
    src: "audio/test.wav",
    attribution: "Existing recording",
  };
  for (const cue of f.book.spreads[0].segments)
    cue.narration = {
      asset: "previous",
      recordedText: cue.text,
      duration: 0.1,
      voice: "af_heart",
    };
  f.book.reviews = [
    {
      locale: "en-US",
      pageId: "page-one",
      fingerprint: "old-review",
      reviewedAt: "2026-09-20",
    },
  ];
  await fs.writeFile(f.file, JSON.stringify(f.book));
  const server = await lab(t, (_n, _body, response) => respondWav(response));
  await narrateBook(f.file, {
    publicRoot: f.publicRoot,
    server: server.url,
    spread: "page-one",
    segment: "first",
    force: true,
  });
  const book = await readJson(f.file);
  assert.deepEqual(book.spreads[0].segments[1], f.book.spreads[0].segments[1]);
  assert.deepEqual(book.assets.previous, f.book.assets.previous);
  assert.deepEqual(book.reviews, f.book.reviews);
  assert.deepEqual(
    await fs.readFile(path.join(f.publicRoot, "audio/test.wav")),
    wav(),
  );
  assert.equal(server.recordings(), 1);
});

test("planning detects changed text/voice/speed and rejects unknown selections", () => {
  const book = fixtureBook();
  for (const cue of book.spreads[0].segments)
    cue.narration = {
      asset: "test",
      recordedText: cue.text,
      duration: 0.1,
      voice: "Kokoro af_heart · 1×",
    };
  assert.equal(narrationPlan(book, {}).jobs.length, 0);
  book.spreads[0].segments[1].text = "Changed synthetic text.";
  assert.equal(narrationPlan(book, {}).jobs.length, 1);
  assert.equal(narrationPlan(book, { speed: 1.1 }).jobs.length, 2);
  assert.equal(narrationPlan(book, { voice: "am_adam" }).jobs.length, 2);
  assert.throws(
    () => narrationPlan(book, { spread: "absent" }),
    /Unknown spread/,
  );
  assert.throws(
    () => narrationPlan(book, { segment: "first" }),
    /requires --spread/,
  );
  assert.throws(
    () => narrationPlan(book, { spread: "page-one", segment: "absent" }),
    /Unknown segment/,
  );
  assert.throws(
    () => narrationPlan(book, { voice: "ef_dora" }),
    /does not match/,
  );
  assert.throws(() => narrationPlan(book, { speed: NaN }), /Speed/);
});

test("localized generation preserves source text and rejects outdated translation", async (t) => {
  const f = await fixture(t);
  f.book.translations = { es: sourceTranslation(f.book) };
  f.book.translations.es.spreads[0].segments[0].text = "Prueba local.";
  await fs.writeFile(f.file, JSON.stringify(f.book));
  const server = await lab(t, (_n, body, response) => {
    assert.equal(body.voice, "ef_dora");
    respondWav(response);
  });
  await narrateBook(f.file, {
    publicRoot: f.publicRoot,
    server: server.url,
    locale: "es",
    spread: "page-one",
    segment: "first",
  });
  const next = await readJson(f.file);
  assert.deepEqual(next.spreads, f.book.spreads);
  assert.ok(next.translations.es.spreads[0].segments[0].narration);
  next.spreads[0].segments[0].text = "Updated source";
  assert.throws(
    () => narrationPlan(next, { locale: "es" }),
    /STALE_TRANSLATION/,
  );
});

test("malformed synthesis response leaves book and assets untouched", async (t) => {
  const f = await fixture(t);
  const server = await lab(t, (_n, _body, response) => {
    response.writeHead(200, { "Content-Type": "audio/wav" });
    response.end("broken WAV");
  });
  const before = await fs.readFile(f.file, "utf8");
  await assert.rejects(
    narrateBook(f.file, { publicRoot: f.publicRoot, server: server.url }),
    /PCM WAV/,
  );
  assert.equal(await fs.readFile(f.file, "utf8"), before);
  await assert.rejects(
    fs.stat(path.join(f.publicRoot, "assets/books/fixture")),
    /ENOENT/,
  );
});

test("oversized synthesis is rejected before writing audio or book", async (t) => {
  const f = await fixture(t);
  const server = await lab(t, (_n, _body, response) => {
    response.writeHead(200, {
      "Content-Type": "audio/wav",
      "Content-Length": String(32 * 1024 * 1024 + 1),
    });
    response.end(wav());
  });
  const before = await fs.readFile(f.file, "utf8");
  await assert.rejects(
    narrateBook(f.file, { publicRoot: f.publicRoot, server: server.url }),
    /32 MiB/,
  );
  assert.equal(await fs.readFile(f.file, "utf8"), before);
});

test("remote endpoints, credentials and redirects are rejected", async (t) => {
  for (const url of [
    "https://example.org",
    "http://127.0.0.1.evil.test",
    "http://user:secret@127.0.0.1:8770",
    "http://127.0.0.1:8770/api",
    "http://127.0.0.1:8770?secret=x",
  ])
    assert.throws(() => localServer(url), /loopback/);
  const f = await fixture(t);
  const server = await lab(t, (_n, _body, response) => {
    response.writeHead(302, { Location: "http://127.0.0.1:1/never" });
    response.end();
  });
  await assert.rejects(
    narrateBook(f.file, { publicRoot: f.publicRoot, server: server.url }),
    /request failed/,
  );
});

test("concurrent book edit survives a completed synthesis response", async (t) => {
  const f = await fixture(t);
  const changed = { ...f.book, title: "Concurrent author change" };
  const server = await lab(t, async (_n, _body, response) => {
    await fs.writeFile(f.file, JSON.stringify(changed));
    respondWav(response);
  });
  await assert.rejects(
    narrateBook(f.file, { publicRoot: f.publicRoot, server: server.url }),
    /File changed/,
  );
  assert.deepEqual(await readJson(f.file), changed);
});

test("cancelled run makes no network requests or writes", async (t) => {
  const f = await fixture(t);
  const controller = new AbortController();
  controller.abort(Error("Fixture cancellation"));
  const server = await lab(t, (_n, _body, response) => respondWav(response));
  const before = await fs.readFile(f.file, "utf8");
  await assert.rejects(
    narrateBook(f.file, {
      publicRoot: f.publicRoot,
      server: server.url,
      signal: controller.signal,
    }),
    /Fixture cancellation/,
  );
  assert.equal(server.requests(), 0);
  assert.equal(await fs.readFile(f.file, "utf8"), before);
});

test("audio output cannot follow a symbolic link outside the book directory", async (t) => {
  const f = await fixture(t);
  await fs.mkdir(path.join(f.publicRoot, "assets/books"), { recursive: true });
  await fs.symlink(f.dir, path.join(f.publicRoot, "assets/books/fixture"));
  const server = await lab(t, (_n, _body, response) => respondWav(response));
  await assert.rejects(
    narrateBook(f.file, { publicRoot: f.publicRoot, server: server.url }),
    /symbolic links/,
  );
  await assert.rejects(fs.stat(path.join(f.dir, "audio")), /ENOENT/);
});
