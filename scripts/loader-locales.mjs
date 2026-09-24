import fs from "node:fs";
const languages = {};
for (const file of fs.readdirSync("public/content")) {
  const d = JSON.parse(fs.readFileSync(`public/content/${file}`, "utf8"));
  languages[d.id] = Object.fromEntries(
    [
      "appTitle",
      "loading",
      "retry",
      "error",
      "loadingPause",
      "loadingResume",
    ].map((k) => [k, d.ui[k]]),
  );
}
fs.writeFileSync(
  "public/loading-locales.js",
  `// Generated from localized content by scripts/loader-locales.mjs.\n(()=>{const all=${JSON.stringify(languages)};let id='en-US';try{id=JSON.parse(localStorage.getItem('little-light-preferences')||'{}').language||id}catch{}const ui=all[id]||all['en-US'];window.lightBootUi=ui;document.documentElement.lang=all[id]?id:'en-US';document.title=ui.appTitle;document.querySelector('#loading h2').textContent=ui.appTitle;document.querySelector('#loading-text').textContent=ui.loading;document.querySelector('#loading').setAttribute('aria-label',ui.loading);document.querySelector('.loading-retry').textContent=ui.retry;document.querySelector('.loading-pause').setAttribute('aria-label',ui.loadingPause);})();\n`,
);
