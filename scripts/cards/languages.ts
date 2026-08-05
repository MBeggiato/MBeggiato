import { measureText, renderText } from "../glyphs";
import { fadeUpKeyframes, n, riseIn, svgDocument } from "../svg";
import { calm, type Theme } from "../theme";
import type { LanguageShare } from "../github";

export const LANGUAGES_WIDTH = 404;
export const LANGUAGES_HEIGHT = 220;

const PAD = 30;
const BAR_RIGHT = LANGUAGES_WIDTH - PAD;
const BAR_WIDTH = BAR_RIGHT - PAD;
const ROW_STEP = 30;
const FIRST_BASELINE = 64;
const BAR_HEIGHT = 7;
const ROWS = 5;

export function renderLanguages(theme: Theme, languages: LanguageShare[]): string {
  const shown = languages.slice(0, ROWS);
  // Shares are renormalised across the languages actually displayed, otherwise
  // the bars never reach the end of the track and look broken.
  const shownTotal = shown.reduce((sum, l) => sum + l.share, 0) || 1;

  const rows = shown
    .map((language, index) => {
      const baseline = FIRST_BASELINE + index * ROW_STEP;
      const barY = baseline + 6;
      const fraction = language.share / shownTotal;
      const percent = `${(fraction * 100).toFixed(1)}%`;
      const percentWidth = measureText(percent, { size: 11.5, weight: "regular" });

      return `<g class="r${index}">
${renderText(language.name, PAD, baseline, { size: 12.5, weight: "bold", fill: theme.fg })}
${renderText(percent, BAR_RIGHT - percentWidth, baseline, { size: 11.5, weight: "regular", fill: theme.muted })}
<rect x="${PAD}" y="${n(barY)}" width="${n(BAR_WIDTH)}" height="${BAR_HEIGHT}" rx="${BAR_HEIGHT / 2}" fill="${theme.faint}"/>
<g transform="translate(${PAD} ${n(barY)})">
  <rect class="fill f${index}" x="0" y="0" width="${n(BAR_WIDTH * fraction)}" height="${BAR_HEIGHT}" rx="${BAR_HEIGHT / 2}" fill="${calm(language.color, theme)}"/>
</g>
</g>`;
    })
    .join("\n");

  // The fill rect sits at x=0 inside a translated group, so scaleX grows from the
  // bar's left edge without needing transform-origin, which resolves against the
  // viewport rather than the element in SVG.
  const style = `${fadeUpKeyframes()}
@keyframes barGrow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
.title { ${riseIn(0.05, 0.5)} }
${shown.map((_, i) => `.r${i} { ${riseIn(0.18 + i * 0.08, 0.5)} }`).join("\n")}
.fill { transform: scaleX(0); }
${shown
  .map(
    (_, i) =>
      `.f${i} { animation: barGrow .8s cubic-bezier(.2,.7,.3,1) ${(0.34 + i * 0.08).toFixed(2)}s forwards; }`,
  )
  .join("\n")}`;

  const summary = shown
    .map((l) => `${l.name} ${((l.share / shownTotal) * 100).toFixed(1)} percent`)
    .join(", ");

  return svgDocument({
    width: LANGUAGES_WIDTH,
    height: LANGUAGES_HEIGHT,
    title: `Most used languages: ${summary}`,
    style,
    body: `${renderText("Languages", PAD, 36, { size: 15, weight: "bold", fill: theme.fg, className: "title" })}
${rows}`,
  });
}
