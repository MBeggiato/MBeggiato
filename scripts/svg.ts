/**
 * SVG assembly helpers shared by the cards.
 *
 * Animation is deliberately limited to transform, opacity, fill and
 * stroke-dashoffset: those are the properties that behave reliably once GitHub
 * serves the file through its camo image proxy. animateTransform and animated
 * layout properties such as width are unreliable there and are not used.
 */

export interface DocumentOptions {
  width: number;
  height: number;
  /** Read out by screen readers and shown when images are disabled. */
  title: string;
  style: string;
  body: string;
}

export function svgDocument({ width, height, title, style, body }: DocumentOptions): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" fill="none" role="img" aria-label="${escapeAttr(title)}">
<title>${escapeText(title)}</title>
<style>
${style.trim()}
</style>
${body.trim()}
</svg>
`;
}

export function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function escapeAttr(value: string): string {
  return escapeText(value).replace(/"/g, "&quot;");
}

/**
 * Entrance animations run once and settle, so the README is lively on load
 * without anything continuing to move while the page is read.
 */
export const ENTRANCE = "cubic-bezier(.2,.7,.3,1)";

export function fadeUpKeyframes(): string {
  return `@keyframes riseIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}`;
}

export function riseIn(delay: number, duration = 0.55): string {
  return `opacity: 0; animation: riseIn ${duration}s ${ENTRANCE} ${delay.toFixed(2)}s forwards;`;
}

/** Rounds to one decimal to keep the generated files small and diff-friendly. */
export function n(value: number): string {
  return Number(value.toFixed(1)).toString();
}
