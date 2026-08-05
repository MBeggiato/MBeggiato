const BRAND = new URL("./", import.meta.url);

async function inner(file: string) {
  const raw = await Bun.file(new URL(file, BRAND)).text();
  return raw.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();
}

async function viewBox(file: string): Promise<string> {
  const raw = await Bun.file(new URL(file, BRAND)).text();
  const match = raw.match(/viewBox="([^"]+)"/);
  if (!match?.[1]) throw new Error(`Kein viewBox in ${file} gefunden.`);
  return match[1];
}

const markInner = await inner("mbx-mark.svg");
const lockInner = await inner("mbx-lockup.svg");
const lockBox = await viewBox("mbx-lockup.svg");

let instance = 0;
function svg(innerMarkup: string, box: string, cls: string) {
  const suffix = `f${instance++}`;
  const scoped = innerMarkup
    .replace(/id="([^"]+)"/g, (_, id) => `id="${id}-${suffix}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${id}-${suffix})`);
  return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="${box}" fill="none">${scoped}</svg>`;
}

const mark = (cls: string) => svg(markInner, "0 0 32 32", cls);
const lock = (cls: string) => svg(lockInner, lockBox, cls);

function pane(tone: "light" | "dark") {
  return `<div class="pane ${tone}">
    <div class="col">
      <div class="cap">Signet</div>
      <div class="line">${mark("m96")}${mark("m48")}${mark("m32")}${mark("m16")}</div>
    </div>
    <div class="col">
      <div class="cap">Lockup</div>
      <div class="line">${lock("l40")}</div>
      <div class="line">${lock("l24")}</div>
    </div>
  </div>`;
}

const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>mbx.sh — finale Marke</title>
<style>
  :root { --ink:#2d2d2c; --paper:#fafafa; --sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Inter, sans-serif; --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
  * { box-sizing: border-box; }
  body { margin:0; padding:26px 24px; width:1024px; background:#f1f1ef; color:var(--ink); font-family:var(--sans); }
  h1 { font-size:19px; font-weight:650; margin:0 0 3px; letter-spacing:-.01em; }
  .sub { font-size:12.5px; opacity:.58; margin:0 0 18px; }
  .row { display:grid; grid-template-columns:1fr 1fr; border-radius:14px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.09); }
  .pane { padding:22px 24px; display:flex; gap:34px; align-items:flex-start; }
  .pane.light { background:var(--paper); color:var(--ink); }
  .pane.dark { background:var(--ink); color:var(--paper); }
  .col { display:flex; flex-direction:column; gap:9px; }
  .cap { font-family:var(--mono); font-size:9.5px; opacity:.45; text-transform:uppercase; letter-spacing:.09em; }
  .line { display:flex; align-items:flex-end; gap:13px; }
  svg { display:block; }
  .m96{width:96px;height:96px} .m48{width:48px;height:48px} .m32{width:32px;height:32px} .m16{width:16px;height:16px}
  .l40{height:40px;width:auto} .l24{height:24px;width:auto}
  .note { margin-top:16px; font-size:12.5px; opacity:.62; max-width:70ch; line-height:1.5; }
</style>
</head>
<body>
<h1>mbx.sh — finale Marke</h1>
<p class="sub">Signet in 96, 48, 32 und 16 Pixel, darunter das Lockup in zwei Groessen. Links auf Papier, rechts auf Tinte.</p>
<div class="row">${pane("light")}${pane("dark")}</div>
<p class="note">Wortmarke aus Hack Bold, ".sh" aus Hack Regular bei 45 Prozent Deckkraft. Alle Glyphen liegen als Pfade vor, es wird kein Font geladen.</p>
</body>
</html>
`;

await Bun.write(new URL("./preview-final.html", BRAND), html);
console.log("preview-final.html geschrieben");
