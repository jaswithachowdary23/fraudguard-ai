# Design Brief

## Direction & Tone
Dark fintech fraud detection dashboard. Serious, trustworthy, security-focused aesthetic. Anti-generic — institutional banking visual language with purpose-driven risk semantics. Dashboard-as-control-center conceptual foundation.

## Color Palette (OKLCH)
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| primary | 0.58 0.11 283 | 0.68 0.12 283 | Core brand, active states, sidebar highlight |
| secondary | 0.35 0.06 263 | 0.42 0.07 263 | Institutional depth, secondary actions |
| accent | 0.75 0.18 220 | 0.82 0.2 220 | Alerts, highlights, active navigation |
| destructive | 0.6 0.23 22 | 0.68 0.25 25 | High-risk fraud scoring, danger states |
| success | green-500 | green-400 | Low-risk safe transactions, validation |
| warning | yellow-500 | yellow-400 | Medium-risk flagged transactions |
| background | 0.99 0 0 | 0.11 0 0 | Page canvas |
| card | 1.0 0 0 | 0.16 0 0 | Elevated surfaces |
| border | 0.88 0 0 | 0.25 0 0 | Subtle separation |

## Typography
**Display**: Space Grotesk (geometric, modern fintech-forward, headlines & brand moments)
**Body**: Satoshi (refined, rounded-friendly, professional copy with warmth)
**Mono**: JetBrains Mono (risk scores, metrics, code-like confidence)

## Elevation & Depth
Card-based hierarchy: subtle border + shadow (shadow-xs for raised) + darker background. Borders signal containment; shadows create subtle layering. No harsh drop shadows or glows.

## Structural Zones
| Zone | Surface | Treatment |
|------|---------|-----------|
| Header | card | border-b, logo + nav, compact padding |
| Sidebar | card | darker bg, active state via accent highlight + border-l, smooth hover transitions |
| Content | background | grid of metric-card surfaces, breathing space between sections |
| Chart area | card | border + shadow, recharts styled via OKLCH chart-* tokens |
| Alert banner | destructive/10 | border destructive/30, icon + copy, full-width above fold |
| Footer | muted/30 | border-t, centered text, low visual weight |

## Component Patterns
**Risk Badges**: `badge-fraud` (red, semantic destructive), `badge-safe` (green). Inline pills with icon + label.
**Risk Score Display**: Mono font, large size, color-coded background (red > yellow > green).
**Metric Cards**: 6-column grid, uniform height, hover state brightens border to primary/50.
**Chart Containers**: Card-elevated wrapper, legend below, Recharts responsive.
**Alert Banners**: Full-width, icon + messaging, dismissible (optional).

## Spacing & Rhythm
6px base unit. Card padding 1.5rem (24px). Grid gaps 1rem (16px). Sidebar width 256px. Content max-width 1400px centered.

## Motion
`transition-smooth`: 0.3s cubic-bezier(0.4, 0, 0.2, 1) on hover states, color changes, border shifts. No animations on page load (fintech = stability). Subtle fade-in for data updates.

## Signature Detail
Risk color semantic triadic (red/yellow/green) replaces generic traffic lights — each tied to fraud model confidence thresholds. Cyan accent (0.82 0.2 220) used sparingly for "live" active states and critical alerts, signaling security watch.

## Dark Mode Strategy
Primary-only. Backgrounds darken to 11% (deep, institutional). Text raises to 92% (high contrast). Borders become 25% (visible against dark bg). Accents brighten to 82% for visibility. Chart colors adjusted for dark readability.
