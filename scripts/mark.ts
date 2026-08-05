/**
 * The mbx.sh signet, ready to drop into a card.
 *
 * Geometry lives on a 32 unit grid with every edge on an even coordinate, so the
 * mark also rasterises cleanly at 16 pixels. Canonical SVG: mbx-brand/mbx-mark.svg.
 */

import { n } from "./svg";

/** Length of the chevron path, used to drive the draw-in animation. */
const CHEVRON_LENGTH = 17;

export interface MarkOptions {
  x: number;
  y: number;
  /** Rendered edge length; the visual body is 28/32 of this. */
  size: number;
  fill: string;
  /** Keeps mask ids unique when several marks share one document. */
  id: string;
  /** Seconds before the mark starts appearing. */
  delay?: number;
}

export function markStyle(): string {
  return `@keyframes markIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes promptDraw {
  from { stroke-dashoffset: ${CHEVRON_LENGTH}; }
  to   { stroke-dashoffset: 0; }
}
@keyframes caretIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}`;
}

export function renderMark({ x, y, size, fill, id, delay = 0 }: MarkOptions): string {
  const scale = size / 32;
  const drawDelay = delay + 0.28;

  return `<g transform="translate(${n(x)} ${n(y)}) scale(${scale.toFixed(4)})">
  <mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
    <rect x="0" y="0" width="32" height="32" fill="#fff"/>
    <path d="M8 10 L14 16 L8 22" stroke="#000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"
      stroke-dasharray="${CHEVRON_LENGTH}"
      style="stroke-dashoffset: ${CHEVRON_LENGTH}; animation: promptDraw .5s cubic-bezier(.4,.1,.2,1) ${drawDelay.toFixed(2)}s forwards;"/>
    <rect x="20" y="12" width="6" height="8" rx="1.5" fill="#000"
      style="opacity: 0; animation: caretIn .16s ease-out ${(drawDelay + 0.46).toFixed(2)}s forwards;"/>
  </mask>
  <rect x="2" y="2" width="28" height="28" rx="7" fill="${fill}" mask="url(#${id})"
    style="opacity: 0; animation: markIn .4s ease-out ${delay.toFixed(2)}s forwards;"/>
</g>`;
}
