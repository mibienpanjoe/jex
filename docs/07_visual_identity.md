# Jex — Visual Identity Guide
Version: v1.0, 2026-04-06

---

## Brand Essence

**Name:** Jex — a compressed form of "JSON env exchange", but functionally a sharp, short, developer-native name. One syllable. Easy to type. Easy to say in both English and French.

**Target audience:** Developer teams, with a specific focus on the African tech community — a large portion of which is francophone. The visual identity must feel modern, technical, and trustworthy without the sterile corporate look of enterprise SaaS.

**Personality:**
- **Trustworthy** — secrets management requires total confidence; the design should feel secure and deliberate
- **Developer-native** — comfortable with monospace fonts, dark interfaces, terminal aesthetics
- **Clean and direct** — no visual clutter; information density over decoration
- **Warm without being loud** — approachable for teams, not cold like a compliance tool

**Design principles:**
1. **Clarity over cleverness** — every UI element serves a function
2. **Dark-first** — the dashboard defaults to dark mode; developers live in dark terminals
3. **Density with breathing room** — pack information efficiently but never feel cramped
4. **Never decorate with color** — color signals state (success, danger, locked) not aesthetics
5. **Bilingual-ready** — layouts must accommodate both English and French string lengths without breaking

---

## Color System

### Primary Palette

| Token | Name | Hex | Use |
|-------|------|-----|-----|
| `--color-brand` | Jex Indigo | `#6366F1` | Primary CTA buttons, active nav items, links, focus rings |
| `--color-brand-hover` | Indigo Deep | `#4F46E5` | Hover state for brand-colored elements |
| `--color-brand-subtle` | Indigo Mist | `#EEF2FF` | Light-mode background tint for highlighted items |

### Neutral Scale (Dark Mode — Dashboard)

| Token | Hex | Use |
|-------|-----|-----|
| `--color-bg-base` | `#0D0F14` | Root page background |
| `--color-bg-surface` | `#141720` | Cards, panels, sidebars |
| `--color-bg-elevated` | `#1C2030` | Modals, dropdowns, tooltips |
| `--color-border` | `#2A2F42` | Dividers, input borders, card edges |
| `--color-border-subtle` | `#1F2336` | Subtle separators within panels |
| `--color-text-primary` | `#F0F2F8` | Body text, headings |
| `--color-text-secondary` | `#8B90A8` | Labels, placeholders, metadata |
| `--color-text-muted` | `#555A70` | Disabled text, empty states |

### Neutral Scale (Light Mode — Landing Page)

| Token | Hex | Use |
|-------|-----|-----|
| `--color-bg-base` | `#FAFAFA` | Page background |
| `--color-bg-surface` | `#FFFFFF` | Cards, panels |
| `--color-bg-elevated` | `#F4F5F9` | Code blocks, tags, muted regions |
| `--color-border` | `#E2E4EC` | Dividers, card borders |
| `--color-text-primary` | `#111318` | Body text, headings |
| `--color-text-secondary` | `#5A5F75` | Labels, metadata |
| `--color-text-muted` | `#A0A5B8` | Disabled, placeholders |

### Semantic Colors

| Token | Hex | Use |
|-------|-----|-----|
| `--color-success` | `#22C55E` | Secret saved, member invited, operation confirmed |
| `--color-success-subtle` | `#14532D` (dark) / `#DCFCE7` (light) | Success state backgrounds |
| `--color-warning` | `#F59E0B` | Staging environment badge, degraded state |
| `--color-warning-subtle` | `#451A03` (dark) / `#FEF3C7` (light) | Warning state backgrounds |
| `--color-danger` | `#EF4444` | Delete actions, revoke token, prod environment badge |
| `--color-danger-subtle` | `#450A0A` (dark) / `#FEE2E2` (light) | Destructive action backgrounds |
| `--color-prod` | `#EF4444` | Production environment label (always red — consistent signal) |
| `--color-staging` | `#F59E0B` | Staging environment label |
| `--color-dev` | `#22C55E` | Dev environment label |

### CSS Custom Properties (root declaration)

```css
:root {
  --color-brand: #6366F1;
  --color-brand-hover: #4F46E5;
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-prod: #EF4444;
  --color-staging: #F59E0B;
  --color-dev: #22C55E;
}

[data-theme="dark"] {
  --color-bg-base: #0D0F14;
  --color-bg-surface: #141720;
  --color-bg-elevated: #1C2030;
  --color-border: #2A2F42;
  --color-text-primary: #F0F2F8;
  --color-text-secondary: #8B90A8;
  --color-text-muted: #555A70;
}

[data-theme="light"] {
  --color-bg-base: #FAFAFA;
  --color-bg-surface: #FFFFFF;
  --color-bg-elevated: #F4F5F9;
  --color-border: #E2E4EC;
  --color-text-primary: #111318;
  --color-text-secondary: #5A5F75;
  --color-text-muted: #A0A5B8;
}
```

---

## Typography

| Role | Font | Weights | Use |
|------|------|---------|-----|
| Display | **Inter** | 700, 800 | Hero headings, page titles, marketing copy |
| UI Body | **Inter** | 400, 500, 600 | All interface text, labels, buttons, descriptions |
| Monospace | **JetBrains Mono** | 400, 500 | Secret keys, secret values, code blocks, CLI command examples, `.env` previews |

**Rationale:** Inter is the de facto standard for developer-facing SaaS interfaces. JetBrains Mono is widely used in developer tooling and communicates "this is a key or a value, treat it as code."

### Type Scale

| Name | Size | Line Height | Letter Spacing | Use |
|------|------|-------------|----------------|-----|
| `text-xs` | 12px | 1.4 | +0.02em | Badges, timestamps, fine print |
| `text-sm` | 13px | 1.5 | +0.01em | Secondary labels, table metadata |
| `text-base` | 14px | 1.6 | 0 | Primary UI text (dashboard default) |
| `text-md` | 16px | 1.5 | 0 | Subtitles, form labels |
| `text-lg` | 18px | 1.4 | -0.01em | Section headings in dashboard |
| `text-xl` | 22px | 1.3 | -0.02em | Page titles |
| `text-2xl` | 28px | 1.25 | -0.03em | Dashboard headers |
| `text-4xl` | 40px | 1.15 | -0.04em | Landing page hero title |
| `text-6xl` | 60px | 1.1 | -0.05em | Large hero displays |

Note: The dashboard uses 14px as the base body size, not 16px. Developer tools (VS Code, Linear, GitHub) all use 13–14px for interface density. The landing page uses 16px for readability.

---

## Spacing & Layout

**Base unit:** 4px (all spacing values are multiples: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128)

**Tailwind tokens:** Use standard Tailwind spacing scale (`p-1` = 4px, `p-2` = 8px, etc.)

### Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (240px fixed)  │  Main Content Area        │
│  ─────────────────────  │  ─────────────────────── │
│  Logo + project picker  │  Page header (48px)       │
│  Nav items              │  Content (scrollable)     │
│  ─────────────────────  │                           │
│  Account + settings     │                           │
└─────────────────────────────────────────────────────┘
```

- Sidebar: 240px wide on desktop, collapses to icon-only (56px) below 1024px, off-canvas below 768px
- Main content max-width: 1200px, centered within the content area
- Content horizontal padding: 24px (desktop), 16px (mobile)

### Responsive Breakpoints

| Name | Width | Behavior |
|------|-------|----------|
| `sm` | 640px | Single column layouts |
| `md` | 768px | Two column layouts, sidebar goes off-canvas |
| `lg` | 1024px | Sidebar collapses to icons |
| `xl` | 1280px | Full sidebar + full content |

---

## Component Styling

### Buttons

**Primary (brand action)**
```css
background: var(--color-brand);
color: #FFFFFF;
border-radius: 8px;
padding: 8px 16px;
font-size: 14px;
font-weight: 500;
transition: background 150ms ease-out;

&:hover { background: var(--color-brand-hover); }
&:focus-visible { box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.4); outline: none; }
&:disabled { opacity: 0.4; cursor: not-allowed; }
```

**Secondary (neutral action)**
```css
background: var(--color-bg-elevated);
color: var(--color-text-primary);
border: 1px solid var(--color-border);
border-radius: 8px;
padding: 8px 16px;

&:hover { background: var(--color-border); }
```

**Destructive (delete, revoke)**
```css
background: var(--color-danger);
color: #FFFFFF;
border-radius: 8px;
padding: 8px 16px;

&:hover { background: #DC2626; }
```

**Ghost (low-priority inline)**
```css
background: transparent;
color: var(--color-text-secondary);
padding: 6px 10px;

&:hover { background: var(--color-bg-elevated); color: var(--color-text-primary); }
```

---

### Cards

```css
background: var(--color-bg-surface);
border: 1px solid var(--color-border);
border-radius: 12px;
padding: 20px 24px;
```

Interactive cards (project list items):
```css
cursor: pointer;
transition: border-color 150ms ease-out, box-shadow 150ms ease-out;

&:hover {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}
```

---

### Inputs & Forms

**Text input:**
```css
background: var(--color-bg-base);
border: 1px solid var(--color-border);
border-radius: 8px;
padding: 8px 12px;
font-size: 14px;
color: var(--color-text-primary);
width: 100%;

&:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
  outline: none;
}
&::placeholder { color: var(--color-text-muted); }
&[data-invalid] { border-color: var(--color-danger); }
```

**Form labels:** 13px, `font-weight: 500`, `color: var(--color-text-secondary)`, `margin-bottom: 6px`

**Error messages:** 12px, `color: var(--color-danger)`, `margin-top: 4px`

---

### Secret Key Display

Secret keys are always rendered in monospace and treated as code:
```css
font-family: 'JetBrains Mono', monospace;
font-size: 13px;
color: var(--color-text-primary);
background: var(--color-bg-elevated);
padding: 2px 6px;
border-radius: 4px;
```

Secret values are hidden by default and revealed on demand:
- Default state: `••••••••` mask in text-muted color
- Reveal button: eye icon, ghost button style
- Once revealed, value renders in monospace with the same code styling

---

### Environment Badges

```
dev      → green badge   (--color-dev)
staging  → amber badge   (--color-staging)
prod     → red badge     (--color-prod)
custom   → gray badge    (--color-text-secondary)
```

Badge structure:
```css
display: inline-flex;
align-items: center;
gap: 4px;
padding: 2px 8px;
border-radius: 4px;
font-size: 12px;
font-weight: 500;
font-family: 'JetBrains Mono', monospace;
background: color-mix(in srgb, <env-color> 15%, var(--color-bg-surface));
color: <env-color>;
```

---

### Navigation (Dashboard Sidebar)

```css
/* Sidebar container */
width: 240px;
background: var(--color-bg-surface);
border-right: 1px solid var(--color-border);
display: flex;
flex-direction: column;
height: 100vh;
position: sticky;
top: 0;
```

**Nav items:**
```css
/* Default */
display: flex; align-items: center; gap: 10px;
padding: 8px 12px;
border-radius: 8px;
color: var(--color-text-secondary);
font-size: 14px; font-weight: 500;
cursor: pointer;
transition: color 100ms, background 100ms;

/* Hover */
&:hover { background: var(--color-bg-elevated); color: var(--color-text-primary); }

/* Active */
&[data-active] {
  background: rgba(99, 102, 241, 0.12);
  color: var(--color-brand);
  border-left: 2px solid var(--color-brand);
}
```

---

### Tables (Secret List, Audit Log)

```css
/* Table container */
border: 1px solid var(--color-border);
border-radius: 12px;
overflow: hidden;

/* Header row */
background: var(--color-bg-elevated);
font-size: 12px; font-weight: 600; text-transform: uppercase;
letter-spacing: 0.05em; color: var(--color-text-muted);
padding: 10px 16px;

/* Data rows */
border-top: 1px solid var(--color-border);
padding: 12px 16px;
font-size: 14px;

/* Row hover */
&:hover { background: var(--color-bg-elevated); }
```

---

## Motion & Animation

| Token | Value | Use |
|-------|-------|-----|
| `--duration-instant` | 80ms | Micro-interactions (checkbox, toggle) |
| `--duration-fast` | 150ms | Button hover, badge transitions |
| `--duration-base` | 200ms | Panel reveals, input focus rings |
| `--duration-slow` | 300ms | Modal open/close, sidebar collapse |
| `--duration-page` | 250ms | Page route transitions |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering the screen |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving the screen |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Elements moving across the screen |

**Key animations:**

*Modal open:*
```css
@keyframes modal-enter {
  from { opacity: 0; transform: scale(0.97) translateY(4px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
animation: modal-enter 200ms var(--ease-out);
```

*Secret value reveal:*
```css
transition: opacity 150ms var(--ease-out);
/* From masked → revealed: fade in the monospace value */
```

*Toast notification:*
```css
@keyframes toast-slide-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
animation: toast-slide-in 200ms var(--ease-out);
```

---

## Page-Level Patterns

### Landing Page Structure

```
Header (sticky)
  └── Logo | Nav links | Login | Get Started (CTA)

Hero
  └── Headline (text-4xl, bold)
  └── Sub-headline (text-md, secondary)
  └── CTA buttons: "Get Started for free" (primary) | "View on GitHub" (secondary)
  └── Terminal/CLI demo (code block showing jex run command)

Problem section
  └── 3-column grid: "No more .env files", "No more Slack DMs", "No more stale credentials"

How it works
  └── 3-step horizontal flow: Vault → CLI → Run

Features grid
  └── 6 feature cards: icons + title + 1-line description

CLI demo
  └── Animated terminal showing jex secrets pull and jex run

CTA banner
  └── "Start in 5 minutes" + install command in code block

Footer
  └── Logo | Links | GitHub | License
```

---

### Dashboard Structure

```
Sidebar (fixed)
  └── Jex logo + project picker (dropdown)
  └── Nav: Overview | Secrets | Members | Tokens | Audit | Settings

Main (scrollable)
  └── Page header: breadcrumb + page title + primary action button
  └── Environment tabs: [dev] [staging] [prod]
  └── Content area (changes per section)

Secrets page (primary content):
  └── Search input + "Add secret" button
  └── Secrets table: key name | last updated | actions (reveal / edit / delete)
  └── Empty state when no secrets

Members page:
  └── Members table: avatar + name + email | role badge | remove button
  └── "Invite member" button → modal

Audit page:
  └── Filters: env dropdown | operation dropdown | date range
  └── Audit events table: actor | operation | key | env | timestamp
```

---

## Accessibility Checklist

- [ ] All text meets WCAG 2.1 AA contrast ratios: 4.5:1 for body text, 3:1 for large text (≥ 18px or ≥ 14px bold)
- [ ] All interactive elements have visible focus indicators (3px ring, not just outline removal)
- [ ] Touch targets are ≥ 44×44px on mobile
- [ ] Color is never the sole indicator of state — environment badges have text labels, not just color
- [ ] `prefers-reduced-motion` is respected — all CSS animations are wrapped in `@media (prefers-reduced-motion: no-preference)`
- [ ] Semantic HTML throughout: `<button>` for actions, `<nav>` for navigation, `<main>` for content, `<table>` for tabular data
- [ ] Secret value "hidden" state is announced to screen readers with `aria-label="Value hidden, click to reveal"`
- [ ] Modals trap focus and are closable with `Escape`
- [ ] All icons have `aria-hidden="true"` when paired with a text label; `aria-label` when used alone

---

## Language & Tone Guidelines

**English (v0.1 launch):**
- Use second person ("your vault", "your team") — never first person ("our platform")
- Prefer active voice: "Set a secret" not "A secret can be set"
- Avoid enterprise jargon: say "secret" not "credential", "remove" not "deprovision"
- Error messages should explain what happened and what to do next: "This key already exists in dev. Use a different name or update the existing secret."
- CLI output: lowercase, no punctuation at end of lines (matches terminal conventions)

**French (v0.2):**
- Use "vous" (formal vous), not "tu" — professional context
- Preserve technical terms in English where industry standard: `secret`, `vault`, `.env`, `token`
- UI strings to be reviewed by a native French developer, not machine-translated
