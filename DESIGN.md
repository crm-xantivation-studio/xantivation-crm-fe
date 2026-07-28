# Design System Specifications: Claude Azure Theme (Shadcn UI Dual-Theme)

## 1. Color Palette System (OKLCH Dual-Theme Space)

```css
:root {
  /* ===== Claude Azure Light Mode Tokens ===== */
  /* Primary Brand Accent (Azure Blue) */
  --color-accent: oklch(0.60 0.12 245);        /* #4288c9 Azure Blue Primary */
  --color-accent-hover: oklch(0.53 0.14 245);  /* #3570ab Deeper Azure */

  /* Surface Elevation (Light Mode — High-Contrast Clean Slate) */
  --color-bg: oklch(0.975 0.003 250);           /* #f8fafc Clean base background */
  --color-bg-tint: oklch(1.000 0.000 0);         /* #ffffff Pure white cards & bento */
  --color-surface: oklch(0.950 0.004 250);      /* #f1f5f9 Hover surfaces & dropdowns */
  --color-border: oklch(0.890 0.005 250);        /* #e2e8f0 Sharp 1px hairline border */

  /* High-Legibility Typography Tokens */
  --color-fg: oklch(0.180 0.005 250);            /* #0f172a Sharp dark slate body copy */
  --color-muted-fg: oklch(0.480 0.008 250);      /* #475569 Sharp secondary text (Slate-600) */

  /* Sidebar Tokens (Light Mode — Crisp White Panel) */
  --color-sidebar-bg: oklch(1.000 0.000 0);      /* #ffffff Pure white panel */
  --color-sidebar-border: oklch(0.890 0.005 250);/* #e2e8f0 Crisp sidebar border */

  /* Status Indicators */
  --color-success: oklch(0.62 0.18 160);         /* Emerald Green */
  --color-warning: oklch(0.72 0.18 85);          /* Amber Gold */
  --color-danger: oklch(0.58 0.22 25);           /* Crimson Red */
  --color-info: oklch(0.60 0.12 245);            /* Azure Blue (= accent) */

  /* Geometry & Layout Tokens */
  --radius-card: 0.5rem;                        /* 8px Default Card Radius */
  --radius-button: 0.375rem;                    /* 6px Control & Nav Radius */
  --radius-badge: 9999px;                       /* Full Pill Badge */
  --border-width-hairline: 1px;                 /* Precision Hairline */

  /* Fonts */
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;
}

[data-theme="dark"] {
  /* ===== Claude Azure Dark Mode Tokens ===== */
  --color-bg: oklch(0.110 0.005 250);            /* #09090b Deep Charcoal Dark Bg */
  --color-bg-tint: oklch(0.140 0.005 250);       /* #18181b Dark Slate Card */
  --color-surface: oklch(0.180 0.005 250);       /* #27272a Elevated popups & dropdowns */
  --color-border: oklch(0.260 0.008 250 / 0.7);  /* #27272a Hairline dark border */

  --color-fg: oklch(0.960 0.003 250);            /* #fafafa Pure White text */
  --color-muted-fg: oklch(0.680 0.005 250);      /* #94a3b8 High-contrast slate text */

  /* Sidebar Tokens (Dark Mode) */
  --color-sidebar-bg: oklch(0.135 0.005 250);    /* #161618 Dark Sidebar Panel */
  --color-sidebar-border: oklch(0.220 0.006 250);/* #222225 Dark Sidebar Border */
}
```

---

## 2. Geometry & Layout Specifications

| Property | Value | Tailwind Equivalent | Description |
|---|---|---|---|
| **Card Radius** | `8px` | `rounded-lg` | Applied to all main content cards, tables, bento boxes |
| **Nav Item Radius** | `6px` | `rounded-md` | Applied to sidebar items, tabs, small action buttons |
| **Pill Radius** | `9999px` | `rounded-full` | Status tags, user avatars, pill badges |
| **Border Thickness** | `1px` | `border` | Precision thin hairline borders throughout system |
| **Hairline Dividers** | `1px` gradient | `h-[1px] bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent` | Gradient fading separator for sidebar & modals |

---

## 3. Navigation & Active State Specifications

### Active Item Styling (`.az-sidebar-active`)
- **Background**: Soft Azure Tint (`oklch(0.60 0.12 245 / 0.12)` — ~12% opacity).
- **Border**: Accent border outline (`1px solid oklch(0.60 0.12 245 / 0.22)`).
- **Text Color**: High-contrast Azure Blue (`var(--color-accent)` / `#4288c9`).
- **Icon Stroke**: Enforced Azure Blue (`!text-[var(--color-accent)]` / `stroke="var(--color-accent)"`).
- **Active Indicator**: Small 6px Azure Blue dot on right side (`bg-[var(--color-accent)]`).

### Sidebar Layout & Alignment
- **Expanded Width**: `256px` (`w-64`).
- **Collapsed Width**: `80px` (`w-20`).
- **Collapsed Alignment**: Perfect center axis alignment (`justify-center px-0`) for Logo, Navigation Icons, User Avatar, and Collapse Button.
- **Footer Section**: Single 40px compact row combining User Profile (Avatar + Email + Role) and Collapse Toggle Button.

---

## 4. Component Token Specifications

### Table UI (Claude Azure Table)
- **Container**: `.az-card w-full overflow-hidden` (`bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-lg shadow-xs`).
- **Divider**: Hairline horizontal dividers `1px` (`border-b border-[var(--color-border)]`).
- **Status Pills**: Outline badges (`bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] uppercase px-2.5 py-0.5 rounded-full`).
- **Row Hover**: `hover:bg-[var(--color-surface)]/50 transition-colors duration-150`.

### Modal Popup Form UI (Clean Azure Modal)
- **Modal Box**: `bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-lg p-6 relative shadow-xl`.
- **Form Controls**: `FloatingInput` with solid Azure Blue focus underline (`bg-[var(--color-accent)]`), custom styled selects (`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg py-2 px-3 focus:border-[var(--color-accent)] text-xs text-[var(--color-fg)]`).

### Buttons (Claude Azure Flat Buttons)
- **Primary Action**: `bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg font-semibold px-4 py-2 transition-all duration-200 cursor-pointer shadow-xs`.
- **Secondary Action**: `border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] rounded-lg font-semibold px-4 py-2 transition-all duration-200 cursor-pointer`.

---

## 5. Micro-Interactions & Motion Budget
- **Subtle Radial Spotlight**: Clean Azure radial light upon container hover (`rgba(66, 136, 201, 0.08)`).
- **Button Press Feedback**: Scale `0.99` on click with spring feedback (`whileTap={{ scale: 0.99 }}`).
- **Hover Motion**: Entrance & hover duration `150-200ms` with custom ease-out `[0.25, 0.1, 0.25, 1]`.
- **Skeleton Wave**: Soft shimmer pulse duration `2.5s` infinite.
