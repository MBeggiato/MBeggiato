# Design — mbx.sh

Locked design system for the mbx.sh company site and related surfaces.
Future Hallmark / agent runs read this file first; pages defer to it.
Amend intentionally — the file is the rule.

Derived from the brand work in `brand/` and the profile-card language in
`scripts/` (Knockout mark, warm stone palette, Hack mono, prompt motion).

## Genre
modern-minimal · terminal vernacular

## Macrostructure family
- Marketing pages: **Prompt Stack** — full-bleed quiet paper, hero is brand
  mark + one line of shell-shaped copy, then stacked single-job sections
  (no 3-card feature grid, no stat strip in the first viewport).
- App / lab pages: **Dense Sheet** — monospace labels, hairline rules,
  content-first, no marketing enrichment.
- Content pages: **Long Document** — display headings, body prose, mono for
  code and meta.

## Theme
Custom · vibe: *"warm stone shell, ink is the accent"*

No loud brand colour. The knockout mark and ink fill carry identity.
Language / data colours (if shown) are desaturated ~30% toward paper.

Canonical values live in `tokens.css`. Hex is the source of truth:

| Role | Light | Dark |
| --- | --- | --- |
| paper | `#fafafa` | `#0f0f0e` |
| ink | `#2d2d2c` | `#fafafa` |
| muted | `#6f6f6a` | `#9a9a95` |
| rule / faint | `#ebebe6` | `#2a2a28` |
| accent | = ink | = ink |

## Typography
- Display: IBM Plex Sans, weight 600, roman, tracking `-0.02em`
- Body: IBM Plex Sans, weight 400
- Mono / brand: Hack (fallback IBM Plex Mono) — wordmark, prompts, labels,
  code, meta
- Wordmark: `mbx` bold ink + `.sh` regular at `opacity: 0.45`
- Labels: mono, tracking `0.09em`, often uppercase or sentence-case short
- Never italicise headings

Hack outlines for SVG / offline use: `brand/glyphs.json` (built by
`brand/build-glyphs.py`).

## Logo
- Mark: `brand/mbx-mark.svg` — rounded square, prompt + caret as knockout
  negative space. ViewBox `0 0 32 32`, body `28×28` at `rx=7`, all even
  coordinates (pixel-clean at 16px).
- Wordmark: `brand/mbx-wordmark.svg`
- Lockup: `brand/mbx-lockup.svg` (mark + wordmark)
- Favicon: `brand/favicon.svg` (theme-aware) + `brand/icons/`
- Colour via `currentColor` / `--color-ink`. Do not recolour the mark with
  a separate accent.

On marketing heroes the mark is a hero-level signal, not a tiny nav favicon.

## Spacing
4-point named scale in `tokens.css` (`--space-3xs` … `--space-4xl`).
Pages use named tokens only.

## Motion
- Signature: mark fades in → chevron draws (`stroke-dashoffset`,
  `--ease-draw`, ~500ms) → caret fades in.
- Secondary: short opacity fades (`--dur-micro` ~140ms), rise-in
  (`translateY` + opacity) on section titles.
- Typewriter / staggered glyph fades only where shell metaphor earns them.
- Prefer opacity + transform; avoid filter / blur noise.
- Reduced motion: opacity-only crossfades ≤ 150ms, no draw / typewriter.

## Microinteractions stance
- Quiet success — no celebratory confetti.
- Hover delay ~0 on primary controls; focus-visible ring = ink, 2px offset.
- Badges / chips: flat-square, not pills (except true toggles).

## CTA voice
- Primary: ink fill, `--color-accent-ink` text, `--radius-button`,
  padding `0.7em 1.15em`, mono or display medium weight. Copy is imperative
  and concrete (`Open an issue`, `View the lab`) — not `Get started`.
- Secondary: hairline ink border, transparent fill, same radius and padding.
- Ghost links: muted → ink on hover, underline offset.

## Voice & copy
- Register: plain, first person or direct second person, no hype.
- Shell flavour is allowed (`> full stack developer · self-hoster`) but
  sparingly — one prompt motif per viewport max.
- Prefer middots `·` as separators in meta lines.
- Do not invent metrics, customer counts, or testimonials.

## Brand scope
mbx.sh is the umbrella: software, hosting, personal label, self-hosting lab.
Pointless and other products keep their own marks; they do not replace the
mbx.sh knockout on overarching surfaces.

## What pages MUST share
- Knockout mark + `mbx` / `.sh` wordmark treatment
- Warm stone palette and ink-as-accent rule
- Display + mono pairing above
- CTA shape / radius / padding rhythm
- One job per section; no cards in the hero

## What pages MAY differ on
- Macrostructure within the page-type family
- How much shell / typewriter motion is used
- Enrichment (SVG mark animation, lab diagrams) — marketing only

## What to avoid
- Purple / indigo gradients, glow, glassmorphism
- Cream + terracotta + serif default
- Broadsheet dense columns with hairline-everything
- Inter / Roboto / Arial as primary faces
- Floating badge clusters, stat strips in the first viewport
- Using the Pointless logo for mbx.sh surfaces

## Per-page allowances
- Marketing: may animate the mark; may use Prompt Stack enrichment (Tier-B SVG).
- App / lab: no enrichment; function first.
- Content: typography + hairlines only.

## Exports
`tokens.css` (project root) is the source of truth. Copy it into a site
repo as needed. For Tailwind v4 `@theme`, DTCG `tokens.json`, or shadcn
variables, ask to extend this file.

### Key files
- `tokens.css` — CSS custom properties
- `brand/mbx-mark.svg` · `brand/mbx-wordmark.svg` · `brand/mbx-lockup.svg`
- `brand/favicon.svg` · `brand/icons/`
- `brand/glyphs.json` — Hack paths for SVG text
- `scripts/theme.ts` — same palette used by README cards
