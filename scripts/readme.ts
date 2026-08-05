/**
 * Rewrites only the marked regions of README.md, so hand-written prose around
 * them survives every build.
 */

export function replaceBlock(content: string, name: string, replacement: string): string {
  const start = `<!-- ${name}:START -->`;
  const end = `<!-- ${name}:END -->`;
  const pattern = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`);

  if (!pattern.test(content)) {
    throw new Error(`Marker ${start} ... ${end} fehlt in README.md.`);
  }

  return content.replace(pattern, `${start}\n${replacement.trim()}\n${end}`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface PictureOptions {
  /** Base file name without the theme suffix, e.g. "header". */
  card: string;
  alt: string;
  version: string;
  width?: number;
}

/**
 * GitHub honours <picture> with prefers-color-scheme, which is the only way to
 * serve a different asset per theme. The version query busts the camo cache,
 * which otherwise keeps serving a stale image after the asset changes.
 */
export function picture({ card, alt, version, width }: PictureOptions): string {
  const widthAttr = width ? ` width="${width}"` : "";
  return `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/${card}-dark.svg?v=${version}">
  <img alt="${alt}" src="assets/${card}-light.svg?v=${version}"${widthAttr}>
</picture>`;
}
