/**
 * Builds a local page that loads the generated cards exactly the way GitHub does:
 * through <img>, so the same sandbox rules apply. Inlining the SVGs instead would
 * hide font and animation problems that only appear in the real README.
 *
 * The light cards sit on GitHub's light canvas and the dark ones on its dark
 * canvas, so contrast can be judged against the real backdrop.
 */

const ROOT = new URL("../", import.meta.url);

const GITHUB_LIGHT = "#ffffff";
const GITHUB_DARK = "#0d1117";

const CARDS = [
  { file: "header", label: "Header" },
  { file: "stats", label: "At a glance" },
  { file: "languages", label: "Languages" },
  { file: "contributions", label: "Contributions" },
];

function row(theme: "light" | "dark") {
  const canvas = theme === "light" ? GITHUB_LIGHT : GITHUB_DARK;
  const text = theme === "light" ? "#57606a" : "#8b949e";
  const cards = CARDS.map(
    ({ file, label }) =>
      `<figure>
  <img src="assets/${file}-${theme}.svg?t=${Date.now()}" alt="${label}">
  <figcaption>${file}-${theme}.svg</figcaption>
</figure>`,
  ).join("\n");
  return `<section style="background:${canvas};color:${text}">
  <h2>${theme === "light" ? "GitHub Light" : "GitHub Dark"}</h2>
  ${cards}
</section>`;
}

const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Karten-Vorschau</title>
<style>
  body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; background: #e9e9e5; }
  section { padding: 22px 26px 30px; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .1em; margin: 0 0 14px; font-weight: 600; }
  figure { margin: 0 0 14px; }
  figure img { display: block; max-width: 100%; }
  figcaption { font-family: ui-monospace, monospace; font-size: 10px; opacity: .55; margin-top: 4px; }
  .reload { position: fixed; right: 14px; top: 12px; font: 12px ui-sans-serif, system-ui; padding: 7px 12px; border-radius: 7px; border: 1px solid #0002; background: #fff; cursor: pointer; }
</style>
</head>
<body>
<button class="reload" onclick="location.reload()">Animation neu starten</button>
${row("light")}
${row("dark")}
</body>
</html>
`;

await Bun.write(new URL("./preview.html", ROOT), html);
console.log("preview.html geschrieben — mit einem statischen Server im Projektwurzel oeffnen");
