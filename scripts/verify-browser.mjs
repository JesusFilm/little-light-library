import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

// Fixture suites deliberately add books and damaged assets. Never deploy their
// mutated build: verify a disposable copy, then exercise the untouched artifact.
const fixtureRoot = path.resolve(".test-output/browser-fixture-dist");
await fs.rm(fixtureRoot, { recursive: true, force: true });
await fs.cp("dist", fixtureRoot, { recursive: true });
const run = (script, env = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script], {
      stdio: "inherit",
      env: { ...process.env, ...env },
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${script} exited ${code}`)),
    );
  });
try {
  for (const suite of ["room", "recovery", "failure", "audio-continuity"])
    await run(`scripts/${suite}-check.mjs`, { READER_DIST: fixtureRoot });
  await run("scripts/mobile-check.mjs");
} finally {
  await fs.rm(fixtureRoot, { recursive: true, force: true });
}
