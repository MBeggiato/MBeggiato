/**
 * Emits the icon set from mbx-mark.svg.
 *
 * Requires rsvg-convert and ImageMagick, both used only at authoring time.
 */
import { mkdir, rm } from "node:fs/promises";
import { $ } from "bun";

const BRAND = new URL("./", import.meta.url);
const ICONS = new URL("./icons/", BRAND);

const INK = "#2d2d2c";
const PAPER = "#fafafa";

/** The prompt geometry, kept in one place so the mark and icons cannot drift. */
const PROMPT = `<path d="M8 10 L14 16 L8 22" stroke="#000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="20" y="12" width="6" height="8" rx="1.5" fill="#000"/>`;

/** Browser tab icon: one file that follows the user's colour scheme. */
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" role="img" aria-label="mbx.sh">
  <style>
    .body { fill: ${INK}; }
    @media (prefers-color-scheme: dark) { .body { fill: ${PAPER}; } }
  </style>
  <mask id="p">
    <rect x="0" y="0" width="32" height="32" fill="#fff"/>
    ${PROMPT}
  </mask>
  <rect class="body" x="2" y="2" width="28" height="28" rx="7" mask="url(#p)"/>
</svg>
`;
await Bun.write(new URL("./favicon.svg", BRAND), faviconSvg);

/**
 * Home-screen icons are placed on a platform-drawn tile, so the artwork goes
 * full bleed: the mark's 28-unit body is scaled up to fill the whole canvas.
 */
const BODY = 28;
const SCALE = 32 / BODY;
const touchSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" role="img" aria-label="mbx.sh">
  <mask id="p">
    <rect x="0" y="0" width="32" height="32" fill="#fff"/>
    <g transform="scale(${SCALE.toFixed(4)}) translate(-2 -2)">
      ${PROMPT}
    </g>
  </mask>
  <rect x="0" y="0" width="32" height="32" fill="${INK}" mask="url(#p)"/>
</svg>
`;

await rm(ICONS, { recursive: true, force: true });
await mkdir(ICONS, { recursive: true });

const tmpTouch = new URL("./_touch.svg", ICONS);
await Bun.write(tmpTouch, touchSvg);

const markPath = Bun.fileURLToPath(new URL("./mbx-mark.svg", BRAND));
const touchPath = Bun.fileURLToPath(tmpTouch);
const iconsDir = Bun.fileURLToPath(ICONS);

// Transparent, ink-coloured marks for favicons and general use.
const inkMark = (await Bun.file(markPath).text()).replaceAll("currentColor", INK);
const tmpInk = new URL("./_ink.svg", ICONS);
await Bun.write(tmpInk, inkMark);
const inkPath = Bun.fileURLToPath(tmpInk);

for (const size of [16, 32, 48, 64, 256]) {
  await $`rsvg-convert -w ${size} -h ${size} ${inkPath} -o ${iconsDir}/mbx-${size}.png`.quiet();
}

// Full-bleed variants for home screens and store listings.
for (const size of [180, 512]) {
  await $`rsvg-convert -w ${size} -h ${size} ${touchPath} -o ${iconsDir}/mbx-touch-${size}.png`.quiet();
}

await $`magick ${iconsDir}/mbx-16.png ${iconsDir}/mbx-32.png ${iconsDir}/mbx-48.png ${iconsDir}/favicon.ico`.quiet();

await rm(tmpTouch);
await rm(tmpInk);

console.log("favicon.svg + icons/ geschrieben");
