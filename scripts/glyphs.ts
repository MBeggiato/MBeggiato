/**
 * Sets text as SVG path data.
 *
 * GitHub renders README images in an isolated <img> context where @font-face and
 * external stylesheets are blocked, so no card may depend on a font being
 * available. Outlines are extracted at authoring time by brand/build-glyphs.py.
 */

interface Glyph {
  d: string;
  aw: number;
}

interface GlyphData {
  upem: number;
  xHeight: number;
  capHeight: number;
  ascender: number;
  descender: number;
  weights: Record<Weight, Record<string, Glyph>>;
}

export type Weight = "bold" | "regular";

const DATA: GlyphData = await Bun.file(new URL("../brand/glyphs.json", import.meta.url)).json();

export const UPEM = DATA.upem;
export const X_HEIGHT_RATIO = DATA.xHeight / DATA.upem;
export const CAP_HEIGHT_RATIO = DATA.capHeight / DATA.upem;

export interface TextOptions {
  size: number;
  weight?: Weight;
  /** Extra spacing between characters, as a fraction of the em. */
  tracking?: number;
  fill?: string;
  opacity?: number;
  /** Class applied to the wrapping group, for CSS animation targeting. */
  className?: string;
}

function glyphsFor(text: string, weight: Weight): Glyph[] {
  const table = DATA.weights[weight];
  const out: Glyph[] = [];
  for (const char of text) {
    const glyph = table[char];
    if (!glyph) {
      throw new Error(
        `Zeichen "${char}" fehlt in glyphs.json. Charset in brand/build-glyphs.py erweitern und neu erzeugen.`,
      );
    }
    out.push(glyph);
  }
  return out;
}

/** Advance width in user units, so callers can centre or right-align text. */
export function measureText(text: string, opts: TextOptions): number {
  const glyphs = glyphsFor(text, opts.weight ?? "regular");
  const tracking = (opts.tracking ?? 0) * UPEM;
  const units = glyphs.reduce((sum, g) => sum + g.aw + tracking, 0) - tracking;
  return (units * opts.size) / UPEM;
}

/**
 * Renders text with its baseline at (x, y).
 *
 * Font outlines are Y-up, so the group carries a negative Y scale; glyph
 * coordinates stay in font units and each glyph is offset by its advance.
 */
export function renderText(text: string, x: number, y: number, opts: TextOptions): string {
  const weight = opts.weight ?? "regular";
  const glyphs = glyphsFor(text, weight);
  const tracking = (opts.tracking ?? 0) * UPEM;
  const scale = opts.size / UPEM;

  const parts: string[] = [];
  let pen = 0;
  for (const glyph of glyphs) {
    if (glyph.d) {
      const offset = pen === 0 ? "" : ` transform="translate(${round(pen)} 0)"`;
      parts.push(`<path${offset} d="${glyph.d}"/>`);
    }
    pen += glyph.aw + tracking;
  }

  const attrs = [
    `transform="translate(${round(x)} ${round(y)}) scale(${scale.toFixed(5)} -${scale.toFixed(5)})"`,
    `fill="${opts.fill ?? "currentColor"}"`,
  ];
  if (opts.opacity !== undefined) attrs.push(`fill-opacity="${opts.opacity}"`);

  const inner = `<g ${attrs.join(" ")}>${parts.join("")}</g>`;

  // A CSS transform animation replaces the transform attribute on the same
  // element, which would throw away the positioning and scale above. The
  // animated class therefore always goes on a wrapper that carries no transform.
  return opts.className ? `<g class="${opts.className}">${inner}</g>` : inner;
}

export interface TypedTextOptions extends TextOptions {
  /** Seconds before the first character appears. */
  startDelay: number;
  /** Seconds between characters. */
  perChar: number;
}

export interface TypedText {
  markup: string;
  width: number;
  /** Seconds from document start until the last character has appeared. */
  endTime: number;
}

/**
 * Reveals one character at a time.
 *
 * Each glyph is its own group so the effect needs nothing but staggered opacity,
 * the single most reliable property to animate inside a GitHub-hosted SVG. A
 * sliding cover rectangle would need the page background colour, which differs
 * between GitHub themes and cannot be assumed.
 */
export function renderTypedText(
  text: string,
  x: number,
  y: number,
  opts: TypedTextOptions,
): TypedText {
  const weight = opts.weight ?? "regular";
  const glyphs = glyphsFor(text, weight);
  const tracking = (opts.tracking ?? 0) * UPEM;
  const scale = opts.size / UPEM;

  const parts: string[] = [];
  let pen = 0;
  let index = 0;
  for (const glyph of glyphs) {
    if (glyph.d) {
      const delay = opts.startDelay + index * opts.perChar;
      parts.push(
        `<g transform="translate(${round(x + (pen * opts.size) / UPEM)} ${round(y)}) scale(${scale.toFixed(5)} -${scale.toFixed(5)})" style="opacity:0;animation:typeIn ${TYPE_FADE}s ease-out ${delay.toFixed(2)}s forwards;"><path d="${glyph.d}"/></g>`,
      );
    }
    pen += glyph.aw + tracking;
    index++;
  }

  const width = ((pen - tracking) * opts.size) / UPEM;
  const fill = opts.fill ?? "currentColor";
  const opacity = opts.opacity !== undefined ? ` fill-opacity="${opts.opacity}"` : "";

  return {
    markup: `<g fill="${fill}"${opacity}>${parts.join("")}</g>`,
    width,
    endTime: opts.startDelay + (glyphs.length - 1) * opts.perChar,
  };
}

/**
 * Deliberately not an instant step.
 *
 * A `steps(1)` reveal with a 10ms duration looks right in theory but is
 * unreliable in practice: if the compositor never samples that tiny active
 * window, the forwards fill is not applied and the character stays invisible
 * even though the animation reports itself as finished. A short real fade always
 * gets sampled, and the stagger is what sells the typing effect anyway.
 */
export const TYPE_FADE = 0.14;

export function typedTextStyle(): string {
  return `@keyframes typeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}`;
}

function round(v: number): string {
  return Number(v.toFixed(1)).toString();
}
