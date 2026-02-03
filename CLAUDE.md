# CLAUDE.md - Adfidence Component Library

## Project Overview

This is the **Adfidence Component Library** — a pure CSS + vanilla JavaScript component system with 22 reusable UI components organized across 4 categories. No build tools or frameworks. Components are demonstrated in `index.html` and styled via modular CSS files backed by a design token system.

## Architecture

```
css/
  tokens.css              # All design tokens (colors, spacing, typography, etc.)
  components/
    _index.css            # Master import — all component CSS loaded here
    core/                 # Buttons, Inputs, Checkboxes, Toggles, Badges, Avatars
    navigation/           # Sidebar, Tabs, Breadcrumbs, Pagination, Stepper
    data-display/         # Cards, Tables, Lists, Stats, Progress, Status
    feedback/             # Alerts, Toasts, Modals, Tooltips, Loaders
  library.css             # Library showcase UI styles (sidebar, layout, nav)
js/
  library.js              # All interactive behavior (vanilla JS, ~827 lines)
index.html                # Interactive component showcase
```

## Design Principles — Follow These When Creating or Updating Components

### 1. Always Use Design Tokens

Never use hardcoded values. Every color, spacing, font size, radius, shadow, transition, and z-index must reference a `var(--token)` from `css/tokens.css`.

- **Colors:** `var(--color-primary-500)`, `var(--color-neutral-200)`, `var(--color-success-500)`, etc.
- **Spacing:** `var(--space-1)` through `var(--space-24)` (4px increments)
- **Typography:** `var(--text-sm)`, `var(--font-medium)`, `var(--leading-normal)`, `var(--font-family-sans)`
- **Borders:** `var(--border-width-thin)`, `var(--radius-sm)`, `var(--radius-full)`
- **Shadows:** `var(--shadow-sm)` through `var(--shadow-2xl)`, plus `var(--shadow-primary)` etc.
- **Transitions:** `var(--duration-fast)`, `var(--ease-default)`
- **Z-index:** `var(--z-dropdown)` through `var(--z-toast)`

### 2. BEM Naming Convention

All CSS classes follow Block Element Modifier:

```
.component-name                  /* Block */
.component-name__element         /* Element */
.component-name--modifier        /* Modifier (variant/state) */
```

Examples: `.btn--primary`, `.card__header`, `.alert__close`, `.list-item__description`

### 3. Compose With Existing Components — Do Not Reinvent

**This is critical.** When building or updating a component, use the existing library components inside it rather than creating new one-off elements. The library already provides:

| Need | Use This | Not This |
|------|----------|----------|
| Action buttons | `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--ghost`, `.btn--danger`, `.btn--icon` | Custom button styles |
| Form fields | `.input`, `.input-wrapper`, `.input-label`, `.input-group` | Custom input styles |
| Checkboxes | `.checkbox`, `.checkbox-wrapper` | Custom checkbox styles |
| Toggles | `.toggle`, `.toggle-wrapper` | Custom switch styles |
| Labels/status | `.badge`, `.badge--success`, `.badge--error`, `.tag` | Custom pill/label styles |
| User icons | `.avatar`, `.avatar-group`, `.avatar--sm` | Custom circular image styles |
| Close buttons | `.btn--ghost.btn--icon` with Lucide `x` icon | Custom close buttons |
| Loading states | `.spinner`, `.spinner--sm`, `.skeleton`, `.loader-dots` | Custom spinners |
| Status indicators | `.status`, `.status--success`, `.status__dot` | Custom colored dots |
| Progress | `.progress`, `.progress__bar` | Custom progress bars |
| Notifications | `.alert`, `.toast` | Custom notification styles |
| Overlays | `.modal-backdrop`, `.modal`, `.modal__header`, `.modal__body`, `.modal__footer` | Custom overlay/dialog styles |
| Tooltips | `.tooltip-wrapper`, `.tooltip` | Custom hover text |
| Navigation | `.tabs`, `.tab`, `.breadcrumbs`, `.pagination` | Custom nav styles |
| Content containers | `.card`, `.card__header`, `.card__body`, `.card__footer` | Custom box styles |
| Lists | `.list`, `.list-item`, `.list-item__icon`, `.list-item__content` | Custom list styles |

**Example — a modal must compose existing components:**

```html
<div class="modal-backdrop modal-backdrop--visible">
  <div class="modal modal--visible">
    <div class="modal__header">
      <h3>Title</h3>
      <button class="btn btn--ghost btn--icon">       <!-- Use library button -->
        <i data-lucide="x"></i>                        <!-- Use Lucide icon -->
      </button>
    </div>
    <div class="modal__body">
      <div class="input-wrapper">                      <!-- Use library input -->
        <label class="input-label">Name</label>
        <input class="input" type="text" />
      </div>
    </div>
    <div class="modal__footer">
      <button class="btn btn--secondary">Cancel</button>  <!-- Use library buttons -->
      <button class="btn btn--primary">Save</button>
    </div>
  </div>
</div>
```

### 4. Icons — Use Lucide Only

All icons use **Lucide Icons** loaded from CDN (`https://unpkg.com/lucide@latest`).

```html
<i data-lucide="icon-name"></i>
```

After any DOM update that adds icons, call `lucide.createIcons()` to render them.

Commonly used icons in this library: `x`, `check`, `check-circle`, `x-circle`, `alert-triangle`, `alert-circle`, `info`, `search`, `copy`, `code`, `chevron-right`, `layers`, `user`, `bell`, `loader`, `palette`, `table`, `bar-chart-3`.

### 5. Consistent Interaction States

Every interactive element must implement these states using tokens:

- **Hover:** Subtle background/color shift
- **Active/Pressed:** Darker shade or scale
- **Focus-visible:** `outline: 2px solid var(--color-primary-500); outline-offset: 2px;`
- **Disabled:** `opacity: 0.5; cursor: not-allowed; pointer-events: none;`
- **Transitions:** `transition: all var(--duration-fast) var(--ease-default);`

### 6. Semantic Color Usage

Colors communicate meaning consistently:

- **Primary (blue):** Default actions, links, active states
- **Success (green):** Positive outcomes, confirmations
- **Warning (orange):** Caution, attention needed
- **Error (red):** Destructive actions, failures, errors
- **Info (violet/blue):** Informational, neutral highlights
- **Neutral (gray):** Secondary content, borders, backgrounds

Each semantic color has a full scale: `--color-{semantic}-50` (lightest) through `--color-{semantic}-700` (darkest).

### 7. Glass Morphism Pattern

Cards, sidebar, and elevated containers use the glass morphism pattern:

```css
background: var(--glass-bg);
backdrop-filter: blur(var(--glass-blur));
border: var(--border-width-thin) solid var(--glass-border);
```

### 8. Responsive Breakpoints

- Desktop-first approach
- Breakpoints at `1024px` and `768px`
- Use media queries only when needed

### 9. Size Variants

Components that offer size variants follow this pattern:

- `.component--sm` — compact/small
- Default — medium (no modifier)
- `.component--lg` — large
- `.component--xl` — extra large (where applicable)

## Adding a New Component

1. **Create the CSS file** in the correct category folder under `css/components/`.
2. **Register it** by adding an `@import` line in `css/components/_index.css` under the appropriate section.
3. **Use design tokens exclusively** — no hardcoded colors, spacing, or font sizes.
4. **Follow BEM naming** — `.new-component`, `.new-component__child`, `.new-component--variant`.
5. **Compose existing components** — buttons use `.btn`, inputs use `.input`, close buttons use `.btn--ghost.btn--icon` with Lucide `x`, etc.
6. **Include standard states** — hover, focus-visible, disabled, active.
7. **Add a demo section** in `index.html` following the existing section pattern.
8. **Add JS behavior** (if needed) in `js/library.js` as a new `initializeXxx()` function registered in the DOMContentLoaded init array.
9. **Use Lucide icons** — never inline SVGs or other icon libraries.

## Existing Component Quick Reference

### Core
- **Buttons:** `.btn` + `--primary`, `--secondary`, `--outline`, `--ghost`, `--danger`, `--success`, `--icon`, `--sm`, `--lg`, `--xl`, `--loading`
- **Inputs:** `.input` + `.input-wrapper`, `.input-label`, `.input-group`, `.input-icon`, `.input-hint`, `.input-error`, `--sm`, `--lg`, `--error`, `--success`
- **Checkboxes:** `.checkbox` + `.checkbox-wrapper`, `.checkbox-label` (supports `:checked`, `:indeterminate`, `:disabled`)
- **Toggles:** `.toggle` + `.toggle-wrapper`, `.toggle-label`, `--sm`
- **Badges:** `.badge` + `--primary`, `--success`, `--warning`, `--error`, `--info`, `--outline`, `.badge__dot`
- **Tags:** `.tag` + `.tag__remove`
- **Avatars:** `.avatar` + `--xs`, `--sm`, `--lg`, `--xl`, `--square`, `.avatar-group`, `.avatar-status` (`--online`, `--offline`, `--busy`, `--away`)

### Navigation
- **Sidebar:** `.sidebar` + `__header`, `__nav`, `__section`, `__section-title`, `__item`, `__item-icon`, `__item-badge`, `__footer`, `--collapsed`
- **Tabs:** `.tabs` + `.tab`, `.tab--active`, `.tabs--pills`
- **Breadcrumbs:** `.breadcrumbs` + `.breadcrumb`, `.breadcrumb--current`, `.breadcrumb-separator`
- **Pagination:** `.pagination` + `.pagination__btn`, `__btn--active`, `__ellipsis`
- **Stepper:** `.stepper` + `.step`, `.step__indicator`, `.step__content`, `.step__title`, `.step__description`, `--completed`, `--active`

### Data Display
- **Cards:** `.card` + `__header`, `__title`, `__subtitle`, `__body`, `__footer`, `--highlight`, `--interactive`
- **Tables:** `.table-container` + `.table`, `--striped`, `--compact`, `.table-with-tabs`, `.table-tab`
- **Lists:** `.list` + `.list-item`, `__icon`, `__content`, `__title`, `__description`, `__action`, `--interactive`
- **Stats:** `.stat` + `__label`, `__value`, `__change` (`--positive`, `--negative`), `.stat-card`, `.stat-card__icon`
- **Progress:** `.progress` + `.progress__bar` (`--success`, `--warning`, `--error`), `.progress-wrapper`, `--sm`, `--lg`
- **Status:** `.status` + `.status__dot`, `--success`, `--warning`, `--error`, `--info`, `--neutral`, `--pulse`

### Feedback
- **Alerts:** `.alert` + `__icon`, `__content`, `__title`, `__description`, `__close`, `--info`, `--success`, `--warning`, `--error`
- **Toasts:** `.toast-container` + `.toast`, `__icon`, `__content`, `__close`, `--success`, `--error`, `--warning`
- **Modals:** `.modal-backdrop` + `.modal`, `__header`, `__body`, `__footer`, `--sm`, `--lg`, `--xl`, `--visible`
- **Tooltips:** `.tooltip-wrapper` + `.tooltip`, `--top`, `--bottom`
- **Loaders:** `.spinner` (`--sm`, `--lg`, `--xl`), `.loader-dots` + `__dot`, `.skeleton` (`--text`, `--avatar`, `--button`)

## JavaScript Conventions

- Vanilla JS only, no frameworks or build tools
- New behaviors go in `js/library.js` as `function initializeXxx()` added to the init array
- Wrap each initializer in try-catch
- Use event delegation where possible
- Call `lucide.createIcons()` after any DOM update that adds `<i data-lucide="...">` elements
- Use `data-` attributes for configuration, not inline styles or class parsing

## Do Not

- Use hardcoded color hex values, pixel spacing, or font sizes — always use tokens
- Create custom button, input, badge, avatar, or loader styles when the existing component already covers the need
- Use icon libraries other than Lucide
- Add npm dependencies or build tooling
- Use CSS-in-JS, Sass, or preprocessors — this is plain CSS with custom properties
- Break BEM naming conventions
- Skip focus-visible or disabled states on interactive elements
