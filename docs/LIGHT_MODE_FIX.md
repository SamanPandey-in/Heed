# Heed — Light Mode Fix Guide

This guide lists every light mode issue found in the current codebase, with the exact fix for each one. Issues are ordered from most visible to most subtle. All file paths are relative to `client/src/`.

---

## Summary of Issues

| # | Severity | File | Problem |
|---|----------|------|---------|
| 1 | **Critical** | `index.css` | `glass-nav` hardcoded black — navbar background is near-black in light mode |
| 2 | **Critical** | `styles/muiTheme.js` | This file is unused — `ThemeProvider` calls `theme/theme.js` instead |
| 3 | **Critical** | `theme/theme.js` | `success`, `warning`, `info` palette colors map to grays — all colored Chips look wrong in light mode |
| 4 | **High** | `components/layout/ProjectsSidebar.jsx` | `bg-white/20` dot is invisible in light mode (white on white) |
| 5 | **High** | `pages/ProjectDetails.jsx` | Tab content wrappers use `dark:bg-zinc-900/40` with no light equivalent — content floats on white with no visual containment |
| 6 | **High** | `index.css` | `border-subtle`, `hero-gradient-text`, `dashboard-glow` all hardcoded for dark backgrounds |
| 7 | **Medium** | `index.css` | Status/priority badge classes scoped inside `@media (max-width: 640px)` — they do nothing on desktop |
| 8 | **Medium** | `pages/Profile.jsx` | `focus:ring-white/20` focus ring invisible in light mode |
| 9 | **Medium** | `theme/theme.js` | Missing `MuiTextField` and `MuiSelect` component overrides — inputs look unstyled in light mode |
| 10 | **Low** | `components/dashboard/ProjectOverview.jsx` | `statusColors.completed` is `bg-zinc-900 text-white` — black badge on white background in light mode |
| 11 | **Low** | Multiple files | `dark:bg-zinc-900/50`, `dark:bg-black` wrappers with no light equivalent leave sections backgroundless |

---

## Fix 1 — `glass-nav` (Critical)

**File:** `index.css`

**Problem:** The `.glass-nav` utility class used by `Navbar.jsx` has a hardcoded dark background. In light mode the navbar renders near-black.

```css
/* CURRENT — broken in light mode */
.glass-nav {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
```

**Fix:** Replace with a mode-aware version using CSS variables.

```css
/* FIXED */
.glass-nav {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.dark .glass-nav {
  background: rgba(0, 0, 0, 0.75);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
```

---

## Fix 2 — MUI Theme File Conflict (Critical)

**Files:** `styles/muiTheme.js`, `components/theme/ThemeProvider.jsx`

**Problem:** `ThemeProvider.jsx` imports `buildTheme` from `theme/theme.js`, not from `styles/muiTheme.js`. The `muiTheme.js` file with its detailed component overrides is completely unused. This means the full MUI component styling (TextField border colours, Select backgrounds, Button disabled states) is never applied.

**Fix:** Update `ThemeProvider.jsx` to use the more complete theme file, OR merge the two files.

**Option A — Point ThemeProvider to the right file:**

In `components/theme/ThemeProvider.jsx`, change:

```js
// CURRENT
import { buildTheme } from '../../theme/theme';
```

to:

```js
// FIXED — use the complete theme with all component overrides
import { getMuiTheme } from '../../styles/muiTheme';
```

Then in the same file, change `buildTheme(mode)` to `getMuiTheme(mode)`.

**Option B — Merge (recommended):** Copy all the `components` overrides from `muiTheme.js` into the `createTheme` call in `theme/theme.js`, then delete `muiTheme.js`. This keeps one source of truth.

---

## Fix 3 — MUI Semantic Palette Colors (Critical)

**File:** `theme/theme.js`

**Problem:** In `buildTheme`, the semantic colours all resolve to Zinc shades — which are light gray in light mode and dark gray in dark mode. This means `<Chip color="success" />` renders gray instead of green, `<Chip color="error" />` renders gray instead of red, and `<Typography color="error">` is nearly invisible on a white background.

```js
// CURRENT — all wrong in light mode
error:   { main: colors[400] },   // #a3a3a3 — light gray
warning: { main: colors[500] },   // #737373 — medium gray
success: { main: colors[600] },   // #525252 — dark gray
```

**Fix:** Use real semantic colours with light/dark aware values.

```js
// FIXED — in theme/theme.js inside buildTheme()
error: {
  main:         isDark ? '#f87171' : '#dc2626',
  light:        isDark ? '#fca5a5' : '#fecaca',
  dark:         isDark ? '#ef4444' : '#b91c1c',
  contrastText: '#ffffff',
},
warning: {
  main:         isDark ? '#fbbf24' : '#d97706',
  light:        isDark ? '#fcd34d' : '#fde68a',
  dark:         isDark ? '#f59e0b' : '#b45309',
  contrastText: isDark ? '#000000' : '#ffffff',
},
success: {
  main:         isDark ? '#34d399' : '#16a34a',
  light:        isDark ? '#6ee7b7' : '#bbf7d0',
  dark:         isDark ? '#10b981' : '#15803d',
  contrastText: '#ffffff',
},
info: {
  main:         isDark ? '#60a5fa' : '#2563eb',
  light:        isDark ? '#93c5fd' : '#bfdbfe',
  dark:         isDark ? '#3b82f6' : '#1d4ed8',
  contrastText: '#ffffff',
},
```

> **Why this matters:** Every `<Chip color="success">`, `<Chip color="error">`, `<Button color="error">`, and `<Typography color="error">` in the app relies on these palette values. ProjectTasks, ProjectDetails, Dashboard, and TeamDetails all use these colour props.

---

## Fix 4 — Invisible Dot in ProjectsSidebar (High)

**File:** `components/layout/ProjectsSidebar.jsx`

**Problem:** The collapse indicator uses `bg-white/20` which is a transparent white — invisible on a white sidebar background.

```jsx
{/* CURRENT — line ~48 */}
<div className="size-2 rounded-full bg-white/20" />
```

**Fix:**

```jsx
{/* FIXED */}
<div className="size-2 rounded-full bg-gray-400 dark:bg-white/20" />
```

---

## Fix 5 — Project Details Tab Content Has No Light Background (High)

**File:** `pages/ProjectDetails.jsx`

**Problem:** Every tab content wrapper uses `dark:bg-zinc-900/40` with no light-mode equivalent. In light mode the content area has no visual separation from the page background — everything merges into one flat white surface.

```jsx
{/* CURRENT — all 7 tab wrappers look like this */}
<div className="dark:bg-zinc-900/40 rounded max-w-6xl">
```

**Fix:** Add a subtle light-mode background to each wrapper.

```jsx
{/* FIXED */}
<div className="bg-gray-50/50 dark:bg-zinc-900/40 rounded max-w-6xl">
```

Apply this change to all 7 `dark:bg-zinc-900/40` divs in `ProjectDetails.jsx` (lines ~152, 157, 162, 167, 172, 177, 182).

---

## Fix 6 — Dark-Only Utility Classes in `index.css` (High)

**File:** `index.css`

Three component-layer classes are designed for dark backgrounds only.

### 6a — `border-subtle`
```css
/* CURRENT — white border, invisible in light */
.border-subtle {
  border-color: rgba(255, 255, 255, 0.1);
}
```
```css
/* FIXED */
.border-subtle {
  border-color: rgba(0, 0, 0, 0.08);
}
.dark .border-subtle {
  border-color: rgba(255, 255, 255, 0.1);
}
```

### 6b — `hero-gradient-text`
```css
/* CURRENT — white gradient, invisible on white */
.hero-gradient-text {
  background: linear-gradient(180deg, #FFFFFF 0%, #a1a1aa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```
```css
/* FIXED */
.hero-gradient-text {
  background: linear-gradient(180deg, #111111 0%, #525252 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.dark .hero-gradient-text {
  background: linear-gradient(180deg, #FFFFFF 0%, #a1a1aa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### 6c — `dashboard-glow`
```css
/* CURRENT — white glow, invisible in light */
.dashboard-glow {
  box-shadow: 0 0 100px -20px rgba(255, 255, 255, 0.1);
}
```
```css
/* FIXED */
.dashboard-glow {
  box-shadow: 0 0 100px -20px rgba(0, 0, 0, 0.08);
}
.dark .dashboard-glow {
  box-shadow: 0 0 100px -20px rgba(255, 255, 255, 0.1);
}
```

---

## Fix 7 — Status/Priority Badge Classes Scoped to Mobile Only (Medium)

**File:** `index.css`

**Problem:** All the `.status-*`, `.priority-*`, `.type-*` badge classes are defined inside `@media (max-width: 640px)`. On desktop they have no effect at all.

```css
/* CURRENT — only applies below 640px */
@media (max-width: 640px) {
  .status-active, .status-ACTIVE { ... }
  .priority-high, .priority-HIGH { ... }
  /* etc. */
}
```

**Fix:** Move all status/priority/type badge classes out of the media query. Place them after the `@layer components` block.

```css
/* FIXED — no media query wrapper */
.status-active, .status-ACTIVE {
  background-color: var(--color-surface-variant);
  color: var(--color-text);
  border-color: var(--color-border);
}

/* ... repeat for all other status/priority/type classes */
```

> **Note:** Since the app currently uses MUI `<Chip color="success|error|warning">` for status badges rather than these CSS classes, this fix mostly matters if you add the CSS classes to any custom elements in the future. It's still worth fixing to avoid confusion.

---

## Fix 8 — Invisible Focus Ring on Profile Textarea (Medium)

**File:** `pages/Profile.jsx`

**Problem:** The bio textarea uses `focus:ring-white/20` which is a translucent white ring — completely invisible against a white background.

```jsx
{/* CURRENT — line ~308 */}
className="... focus:ring-2 focus:ring-white/20 focus:border-transparent ..."
```

**Fix:**

```jsx
{/* FIXED */}
className="... focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 focus:border-gray-400 dark:focus:border-transparent ..."
```

---

## Fix 9 — Missing MUI Input/Select Overrides (Medium)

**File:** `theme/theme.js`

**Problem:** `buildTheme` (which `ThemeProvider` actually uses) has no `MuiTextField` or `MuiSelect` component overrides. In light mode, MUI's default input styles take over — inputs get their own font, border colour, and background that don't match the app's design system.

**Fix:** Add these overrides inside the `components` block in `theme/theme.js`:

```js
// Add inside components: { ... } in buildTheme()
MuiTextField: {
  defaultProps: {
    size: 'small',
    fullWidth: true,
  },
  styleOverrides: {
    root: {
      '& .MuiOutlinedInput-root': {
        backgroundColor: isDark ? colors[50] : colors[0],
        fontSize: '0.875rem',
        '& fieldset': {
          borderColor: colors[200],
        },
        '&:hover fieldset': {
          borderColor: isDark ? colors[600] : colors[700],
        },
        '&.Mui-focused fieldset': {
          borderColor: colors[1000],
          borderWidth: '1px',
        },
      },
      '& .MuiInputBase-input': {
        color: colors[1000],
      },
      '& .MuiInputLabel-root': {
        color: colors[500],
        '&.Mui-focused': {
          color: colors[1000],
        },
      },
    },
  },
},
MuiSelect: {
  defaultProps: { size: 'small' },
  styleOverrides: {
    root: {
      backgroundColor: isDark ? colors[50] : colors[0],
      color: colors[1000],
      fontSize: '0.875rem',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: colors[200],
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: isDark ? colors[600] : colors[700],
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: colors[1000],
        borderWidth: '1px',
      },
    },
    icon: {
      color: colors[500],
    },
  },
},
MuiMenuItem: {
  styleOverrides: {
    root: {
      fontSize: '0.875rem',
      color: colors[1000],
      '&:hover': {
        backgroundColor: isDark ? `rgba(255,255,255,0.06)` : `rgba(0,0,0,0.04)`,
      },
      '&.Mui-selected': {
        backgroundColor: isDark ? `rgba(255,255,255,0.10)` : `rgba(0,0,0,0.08)`,
        '&:hover': {
          backgroundColor: isDark ? `rgba(255,255,255,0.14)` : `rgba(0,0,0,0.10)`,
        },
      },
    },
  },
},
```

---

## Fix 10 — Black "Completed" Status Badge in Light Mode (Low)

**File:** `components/dashboard/ProjectOverview.jsx`

**Problem:** The `statusColors.completed` entry uses `bg-zinc-900 text-white` for light mode. In light mode this renders as a black badge — which is fine visually but breaks visual hierarchy since it looks identical to a primary action button.

```js
// CURRENT — line ~15
completed: "bg-zinc-900 text-white dark:bg-white dark:text-black",
```

**Fix:**

```js
// FIXED — uses a blue tint for completed status in light mode
completed: "bg-blue-100 text-blue-800 dark:bg-white dark:text-black",
```

---

## Fix 11 — Missing Light Background on Backgroundless Wrappers (Low)

**Files:** `components/dashboard/RecentActivity.jsx`, `components/dashboard/TasksSummary.jsx`, `pages/TaskDetails.jsx`

**Problem:** Several wrappers pair a `dark:bg-black` or `dark:bg-zinc-900` class with nothing for light mode (they rely on the global white page background). This is fine for most cases, but on components that use `border border-zinc-200 dark:border-white/10`, the lack of an explicit background can show through scrollable areas.

These are already fine for most users — but if you want perfect consistency, add `bg-white` to the components that only have `dark:bg-black`:

```jsx
{/* CURRENT */}
<div className="bg-white dark:bg-black border border-zinc-200 dark:border-white/10 ...">

{/* already correct — bg-white is the light mode value */}
```

These are actually already correct. The only case to fix is `pages/TaskDetails.jsx` comment container:

```jsx
{/* CURRENT — line ~320 — missing explicit bg in some sub-wrappers */}
<div className="p-5 rounded-md  border border-gray-300 dark:border-zinc-800  flex flex-col lg:h-[80vh]">
```

```jsx
{/* FIXED */}
<div className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 flex flex-col lg:h-[80vh]">
```

---

## Implementation Order

Do these in sequence — each fix depends on the previous ones being stable.

```
1. Fix glass-nav (index.css)             — immediate visible improvement
2. Fix MUI semantic palette (theme.js)   — fixes all colored Chips/Buttons
3. Fix MUI file conflict (ThemeProvider) — ensures fixes in theme.js actually apply
4. Fix MUI input overrides (theme.js)    — consistent form fields
5. Fix ProjectDetails tab wrappers       — visual depth in project view
6. Fix border-subtle + hero-gradient     — landing and misc surfaces
7. Fix ProjectsSidebar dot               — minor visual glitch
8. Fix Profile focus ring                — accessibility
9. Fix status badge media query          — correctness
10. Fix ProjectOverview completed badge  — polish
```

---

## Verification Checklist

After applying all fixes, check these screens in light mode:

- [ ] Navbar background is white/translucent, text is readable
- [ ] Sidebar has white background, active item highlighted in gray
- [ ] Dashboard KPI cards have distinct icon colours (blue, green, purple, red)
- [ ] `<Chip color="success">` is green, `color="error"` is red, `color="warning"` is amber
- [ ] Project status chips (ACTIVE, COMPLETED, DEPRECATED) have correct colours
- [ ] ProjectDetails tabs show a subtle gray background on the content area
- [ ] All TextFields and Selects have a light border that darkens on focus
- [ ] Profile textarea shows a visible focus ring when clicked
- [ ] ProjectsSidebar expand dot is visible (gray, not transparent)
- [ ] All text passes contrast — no gray-on-white illegibility

---

## What Is Already Working in Light Mode

These do **not** need changes — they are correctly implemented:

- All `dark:X` / plain `X` Tailwind class pairs (`bg-white dark:bg-zinc-950` etc.) — correct
- `not-dark:bg-white` pattern in `ProjectCalendar`, `ProjectAnalytics`, `ProjectSettings`, `ProjectNotes` — correct (Tailwind v4 custom variant defined in `index.css`)
- `tokens.cardBgClass` — already has `bg-white` for light mode
- `tokens.cardStatusColors` and `tokens.cardResultColors` — already have light/dark pairs
- Auth pages (`Login.jsx`, `Signup.jsx`) — intentionally dark-only (landing/auth screens)
- Sidebar, Navbar, NotificationBell, SearchPanel structural colours — already have both light and dark values