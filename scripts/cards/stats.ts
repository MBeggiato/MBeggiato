import { renderText } from "../glyphs";
import { fadeUpKeyframes, riseIn, svgDocument } from "../svg";
import type { Theme } from "../theme";
import type { ProfileData } from "../github";

export const STATS_WIDTH = 404;
export const STATS_HEIGHT = 220;

const PAD = 30;
const COLUMN_TWO = 212;

interface Stat {
  value: string;
  label: string;
}

export function renderStats(theme: Theme, profile: ProfileData): string {
  const stats: Stat[] = [
    { value: profile.repoCount.toString(), label: "REPOSITORIES" },
    { value: profile.totalStars.toString(), label: "STARS EARNED" },
    { value: profile.totalContributions.toLocaleString("en-US"), label: "CONTRIBUTIONS" },
    { value: profile.followers.toString(), label: "FOLLOWERS" },
  ];

  const cellFor = (stat: Stat, index: number) => {
    const x = index % 2 === 0 ? PAD : COLUMN_TWO;
    const numberBaseline = index < 2 ? 100 : 168;
    return `<g class="s${index}">
${renderText(stat.value, x, numberBaseline, { size: 34, weight: "bold", fill: theme.fg, tracking: -0.02 })}
${renderText(stat.label, x, numberBaseline + 20, { size: 10, weight: "regular", fill: theme.muted, tracking: 0.09 })}
</g>`;
  };

  const style = `${fadeUpKeyframes()}
.title { ${riseIn(0.05, 0.5)} }
${stats.map((_, i) => `.s${i} { ${riseIn(0.2 + i * 0.09, 0.55)} }`).join("\n")}`;

  const body = `${renderText("At a glance", PAD, 36, { size: 15, weight: "bold", fill: theme.fg, className: "title" })}
${stats.map(cellFor).join("\n")}`;

  return svgDocument({
    width: STATS_WIDTH,
    height: STATS_HEIGHT,
    title: `At a glance: ${stats.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(", ")}`,
    style,
    body,
  });
}
