import { measureText, renderText } from "../glyphs";
import { n, riseIn, svgDocument } from "../svg";
import type { Theme } from "../theme";
import type { ContributionDay } from "../github";

export const CONTRIB_WIDTH = 840;
export const CONTRIB_HEIGHT = 196;

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const GRID_X = 50;
const GRID_Y = 66;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Intensity is scaled against the busiest day in the window rather than fixed
 * thresholds, so the graph stays readable whether the year was quiet or busy.
 */
function levelFor(count: number, max: number): number {
  if (count <= 0) return 0;
  if (max <= 1) return 4;
  return Math.min(4, Math.max(1, Math.ceil((count / max) * 4)));
}

function monthLabels(weeks: ContributionDay[][]): { column: number; label: string }[] {
  const out: { column: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, column) => {
    const first = week[0];
    if (!first) return;
    const month = new Date(first.date).getUTCMonth();
    if (month === lastMonth) return;
    lastMonth = month;
    // Drop labels that would collide with the previous one or overflow the grid.
    const previous = out[out.length - 1];
    if (previous && column - previous.column < 3) return;
    if (column > weeks.length - 3) return;
    out.push({ column, label: MONTHS[month]! });
  });
  return out;
}

export function renderContributions(theme: Theme, weeks: ContributionDay[][], total: number): string {
  const max = Math.max(1, ...weeks.flat().map((d) => d.count));
  const columns = weeks.length;

  // Cells are emitted as <use> references to one shared rect, grouped per
  // column. That keeps the file roughly a third of the size of 371 standalone
  // rects, and animates 53 groups instead of 371 individual elements.
  const cells = weeks
    .map((week, column) => {
      const uses = week
        .map((day, row) => `<use href="#c" y="${row * STEP}" class="l${levelFor(day.count, max)}"/>`)
        .join("");
      // Animation on the outer group, positioning on the inner one: a CSS
      // transform animation would otherwise replace the translate attribute.
      return `<g class="col w${column}"><g transform="translate(${n(GRID_X + column * STEP)} ${GRID_Y})">${uses}</g></g>`;
    })
    .join("\n");

  // One delay rule per column keeps the stylesheet small; a rule per cell would
  // mean several hundred selectors.
  const columnDelays = Array.from(
    { length: columns },
    (_, i) => `.w${i}{animation-delay:${(0.15 + i * 0.013).toFixed(3)}s}`,
  ).join("\n");

  const levelFills = [theme.faint, ...theme.ramp.slice(1)]
    .map((fill, level) => `.l${level}{fill:${fill}}`)
    .join("\n");

  const labels = monthLabels(weeks)
    .map(({ column, label }) =>
      renderText(label, GRID_X + column * STEP, 58, {
        size: 10.5,
        weight: "regular",
        fill: theme.muted,
        className: "meta",
      }),
    )
    .join("\n");

  const totalText = `${total.toLocaleString("en-US")} contributions in the last year`;
  const totalWidth = measureText(totalText, { size: 13, weight: "regular" });

  const legendLabelSize = 11;
  const lessWidth = measureText("Less", { size: legendLabelSize, weight: "regular" });
  const swatch = 9;
  const swatchGap = 3;
  const legendWidth = lessWidth + 6 + 5 * (swatch + swatchGap) + 3 + measureText("More", { size: legendLabelSize, weight: "regular" });
  const legendX = CONTRIB_WIDTH - 50 - legendWidth;
  const legendY = 180;

  const swatches = [theme.faint, ...theme.ramp.slice(1)]
    .map(
      (fill, i) =>
        `<rect x="${n(legendX + lessWidth + 6 + i * (swatch + swatchGap))}" y="${n(legendY - swatch + 1)}" width="${swatch}" height="${swatch}" rx="2" fill="${fill}"/>`,
    )
    .join("");

  const style = `@keyframes cellIn {
  from { opacity: 0; transform: translateY(3px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes riseIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.col { opacity: 0; animation: cellIn .5s ease-out forwards; }
.title { ${riseIn(0.05, 0.5)} }
.meta { ${riseIn(0.18, 0.5)} }
.legend { ${riseIn(0.9, 0.5)} }
${levelFills}
${columnDelays}`;

  const body = `<defs><rect id="c" width="${CELL}" height="${CELL}" rx="2.5"/></defs>
${renderText("Contributions", GRID_X, 36, { size: 15, weight: "bold", fill: theme.fg, className: "title" })}
${renderText(totalText, CONTRIB_WIDTH - 50 - totalWidth, 36, { size: 13, weight: "regular", fill: theme.muted, className: "meta" })}
${labels}
${cells}
<g class="legend">
${renderText("Less", legendX, legendY, { size: legendLabelSize, weight: "regular", fill: theme.muted })}
${swatches}
${renderText("More", legendX + lessWidth + 6 + 5 * (swatch + swatchGap) + 3, legendY, { size: legendLabelSize, weight: "regular", fill: theme.muted })}
</g>`;

  return svgDocument({
    width: CONTRIB_WIDTH,
    height: CONTRIB_HEIGHT,
    title: `Contribution graph: ${totalText}`,
    style,
    body,
  });
}
