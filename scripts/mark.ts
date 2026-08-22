/**
 * The mbx.sh mascot, ready to drop into a card.
 *
 * Geometry lives on a 32 unit grid with every edge on an even coordinate.
 * Canonical SVG: mbx-brand/mbx-mascot.svg.
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

export function renderMark({ x, y, size, fill, faint, id, delay = 0 }: MarkOptions): string {
  const scale = size / 32;
  const drawDelay = delay + 0.28;
  const faceDelay = delay + 0.35;
  const eyeDelay = delay + 0.55;

  return `<g transform="translate(${n(x)} ${n(y)}) scale(${scale.toFixed(4)})">
  <rect x="2" y="2" width="28" height="28" rx="7" fill="${fill}"
    style="opacity: 0; animation: markIn .4s ease-out ${delay.toFixed(2)}s forwards;"/>
  <rect x="5" y="5" width="22" height="17" rx="4" fill="${faint}"
    style="opacity: 0; animation: markIn .35s ease-out ${faceDelay.toFixed(2)}s forwards;"/>
  <circle cx="11" cy="12" r="1.75" fill="${fill}"
    style="opacity: 0; animation: caretIn .16s ease-out ${eyeDelay.toFixed(2)}s forwards;"/>
  <circle cx="21" cy="12" r="1.75" fill="${fill}"
    style="opacity: 0; animation: caretIn .16s ease-out ${(eyeDelay + 0.08).toFixed(2)}s forwards;"/>
  <path d="M12.5 15.5 Q16 17.5 19.5 15.5" stroke="${fill}" stroke-width="1.75" stroke-linecap="round" fill="none"
    style="opacity: 0; animation: caretIn .16s ease-out ${(eyeDelay + 0.16).toFixed(2)}s forwards;"/>
  <path d="M5 23 L8 26 L5 29" stroke="${faint}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"
    stroke-dasharray="${CHEVRON_LENGTH}"
    style="stroke-dashoffset: ${CHEVRON_LENGTH}; animation: promptDraw .5s cubic-bezier(.4,.1,.2,1) ${drawDelay.toFixed(2)}s forwards;"/>
  <rect x="10" y="24" width="4" height="5" rx="1" fill="${faint}"
    style="opacity: 0; animation: caretIn .16s ease-out ${(drawDelay + 0.46).toFixed(2)}s forwards;"/>
</g>`;
}
