import { renderMark, markStyle } from "../mark";
import {
  TYPE_FADE,
  X_HEIGHT_RATIO,
  measureText,
  renderText,
  renderTypedText,
  typedTextStyle,
} from "../glyphs";
import { fadeUpKeyframes, n, riseIn, svgDocument } from "../svg";
import type { Theme } from "../theme";

export const HEADER_WIDTH = 840;
export const HEADER_HEIGHT = 190;

const NAME = "Marcel Beggiato";
const TAGLINE = "full stack developer · self-hoster · Germany";

const PAD = 44;
const MARK_SIZE = 84;
const TEXT_X = PAD + MARK_SIZE + 30;

const WORDMARK_SIZE = 26;

export function renderHeader(theme: Theme): string {
  const nameSize = 40;
  const taglineSize = 18;
  const nameBaseline = 90;
  const taglineBaseline = 124;

  // The mbx.sh wordmark sits on the right so the card reads as one composition
  // instead of a left-aligned block with accidental empty space.
  const brandBold = measureText("mbx", { size: WORDMARK_SIZE, weight: "bold" });
  const brandLight = measureText(".sh", { size: WORDMARK_SIZE, weight: "regular" });
  const brandX = HEADER_WIDTH - PAD - brandBold - brandLight;
  const brandBaseline = HEADER_HEIGHT / 2 + (WORDMARK_SIZE * X_HEIGHT_RATIO) / 2;

  // The prompt glyph echoes the mascot and anchors the typed line.
  const promptWidth = measureText("> ", { size: taglineSize, weight: "bold" });
  const typedX = TEXT_X + promptWidth;

  const typed = renderTypedText(TAGLINE, typedX, taglineBaseline, {
    size: taglineSize,
    weight: "regular",
    fill: theme.muted,
    startDelay: 1.15,
    perChar: 0.028,
  });

  const nameWidth = measureText(NAME, { size: nameSize, weight: "bold", tracking: -0.015 });
  assertFits("Name", TEXT_X + nameWidth, brandX - 24);
  assertFits("Tagline", typedX + typed.width, brandX - 24);

  const caretWidth = taglineSize * 0.5;
  const caretHeight = taglineSize * X_HEIGHT_RATIO;
  const typingDuration = typed.endTime - 1.15;
  const blinkStart = typed.endTime + 0.1;

  const style = `${markStyle()}
${typedTextStyle()}
${fadeUpKeyframes()}
@keyframes caretTravel {
  from { transform: translateX(0); }
  to   { transform: translateX(${n(typed.width)}px); }
}
@keyframes caretBlink {
  0%, 49%   { opacity: 1; }
  50%, 100% { opacity: 0; }
}
.name { ${riseIn(0.62, 0.6)} }
.prompt { ${riseIn(0.95, 0.45)} }
.brand { ${riseIn(0.8, 0.6)} }
.caret-in { opacity: 0; animation: typeIn ${TYPE_FADE}s ease-out 1.15s forwards; }
.caret {
  animation: caretTravel ${typingDuration.toFixed(2)}s steps(${TAGLINE.length}) 1.15s both,
             caretBlink 1.06s steps(1) ${blinkStart.toFixed(2)}s infinite;
}`;

  const body = `${renderMark({ x: PAD, y: (HEADER_HEIGHT - MARK_SIZE) / 2, size: MARK_SIZE, fill: theme.fg, faint: theme.faint, id: "header-mark", delay: 0.1 })}
${renderText(NAME, TEXT_X, nameBaseline, { size: nameSize, weight: "bold", fill: theme.fg, tracking: -0.015, className: "name" })}
${renderText("> ", TEXT_X, taglineBaseline, { size: taglineSize, weight: "bold", fill: theme.fg, className: "prompt" })}
${typed.markup}
<g class="caret-in" transform="translate(${n(typedX)} ${n(taglineBaseline)})">
  <rect class="caret" x="1" y="${n(-caretHeight)}" width="${n(caretWidth)}" height="${n(caretHeight)}" rx="1" fill="${theme.fg}"/>
</g>
<g class="brand">
${renderText("mbx", brandX, brandBaseline, { size: WORDMARK_SIZE, weight: "bold", fill: theme.fg })}
${renderText(".sh", brandX + brandBold, brandBaseline, { size: WORDMARK_SIZE, weight: "regular", fill: theme.fg, opacity: 0.45 })}
</g>`;

  return svgDocument({
    width: HEADER_WIDTH,
    height: HEADER_HEIGHT,
    title: `${NAME} — ${TAGLINE.replace(/ · /g, ", ")} — mbx.sh`,
    style,
    body,
  });
}

/**
 * Text is baked to paths at build time, so an overflow would ship silently as a
 * clipped card. Fail the build instead.
 */
function assertFits(what: string, right: number, limit: number): void {
  if (right > limit) {
    throw new Error(
      `${what} laeuft in der Header-Karte ueber: endet bei ${right.toFixed(1)}, erlaubt bis ${limit.toFixed(1)}.`,
    );
  }
}
