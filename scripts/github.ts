/**
 * Reads everything the cards need from the GitHub GraphQL API in two requests.
 *
 * In CI the workflow's GITHUB_TOKEN is enough, since only public data is used.
 * Locally the script falls back to the gh CLI's token so no secret has to be
 * exported by hand.
 */

export const LOGIN = "MBeggiato";

export interface ContributionDay {
  date: string;
  count: number;
}

export interface LanguageShare {
  name: string;
  color: string;
  bytes: number;
  share: number;
}

export interface RepoSummary {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  language: string | null;
  pushedAt: string;
}

export interface ProfileData {
  name: string;
  login: string;
  followers: number;
  totalContributions: number;
  days: ContributionDay[];
  /** Calendar columns as GitHub groups them, so the grid can be laid out directly. */
  weeks: ContributionDay[][];
  repoCount: number;
  totalStars: number;
  languages: LanguageShare[];
  topRepos: RepoSummary[];
  generatedAt: string;
}

async function resolveToken(): Promise<string> {
  const fromEnv = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (fromEnv) return fromEnv;

  const proc = Bun.spawnSync(["gh", "auth", "token"]);
  const token = proc.success ? new TextDecoder().decode(proc.stdout).trim() : "";
  if (token) return token;

  throw new Error(
    "Kein GitHub-Token gefunden. GITHUB_TOKEN setzen oder lokal mit 'gh auth login' anmelden.",
  );
}

async function graphql<T>(query: string, token: string): Promise<T> {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "mbeggiato-profile-build",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API antwortete mit ${response.status}: ${await response.text()}`);
  }

  const payload = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (payload.errors?.length) {
    throw new Error(`GraphQL-Fehler: ${payload.errors.map((e) => e.message).join("; ")}`);
  }
  if (!payload.data) throw new Error("GraphQL-Antwort ohne data-Feld.");
  return payload.data;
}

const PROFILE_QUERY = `query {
  user(login: "${LOGIN}") {
    name
    login
    followers { totalCount }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
      totalCount
      nodes {
        name
        description
        url
        stargazerCount
        pushedAt
        primaryLanguage { name }
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name color } }
        }
      }
    }
  }
}`;

interface RawProfile {
  user: {
    name: string;
    login: string;
    followers: { totalCount: number };
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
      };
    };
    repositories: {
      totalCount: number;
      nodes: {
        name: string;
        description: string | null;
        url: string;
        stargazerCount: number;
        pushedAt: string;
        primaryLanguage: { name: string } | null;
        languages: { edges: { size: number; node: { name: string; color: string | null } }[] };
      }[];
    };
  };
}

export async function fetchProfile(): Promise<ProfileData> {
  const token = await resolveToken();
  const data = await graphql<RawProfile>(PROFILE_QUERY, token);
  const user = data.user;

  const weeks: ContributionDay[][] = user.contributionsCollection.contributionCalendar.weeks.map(
    (week) => week.contributionDays.map((day) => ({ date: day.date, count: day.contributionCount })),
  );
  const days: ContributionDay[] = weeks.flat();

  const byLanguage = new Map<string, LanguageShare>();
  let totalStars = 0;
  for (const repo of user.repositories.nodes) {
    totalStars += repo.stargazerCount;
    for (const edge of repo.languages.edges) {
      const key = edge.node.name;
      const existing = byLanguage.get(key);
      if (existing) {
        existing.bytes += edge.size;
      } else {
        byLanguage.set(key, {
          name: key,
          color: edge.node.color ?? "#8b8b86",
          bytes: edge.size,
          share: 0,
        });
      }
    }
  }

  const languages = [...byLanguage.values()].sort((a, b) => b.bytes - a.bytes);
  const languageTotal = languages.reduce((sum, l) => sum + l.bytes, 0) || 1;
  for (const language of languages) {
    language.share = language.bytes / languageTotal;
  }

  const topRepos = [...user.repositories.nodes]
    .sort((a, b) => b.stargazerCount - a.stargazerCount || b.pushedAt.localeCompare(a.pushedAt))
    .slice(0, 5)
    .map((repo) => ({
      name: repo.name,
      description: repo.description,
      url: repo.url,
      stars: repo.stargazerCount,
      language: repo.primaryLanguage?.name ?? null,
      pushedAt: repo.pushedAt,
    }));

  return {
    name: user.name,
    login: user.login,
    followers: user.followers.totalCount,
    totalContributions: user.contributionsCollection.contributionCalendar.totalContributions,
    days,
    weeks,
    repoCount: user.repositories.totalCount,
    totalStars,
    languages,
    topRepos,
    generatedAt: new Date().toISOString(),
  };
}
