/**
 * The mbx.sh mascot, ready to drop into a card.
 *
 * Geometry lives on a 32 unit grid with every edge on an even coordinate.
 * Canonical SVG: mbx-brand/mbx-mascot.svg.
 *
 * GitHub's image proxy often rasterises SVG without running CSS animations.
 * Every part of the mascot therefore renders visible by default; only the
 * shell prompt animates in.
 */

import { n } from "./svg";

/** Length of the bottom-left chevron path, used to drive the draw-in animation. */
const CHEVRON_LENGTH = 12;

export interface MarkOptions {
  x: number;
  y: number;
  /** Rendered edge length; the visual body is 28/32 of this. */
  size: number;
  fill: string;
  /** Inner screen panel and prompt marks on the body. */
  faint: string;
  /** Keeps ids unique when several marks share one document. */
  id: string;
  /** Seconds before the prompt draw-in starts. */
  delay?: number;
}

export function markStyle(): string {
  return `@keyframes promptDraw {
  from { stroke-dashoffset: ${CHEVRON_LENGTH}; }
  to   { stroke-dashoffset: 0; }
}`;
}

export function renderMark({ x, y, size, fill, faint, id, delay = 0 }: MarkOptions): string {
  const scale = size / 32;
  const drawDelay = delay + 0.28;

  return `<g transform="translate(${n(x)} ${n(y)}) scale(${scale.toFixed(4)})">
  <rect x="2" y="2" width="28" height="28" rx="7" fill="${fill}"/>
  <rect x="5" y="5" width="22" height="17" rx="4" fill="${faint}"/>
  <circle cx="11" cy="12" r="2" fill="${fill}"/>
  <circle cx="21" cy="12" r="2" fill="${fill}"/>
  <path d="M12 16 Q16 18 20 16" stroke="${fill}" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M5 23 L8 26 L5 29" stroke="${faint}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"
    stroke-dasharray="${CHEVRON_LENGTH}"
    style="stroke-dashoffset: ${CHEVRON_LENGTH}; animation: promptDraw .5s cubic-bezier(.4,.1,.2,1) ${drawDelay.toFixed(2)}s forwards;"/>
  <rect x="10" y="24" width="4" height="5" rx="1" fill="${faint}"/>
</g>`;
}
