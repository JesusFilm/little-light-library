import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Shared with the existing room journey. Inputs always use the UI; debug state
// is read only to wait for the real stage and playback to settle.
export async function checkReadingComposition(
  page,
  url,
  output,
  baseline = false,
) {
  fs.mkdirSync(output, { recursive: true });
  const rows = [];
  const books = [
    ["eden", "builtin:eden", 8],
    ["noah", "builtin:noah", 8],
    ["jonah-and-the-whale", "book:jonah-and-the-whale", 13],
  ];
  await page.emulateMedia({ reducedMotion: "reduce" });
  const ready = (index) =>
    page.waitForFunction((index) => {
      const d = window.libraryDebug?.();
      return (
        d?.ready &&
        !d.pagePending &&
        d.scene.loadedPage?.index === index &&
        d.scene.stageVisible &&
        !d.shelf.busy
      );
    }, index);
  const selectLocale = async (locale) => {
    await page.locator(`[data-locale="${locale}"]`).click();
    await page.waitForFunction(
      (locale) => document.documentElement.lang === locale,
      locale,
    );
    await page.locator("#enter").click();
  };
  for (const [width, height] of [
    [360, 660],
    [1440, 900],
  ]) {
    await page.setViewportSize({ width, height });
    for (const [book, key, count] of books) {
      await page.goto(url);
      await selectLocale("en-US");
      await page.waitForFunction(() => window.libraryDebug?.().ready);
      await page.locator(`[data-shelf-key="${key}"]`).click();
      await page.waitForFunction(
        () =>
          window.libraryDebug?.().shelf.inspected &&
          !window.libraryDebug().shelf.busy,
      );
      await page.locator("#shelf-read").click();
      for (let index = 0; index < count; index++) {
        await ready(index);
        if (await page.evaluate(() => window.libraryDebug().playing))
          await page.locator("#play").click();
        await page.waitForTimeout(120);
        const sizes =
          book === "jonah-and-the-whale" &&
          [1, 2].includes(index) &&
          width === 360
            ? [
                [360, 660],
                [360, 560],
                [390, 844],
                [740, 360],
                [900, 1440],
              ]
            : [[width, height]];
        for (const [w, h] of sizes) {
          await page.setViewportSize({ width: w, height: h });
          await page.waitForTimeout(150);
          const row = await page.evaluate(() => {
            const rect = (selector) =>
              document
                .querySelector(selector)
                ?.getBoundingClientRect()
                .toJSON();
            const art = rect(".reading-art-region");
            const copy =
              document.querySelector(".reader-copy") ??
              document.querySelector(".story-text");
            return {
              book: window.libraryDebug().state.book,
              spread: document.body.dataset.readerScene,
              viewport: [innerWidth, innerHeight],
              dpr: devicePixelRatio,
              art,
              reader: rect(".reader"),
              text: copy.getBoundingClientRect().toJSON(),
              textScroll: {
                client: copy.clientHeight,
                full: copy.scrollHeight,
              },
              buttons: [
                ...document.querySelectorAll(".reader-controls button"),
              ].map((b) => b.getBoundingClientRect().toJSON()),
              targets: [
                ...document.querySelectorAll(".paper-target,.creature-target"),
              ]
                .filter((b) => !b.hidden)
                .map((b) => ({
                  name: b.getAttribute("aria-label"),
                  ...b.getBoundingClientRect().toJSON(),
                })),
              overlay: getComputedStyle(
                document.querySelector(".reader"),
                "::before",
              ).content,
              bodyFont: parseFloat(
                getComputedStyle(document.querySelector(".story-text"))
                  .fontSize,
              ),
              dockGradient: getComputedStyle(
                document.querySelector("#panel"),
                "::before",
              ).backgroundImage,
              readerBackground: getComputedStyle(
                document.querySelector(".reader"),
              ).backgroundColor,
              overflow: document.documentElement.scrollWidth > innerWidth + 1,
            };
          });
          row.file = `${book}-${index}-${w}x${h}.png`;
          await page.screenshot({ path: path.join(output, row.file) });
          rows.push(row);
          fs.writeFileSync(
            path.join(output, "report.json"),
            JSON.stringify(rows, null, 2),
          );
          if (!baseline) {
            assert.equal(row.overlay, "none", "No reader pseudo-element scrim");
            assert.equal(row.overflow, false, "No horizontal overflow");
            if (w <= 480 && h > w) {
              assert.ok(
                Math.abs(row.reader.bottom - h) <= 1,
                "Mobile reader docks to the viewport bottom",
              );
              assert.ok(
                row.reader.height <= h * 0.4,
                "Mobile reading chrome uses at most 40% of the viewport",
              );
              assert.ok(
                row.bodyFont <= 16,
                "Default mobile story type is compact",
              );
              assert.ok(
                row.dockGradient.includes("linear-gradient"),
                "Mobile dock fades into the scene",
              );
              assert.equal(
                row.readerBackground,
                "rgba(0, 0, 0, 0)",
                "No solid reader card replaces the gradient",
              );
            }
            assert.ok(
              row.art &&
                (row.art.bottom <= row.reader.top + 1 ||
                  row.art.right <= row.reader.left + 1),
              "Reading UI does not cover reserved art",
            );
            assert.ok(
              row.buttons.every(
                (b) =>
                  b.width >= 44 &&
                  b.height >= 44 &&
                  b.top >= 0 &&
                  b.bottom <= h + 1,
              ),
              "Transport remains in view",
            );
            assert.ok(
              row.text.height >= 35,
              "Text has a usable scrolling region",
            );
            for (const target of row.targets) {
              // Full card bounds may include transparent margins; a target center
              // must still lie in the reserved scene and outside reading controls.
              const x = target.x + target.width / 2,
                y = target.y + target.height / 2;
              assert.ok(
                x >= row.art.left - 1 &&
                  x <= row.art.right + 1 &&
                  y >= row.art.top - 1 &&
                  y <= row.art.bottom + 1,
                `${book}/${index}: ${target.name} stays within art`,
              );
            }
          }
        }
        await page.setViewportSize({ width, height });
        if (index < count - 1) await page.locator("#next").click();
      }
      // A reverse traversal must preserve the same text/art pairing.
      for (let index = count - 2; index >= 0; index--) {
        await page.locator("#previous").click();
        await ready(index);
      }
      if (!baseline && width === 360) {
        const wrapping = [];
        for (const locale of [
          "en-US",
          "en-GB",
          "es",
          "fr",
          "hi",
          "it",
          "ja",
          "pt-BR",
          "zh-CN",
        ]) {
          await page.locator("#language").click();
          await selectLocale(locale);
          await ready(0);
          await page.waitForTimeout(150);
          wrapping.push(
            await page.evaluate(
              (locale) => ({
                locale,
                height: document.querySelector(".reader-copy").scrollHeight,
              }),
              locale,
            ),
          );
          await page.screenshot({
            path: path.join(output, `${book}-locale-${locale}.png`),
          });
        }
        fs.writeFileSync(
          path.join(output, `${book}-wrapping.json`),
          JSON.stringify(wrapping, null, 2),
        );
        const worst = wrapping.reduce((a, b) => (a.height >= b.height ? a : b));
        await page.locator("#language").click();
        await selectLocale(worst.locale);
        await ready(0);
        await page.setViewportSize({ width: 360, height: 560 });
        const enlarged = await page.addStyleTag({
          content:
            ".reading .reader h1{font-size:44px!important}.reading .story-text{font-size:32px!important}.reading .reader-meta{font-size:22px!important}",
        });
        const accessible = await page.evaluate(() => {
          const copy = document.querySelector(".reader-copy"),
            controls = document
              .querySelector(".reader-controls")
              .getBoundingClientRect();
          copy.scrollTop = copy.scrollHeight;
          return {
            height: copy.clientHeight,
            scrolled: copy.scrollTop,
            controlsBottom: controls.bottom,
            controlsTop: controls.top,
          };
        });
        assert.ok(
          accessible.height >= 35 &&
            accessible.scrolled > 0 &&
            accessible.controlsTop >= 0 &&
            accessible.controlsBottom <= 560,
          "Enlarged title and story scroll while transport stays visible",
        );
        // Let the compositor paint the resized canvas and scrolled layer before
        // recording pixels; DOM geometry alone does not guarantee a fresh frame.
        await page.waitForTimeout(300);
        await page.screenshot({
          path: path.join(output, `${book}-200-percent.png`),
        });
        await enlarged.evaluate((e) => e.remove());
        await page.setViewportSize({ width, height });
      }
    }
  }
  return { captures: rows.length, spreads: 29, viewports: 6, output };
}
