import { readdir } from "node:fs/promises";

const META: Record<string, { name: string; idea: string }> = {
  "01-prompt-container": { name: "Prompt Container", idea: "Shell-Prompt im Container — Entwicklung trifft Hosting" },
  "02-variable-x": { name: "Variable X", idea: "M.B. mal X — ein Arm loest sich in einen Block auf" },
  "03-layer-stack": { name: "Layer Stack", idea: "Gestapelte Schichten — Infrastruktur und Self-Hosting-Lab" },
  "04-mesh-node": { name: "Mesh Node", idea: "Zentraler Knoten mit Diensten — vernetztes Homelab" },

  "01a-knockout": { name: "Knockout", idea: "Volle Flaeche, Prompt als Negativraum — maximale Praesenz, traegt bei 16 px am besten" },
  "01b-chamfer": { name: "Chamfer", idea: "Zwei gekappte Ecken statt Rundum-Radius — technisch, erinnert an einen Chip" },
  "01c-brackets": { name: "Brackets", idea: "Eckige Klammern statt Kasten — Shell-Syntax pur, offene Silhouette" },
  "01d-broken-frame": { name: "Broken Frame", idea: "Der Cursor sitzt im Rahmenbruch — was drin entsteht, verlaesst den Kasten" },
  "01e-notch": { name: "Notch", idea: "Die linke Wand ist selbst das Prompt-Zeichen — Kasten und Chevron verschmelzen" },

  "a1-basis": { name: "Basis", idea: "Der Entwurf aus Runde 2 unveraendert, Cursor leicht breiter als hoch" },
  "a2-block-cursor": { name: "Block-Cursor", idea: "Cursor hoeher als breit, wie ein echter Terminal-Cursor" },
  "a3-groesser": { name: "Groesser", idea: "Prompt fuellt die Flaeche mehr aus, Radius enger" },
  "a4-nur-chevron": { name: "Nur Chevron", idea: "Ohne Cursor — maximal reduziert" },
  "a5-underscore": { name: "Underscore", idea: "Klassisches Prompt-Paar, Cursor als Unterstrich" },
};

const dirName = Bun.argv[2] ?? "concepts";
const heading = Bun.argv[3] ?? "mbx.sh — Logo-Konzepte";

const dir = new URL(`./${dirName}/`, import.meta.url);
const files = (await readdir(dir)).filter((f) => f.endsWith(".svg")).sort();

/** Strips the outer <svg> wrapper so the mark can be re-sized freely via CSS. */
async function innerMarkup(file: string) {
  const raw = await Bun.file(new URL(file, dir)).text();
  return raw.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();
}

/**
 * Every mark is inlined many times per page. Shared ids (masks, gradients) would
 * collide across instances, so each copy gets its own namespace.
 */
let instance = 0;
function mark(inner: string, cls: string) {
  const suffix = `i${instance++}`;
  const scoped = inner
    .replace(/id="([^"]+)"/g, (_, id) => `id="${id}-${suffix}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${id}-${suffix})`);
  return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">${scoped}</svg>`;
}

function pane(inner: string, tone: "light" | "dark") {
  return `<div class="pane ${tone}">
        <div class="stage">${mark(inner, "big")}</div>
        <div class="lockup">${mark(inner, "lk")}<span class="word">mbx<span class="tld">.sh</span></span></div>
        <div class="favs">
          <div class="fav">${mark(inner, "s32")}<div class="cap">32</div></div>
          <div class="fav">${mark(inner, "s16")}<div class="cap">16</div></div>
        </div>
      </div>`;
}

const blocks: string[] = [];
for (const file of files) {
  const slug = file.replace(/\.svg$/, "");
  const meta = META[slug] ?? { name: slug, idea: "" };
  const inner = await innerMarkup(file);
  blocks.push(`<section class="concept">
    <div class="label"><span class="num">${slug.split("-")[0]}</span><span class="name">${meta.name}</span><span class="idea">${meta.idea}</span></div>
    <div class="row">${pane(inner, "light")}${pane(inner, "dark")}</div>
  </section>`);
}

const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>${heading}</title>
<style>
  :root {
    --ink: #2d2d2c;
    --paper: #fafafa;
    --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    --sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Inter, sans-serif;
  }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px 22px 28px; width: 1024px; background: #f1f1ef; color: var(--ink); font-family: var(--sans); }
  h1 { font-size: 19px; font-weight: 650; letter-spacing: -.01em; margin: 0 0 3px; }
  .sub { font-size: 12.5px; opacity: .58; margin: 0 0 18px; }
  .concept { margin-bottom: 12px; }
  .label { display: flex; align-items: baseline; gap: 9px; margin: 0 0 6px 3px; }
  .num { font-family: var(--mono); font-size: 11px; opacity: .42; }
  .name { font-size: 15px; font-weight: 650; }
  .idea { font-size: 12px; opacity: .58; }
  .row { display: grid; grid-template-columns: 1fr 1fr; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.09); }
  .pane { padding: 16px 22px; display: flex; align-items: center; gap: 26px; }
  .pane.light { background: var(--paper); color: var(--ink); }
  .pane.dark  { background: var(--ink);   color: var(--paper); }
  .stage { width: 100px; display: flex; justify-content: center; }
  svg { display: block; }
  .big { width: 88px; height: 88px; }
  .lockup { display: flex; align-items: center; gap: 11px; }
  .lk { width: 32px; height: 32px; }
  .word { font-family: var(--mono); font-size: 23px; font-weight: 600; letter-spacing: -.02em; }
  .word .tld { opacity: .42; font-weight: 400; }
  .favs { margin-left: auto; display: flex; align-items: flex-end; gap: 14px; }
  .s32 { width: 32px; height: 32px; }
  .s16 { width: 16px; height: 16px; }
  .cap { font-family: var(--mono); font-size: 9px; opacity: .45; text-align: center; margin-top: 5px; }
</style>
</head>
<body>
<h1>${heading}</h1>
<p class="sub">Jede Zeile: links auf Papier, rechts auf Tinte. Gross, als Lockup, und in den Favicon-Groessen 32 und 16 Pixel.</p>
${blocks.join("\n")}
</body>
</html>
`;

const out = new URL(`./preview-${dirName}.html`, import.meta.url);
await Bun.write(out, html);
console.log(`preview-${dirName}.html geschrieben — ${files.length} Entwuerfe`);
