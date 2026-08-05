/**
 * Regenerates every animated card plus the generated regions of README.md.
 *
 * Run by .github/workflows/readme.yml on a schedule, and locally via
 * `bun run build`.
 */

import { fetchProfile, type ProfileData, type RepoSummary } from "./github";
import { picture, replaceBlock } from "./readme";
import { THEMES, THEME_NAMES, type ThemeName } from "./theme";
import { renderHeader } from "./cards/header";
import { renderStats } from "./cards/stats";
import { renderLanguages } from "./cards/languages";
import { renderContributions } from "./cards/contributions";

const ROOT = new URL("../", import.meta.url);
const ASSETS = new URL("./assets/", ROOT);

type CardName = "header" | "stats" | "languages" | "contributions";

function renderCard(card: CardName, theme: ThemeName, profile: ProfileData): string {
  const t = THEMES[theme];
  switch (card) {
    case "header":
      return renderHeader(t);
    case "stats":
      return renderStats(t, profile);
    case "languages":
      return renderLanguages(t, profile.languages);
    case "contributions":
      return renderContributions(t, profile.weeks, profile.totalContributions);
  }
}

/**
 * Rendered as real Markdown rather than baked into a card, so the links stay
 * clickable and the list works for screen readers.
 */
function projectList(repos: RepoSummary[]): string {
  return repos
    .map((repo) => {
      const parts = [`**[${repo.name}](${repo.url})**`];
      if (repo.description) parts.push(repo.description.trim());
      if (repo.stars > 0) parts.push(`${repo.stars} ★`);
      return `- ${parts.join(" · ")}`;
    })
    .join("\n");
}

const profile = await fetchProfile();

const cards: CardName[] = ["header", "stats", "languages", "contributions"];
const written: { path: string; content: string }[] = [];

for (const card of cards) {
  for (const theme of THEME_NAMES) {
    written.push({
      path: `assets/${card}-${theme}.svg`,
      content: renderCard(card, theme, profile),
    });
  }
}

// A content hash means the cache-busting query only changes when a card really
// changed, which keeps the README diff quiet on no-op runs.
const hasher = new Bun.CryptoHasher("sha256");
for (const file of written) hasher.update(file.content);
const version = hasher.digest("hex").slice(0, 8);

await Bun.$`mkdir -p ${Bun.fileURLToPath(ASSETS)}`.quiet();
for (const file of written) {
  await Bun.write(new URL(file.path, ROOT), file.content);
}

const statsAlt = `At a glance: ${profile.repoCount} repositories, ${profile.totalStars} stars earned, ${profile.totalContributions} contributions, ${profile.followers} followers`;

// stats and languages are half-width so they sit on one line; if a narrow
// viewport cannot fit both, they simply stack.
const generated = [
  picture({ card: "header", alt: "Marcel Beggiato — full stack developer, self-hoster, Germany", version }),
  "",
  picture({ card: "stats", alt: statsAlt, version }),
  picture({ card: "languages", alt: "Most used languages across my public repositories", version }),
  "",
  picture({
    card: "contributions",
    alt: `Contribution graph: ${profile.totalContributions} contributions in the last year`,
    version,
  }),
].join("\n");

const readmePath = new URL("./README.md", ROOT);
let readme = await Bun.file(readmePath).text();
readme = replaceBlock(readme, "GENERATED", generated);
readme = replaceBlock(readme, "PROJECTS", projectList(profile.topRepos));
await Bun.write(readmePath, readme);

const totalBytes = written.reduce((sum, f) => sum + Buffer.byteLength(f.content), 0);
const largest = written.reduce((a, b) => (Buffer.byteLength(a.content) > Buffer.byteLength(b.content) ? a : b));

console.log(`${written.length} Karten geschrieben, Version ${version}`);
console.log(`Gesamt ${(totalBytes / 1024).toFixed(1)} KB, groesste Datei ${largest.path} mit ${(Buffer.byteLength(largest.content) / 1024).toFixed(1)} KB`);
