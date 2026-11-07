# Lungent Design System Specification (v1.2)

> Intelligent Lung Health Assessment — Understand risk. Reveal insights. Guide decisions.

---

## 1. Brand Identity & Visual Language

Lungent is engineered as a modern, trustworthy, and sophisticated healthcare technology platform. Its design language bridges clinical precision for medical practitioners with empathetic clarity for patients and community field workers.

### Brand Characteristics
- **Clinical Precision:** Crisp borders, clear hierarchy, high visual contrast, and absence of frivolous visual noise.
- **Calm Reassurance:** Pulmonary-inspired deep teal palette replacing generic corporate blue, conveying life, oxygenation, and respiratory health.
- **Empathetic Simplicity:** Patient-facing cards with generous typography, clear plain-language guidance, and prominent status pills.
- **Non-Misleading Integrity:** Visual cues never imply clinical diagnosis or certification prematurely. Every risk stratification level explicitly notes guideline criteria.

### Brand Mark Motif
The Lungent mark represents the human thoracic pulmonary tree:
- **Central Trachea Stem:** Vertical airway line of truth and support.
- **Bilateral Lobar Arches:** Left and right bronchial branching geometry.
- **Assessment Pulse Node:** Central core indicator symbolizing diagnostic risk evaluation.

---

## 2. Color Palette & Semantic Tiers

Built with modern CSS variables and OKLCH color spaces calibrated for WCAG 2.2 AA contrast compliance.

### 2.1 Core Brand Colors
| Token | OKLCH Value | HEX Approximation | Purpose |
|---|---|---|---|
| `--primary` | `oklch(0.48 0.14 195)` | `#0f766e` (Teal 700) | Brand primary, key actions, active tabs |
| `--primary-foreground` | `oklch(0.99 0 0)` | `#ffffff` | Text on primary surfaces |
| `--primary-hover` | `oklch(0.42 0.14 195)` | `#115e59` (Teal 800) | Hover state for primary buttons |
| `--secondary` | `oklch(0.94 0.015 220)` | `#f1f5f9` (Slate 100) | Secondary surfaces, subtle buttons |
| `--secondary-foreground` | `oklch(0.24 0.03 220)` | `#0f172a` (Slate 900) | Text on secondary surfaces |
| `--accent` | `oklch(0.94 0.03 195)` | `#ccfbf1` (Teal 100) | Highlight badges, subtle active items |

### 2.2 Semantic Healthcare & Risk Tiers
| Tier / Status | CSS Token | Badge Background | Meaning & Usage |
|---|---|---|---|
| **Low Risk** | `--success` (`oklch(0.55 0.16 150)`) | `bg-emerald-50 text-emerald-800` | Baseline lung risk, negative red flags |
| **Moderate Risk** | `--warning` (`oklch(0.68 0.16 65)`) | `bg-amber-50 text-amber-800` | Intermediate risk, annual monitoring recommended |
| **High Risk** | `--destructive` (`oklch(0.55 0.22 25)`) | `bg-rose-50 text-rose-800` | Meets LDCT screening criteria |
| **Critical Red-Flag** | `--destructive` + animate pulse | `bg-red-100 text-red-900 ring-1` | Emergency symptom triage (e.g. hemoptysis) |
| **Clinical Guideline** | `--info` (`oklch(0.56 0.15 240)`) | `bg-sky-50 text-sky-800` | USPSTF / national guideline notices |

---

## 3. Typography System & Bilingual Support

Lungent natively supports dual **English (`en`)** and **Bangla (`bn`)** typography without layout breaking or clipped ascenders/descenders.

### 3.1 Typefaces
- **Latin / English:** `Geist` (Modern grotesque sans-serif with high tabular numeric clarity).
- **Bangla (`বাংলা`):** `Hind Siliguri` (Google Font optimized for Bengali conjuncts, vowel diacritics, and screen legibility in Bangladesh).

### 3.2 Typographic Hierarchy
| Role | Font Size | Line Height | Weight | Letter Spacing |
|---|---|---|---|---|
| `display` | 40px (`2.5rem`) | 1.2 | Extrabold (800) | `-0.02em` |
| `h1` | 32px (`2rem`) | 1.25 | Bold (700) | `-0.02em` |
| `h2` | 24px (`1.5rem`) | 1.3 | Semi-bold (600) | `-0.01em` |
| `h3` | 20px (`1.25rem`) | 1.4 | Semi-bold (600) | `-0.01em` |
| `body` | 15px (`0.9375rem`) | 1.6 (1.7 in Bangla) | Regular (400) | Normal |
| `body-sm` | 13px (`0.8125rem`) | 1.5 | Regular (400) | Normal |
| `caption` | 12px (`0.75rem`) | 1.4 | Medium (500) | `+0.01em` |

---

## 4. Design Tokens Reference

All design tokens are centralized in [`src/lib/design-tokens.ts`](file:///Users/kazi/Projects/Lungent/src/lib/design-tokens.ts) and configured in `src/app/globals.css`.

### Spacing Tokens
- `compact`: `0.5rem` (8px) — tight lists, table cells, form item gaps.
- `standard`: `1rem` (16px) — card padding, button padding.
- `section`: `2rem` (32px) — intra-section spacing.
- `container`: `3rem` (48px) — container margins.
- `page`: `4rem` (64px) — page vertical padding.

### Layout Dimensions
- `maxContentWidth`: `1280px`
- `sidebarWidth`: `256px` (`w-64`)
- `sidebarCollapsedWidth`: `64px` (`w-16`)
- `headerHeight`: `64px` (`h-16`)

---

## 5. Component Library Architecture

### 5.1 Basic UI Components (`src/components/ui/`)
- **`Button` / `IconButton`**: Variants: `default`, `secondary`, `outline`, `ghost`, `destructive`, `success`, `warning`, `subtle`, `link`. Includes `loading` state (`aria-busy`), `leftIcon`, `rightIcon`.
- **`Badge`**: Status pills with optional live `dot` indicator.
- **`Avatar`**: User profile picture with fallback initials and availability status indicator (`online`, `busy`, `away`, `offline`).
- **`Separator`**: Accessible divider with `orientation="horizontal" | "vertical"`.
- **`Tooltip`**: Accessible hover/focus popup bound with `aria-describedby`.
- **`Progress`**: ARIA progressbar with percentage calculation and status color variants.
- **`Skeleton`**: Subtle animated pulse loader for content placeholders.

### 5.2 Form Components (`src/components/forms/` & `src/components/ui/`)
- **`FormField`**: Wraps any control, managing `<label>`, `required` indicator, helper text, and error alert linked via `aria-describedby` and `id`.
- **`Input`**: Text, email, and password types with built-in password show/hide toggle and icon slots.
- **`Textarea`**: Auto-styled multiline input with live character count.
- **`Select`**: Accessible dropdown select menu with custom chevron indicator.
- **`Checkbox`**: Accessible custom checkbox with checked and indeterminate states.
- **`RadioGroup`**: Keyboard-navigable radio options with titles and descriptions.
- **`Switch`**: Accessible toggle switch for preferences and binary parameters.
- **`FileUpload`**: Drag-and-drop file upload zone with file size validation, format restrictions, and remove button.
- **`FormSection`**: Semantic `<fieldset>` container with `<legend>`, descriptive subtext, and corner badges.

### 5.3 Feedback Components
- **`Alert`**: Notification cards (`info`, `success`, `warning`, `destructive`) with role="alert".
- **`Dialog`**: Accessible modal dialog with backdrop blur, Escape listener, body scroll lock, and focus containment.
- **`ConfirmDialog`**: Action confirmation modal with danger and primary variations.
- **`ToastProvider` / `useToast`**: Contextual bottom-right non-blocking toast notifications with auto-dismiss.
- **`EmptyState`**: Empty queue/record placeholder with icon, description, and action CTA.
- **`ErrorState`**: Diagnostic failure card with retry action.
- **`LoadingState`**: Spinners with contextual progress messaging.

### 5.4 Data Presentation Components
- **`Table`**: Responsive table container with `TableHeader`, `TableBody`, `TableRow`, `TableHead`, and `TableCell`.
- **`Pagination`**: Page navigation with ellipsis calculation and record range indicator.
- **`SearchBar`**: Real-time search query box with clear button and filter action trigger.
- **`StatCard`**: Metric presentation card with title, large numerical value, and percentage trend arrows (`TrendingUp`, `TrendingDown`).
- **`RiskBadge`**: Standardized healthcare risk badge supporting English and Bengali text.
- **`Timeline`**: Chronological care event log with status-coded indicator nodes.
- **`DetailPanel`**: Two-column key-value clinical presentation grid.

---

## 6. Workspace Layout Architectures

Lungent provides five distinct workspace layouts:

1. **Public Portal (`src/components/layouts/public-layout.tsx` / `(public)`):**
   - Welcoming, transparent, educational navigation.
   - Top header with language switcher and direct entry to assessment.
   - Comprehensive footer with clinical disclaimers.

2. **Patient Workspace (`(patient)`):**
   - High readability, empathetic pacing, low cognitive load.
   - Sidebar navigation: Overview, My Assessments, Guidelines, Profile.
   - Progress trackers for assessment completion.

3. **Community Healthcare Worker Workspace (`(healthcare-worker)`):**
   - High-density field queues, mobile drawer navigation, quick search.
   - Triage acuity indicators for offline and regional outreach.

4. **Clinical Decision Support Workspace (`(clinical)`):**
   - High information density, red-flag alert banners, empirical model scores.
   - Multi-disciplinary review sign-off and referral pipelines.

5. **Administrator Workspace (`(admin)`):**
   - Platform health telemetry, national facility registries, audit logs, and access control.

---

## 7. Accessibility & WCAG 2.2 AA Standards

- **Color Contrast:** All text meets or exceeds 4.5:1 against surfaces (3:1 for large display titles and components).
- **Keyboard Trapping & Navigation:** All dialogs and menus handle `Escape`, `Tab`, and arrow navigation.
- **Focus Visibility:** Custom focus rings with `outline: 2px solid var(--ring)` and `2px` offset.
- **Screen Reader Semantics:** Explicit `role="alert"`, `role="progressbar"`, `aria-busy`, `aria-invalid`, and `aria-describedby` across all form elements.
- **Reduced Motion:** Automatic suppression of animations and transitions when `prefers-reduced-motion: reduce` is detected.

---

## 8. Interactive Component Preview Page

A live preview page is deployed at:
`http://localhost:3000/design-system`

This page provides an interactive showroom demonstrating every color swatch, typography sample in English and Bangla, button state, form control, modal trigger, and data presentation table.
