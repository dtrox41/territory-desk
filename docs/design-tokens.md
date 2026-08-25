# Exact Design Tokens

Status: Approved for Step 4.3

Decision scope: Convert the approved product-first brand direction and responsive layout rules into exact, reusable values. These tokens will become CSS custom properties when the React application is scaffolded. They are intentionally provisional Territory Desk colors, not official Cintas brand colors.

## Recommendation

Use a restrained field-work system built around deep blue actions, white work surfaces, a cool-gray canvas, high-contrast text, and explicit semantic status sets. Favor borders and spacing over decorative shadows. Use the operating-system font stack so the public prototype loads quickly and remains readable during inconsistent connectivity.

The system must satisfy five rules:

1. Every ordinary text pairing meets at least WCAG AA contrast: 4.5:1 for normal text and 3:1 for qualifying large text.
2. Meaningful control boundaries, focus indicators, icons, and graphical state cues meet at least 3:1 against adjacent colors.
3. Every interactive target is at least 44 × 44 CSS pixels, even though WCAG 2.2 Level AA permits smaller targets in some cases.
4. Status never depends on color alone; visible text and an icon or other non-color cue state the meaning.
5. Reduced-motion, forced-color, zoom, large-text, outdoor-light, and weak-connection behavior are part of the token contract.

## Token architecture

Use three layers rather than placing raw values inside components:

1. **Primitive tokens** store raw colors and measurements.
2. **Semantic tokens** state purpose, such as `color-action-primary` or `color-text-muted`.
3. **Component tokens** may alias semantic tokens only when a component has a proven reusable need, such as `button-height-default`.

Components may not import or repeat raw hex colors, arbitrary spacing, unexplained shadows, or one-off animation durations. A raw value found during implementation must either map to an existing token or be reviewed before a new token is added.

## Color primitives

### Territory blue

| Token | Value | Intended use |
| --- | --- | --- |
| `blue-950` | `#071A33` | Deepest decorative/illustrative blue only |
| `blue-900` | `#082B55` | Pressed primary action; strongest blue text |
| `blue-800` | `#0A3B73` | Primary hover; selected-state text |
| `blue-700` | `#0B4B91` | Primary action, link, active navigation |
| `blue-600` | `#0D5EAF` | Supporting data visualization after contrast check |
| `blue-500` | `#1976D2` | Focus ring and limited emphasis |
| `blue-200` | `#B8D8F5` | Supporting blue boundary or illustration |
| `blue-100` | `#DDEEFF` | Selected and informational surface |
| `blue-050` | `#F2F7FD` | Hover/subtle blue surface |

`blue-700` is the proposed product primary. It is provisional Territory Desk blue and must not be described as an official corporate color.

### Neutral palette

| Token | Value | Intended use |
| --- | --- | --- |
| `neutral-950` | `#172033` | Strong headings and highest-emphasis text |
| `neutral-900` | `#243247` | Default body text |
| `neutral-800` | `#3B4A5F` | Strong secondary text |
| `neutral-700` | `#4A5A6D` | Muted text |
| `neutral-600` | `#5F6F82` | Subtle text; never below the tested surfaces |
| `neutral-control` | `#718096` | Form-control boundary and strong separator |
| `neutral-400` | `#A8B5C5` | Default nonessential border |
| `neutral-300` | `#C6D0DC` | Subtle card border/divider |
| `neutral-200` | `#E2E8F0` | Disabled and quiet surface |
| `neutral-100` | `#EDF2F7` | Subdued surface |
| `neutral-050` | `#F5F7FA` | Application canvas |
| `white` | `#FFFFFF` | Primary work surface and inverse text |

### Semantic status sets

Each status set supplies foreground, background, and boundary values. The foreground contains text and icons; the boundary cannot be the only indicator.

| Meaning | Foreground | Background | Boundary | Product use |
| --- | --- | --- | --- | --- |
| Success | `#166534` | `#DCFCE7` | `#2E7D32` | Accepted, completed, healthy |
| Warning | `#854D0E` | `#FEF3C7` | `#A16207` | Action due, caution, waiting near target |
| Danger | `#9F1C14` | `#FEE4E2` | `#B42318` | Failed, overdue, destructive confirmation |
| Information | `#075985` | `#E0F2FE` | `#0369A1` | Informational update or source context |
| Neutral | `#475569` | `#F1F5F9` | `#64748B` | Waiting, inactive, or ordinary status |

Usage rules:

1. `Action Required` uses the warning set plus visible `Action Required` text and an appropriate icon.
2. `Needs Attention`, failed delivery, and destructive actions use danger plus explicit text.
3. Accepted and completed states use success plus explicit text.
4. Waiting states use neutral unless a response target is close enough to require warning.
5. Unread notification count uses `#B42318` with white text. Lead-action count uses the warning set so the two counts remain visually and semantically distinct.
6. Data visualizations must not automatically reuse status colors; chart colors receive a separate tested palette only if Step 4.4 or implementation proves they are needed.

## Semantic color aliases

| Semantic token | Primitive/value |
| --- | --- |
| `color-canvas` | `neutral-050` |
| `color-surface` | `white` |
| `color-surface-subdued` | `neutral-100` |
| `color-surface-selected` | `blue-100` |
| `color-text-strong` | `neutral-950` |
| `color-text` | `neutral-900` |
| `color-text-muted` | `neutral-700` |
| `color-text-subtle` | `neutral-600` |
| `color-text-inverse` | `white` |
| `color-border-subtle` | `neutral-300` |
| `color-border-default` | `neutral-400` |
| `color-border-control` | `neutral-control` |
| `color-divider` | `neutral-300` |
| `color-action-primary` | `blue-700` |
| `color-action-primary-hover` | `blue-800` |
| `color-action-primary-pressed` | `blue-900` |
| `color-action-secondary-hover` | `blue-050` |
| `color-action-secondary-pressed` | `blue-100` |
| `color-link` | `blue-700` |
| `color-link-hover` | `blue-800` |
| `color-focus` | `blue-500` |
| `color-disabled-surface` | `neutral-200` |
| `color-disabled-text` | `#64748B` |
| `color-scrim` | `rgba(7, 26, 51, 0.56)` |

Disabled controls are exempt from ordinary contrast requirements, but they must remain legible and must use disabled semantics—not opacity alone. Read-only controls use normal text contrast and a visible `Read only` cue.

## Verified contrast matrix

Ratios are calculated from the exact sRGB values above and rounded to two decimals. Implementation must calculate from source values and treat an unrounded value below the threshold as failure.

| Foreground / boundary | Background | Ratio | Required use result |
| --- | --- | ---: | --- |
| White | Primary `#0B4B91` | 8.64:1 | Pass normal text |
| White | Primary hover `#0A3B73` | 11.13:1 | Pass normal text |
| White | Primary pressed `#082B55` | 14.12:1 | Pass normal text |
| Primary `#0B4B91` | White | 8.64:1 | Pass link/action text |
| Primary `#0B4B91` | Canvas `#F5F7FA` | 8.05:1 | Pass link/action text |
| Strong text `#172033` | White | 16.27:1 | Pass normal text |
| Default text `#243247` | White | 12.95:1 | Pass normal text |
| Muted text `#4A5A6D` | White | 7.06:1 | Pass normal text |
| Subtle text `#5F6F82` | White | 5.14:1 | Pass normal text |
| Control boundary `#718096` | White | 4.02:1 | Pass non-text control boundary |
| Control boundary `#718096` | Canvas `#F5F7FA` | 3.74:1 | Pass non-text control boundary |
| Selected text `#0A3B73` | Selected surface `#DDEEFF` | 9.41:1 | Pass normal text |
| Success foreground | Success background | 6.49:1 | Pass normal text |
| Success boundary | Success background | 4.67:1 | Pass non-text cue |
| Warning foreground | Warning background | 6.15:1 | Pass normal text |
| Warning boundary | Warning background | 4.42:1 | Pass non-text cue |
| Danger foreground | Danger background | 6.57:1 | Pass normal text |
| Danger boundary | Danger background | 5.45:1 | Pass non-text cue |
| White | Unread badge `#B42318` | 6.57:1 | Pass normal text |
| Information foreground | Information background | 6.59:1 | Pass normal text |
| Information boundary | Information background | 5.17:1 | Pass non-text cue |
| Neutral foreground | Neutral background | 6.92:1 | Pass normal text |
| Neutral boundary | Neutral background | 4.34:1 | Pass non-text cue |
| Focus `#1976D2` | White | 4.60:1 | Pass non-text focus cue |
| Focus `#1976D2` | Canvas `#F5F7FA` | 4.29:1 | Pass non-text focus cue |

The focus color alone does not contrast sufficiently with every blue control. Filled blue controls therefore use a two-part focus treatment: a 2-pixel white inner separation plus a 3-pixel `color-focus` outer ring. In forced-color mode, use the system `Highlight` color and do not suppress the user agent's focus treatment.

## Typography

### Font families

| Token | Value |
| --- | --- |
| `font-family-sans` | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |
| `font-family-mono` | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` |

No external web font is required for the prototype. This removes a network dependency, avoids a layout shift, and uses familiar smartphone and company-laptop typography. Monospace is limited to safe technical identifiers when needed; it is not used for ordinary sales workflow content.

### Type scale

| Token | Size / line height | Default use |
| --- | --- | --- |
| `text-xs` | 12 px / 16 px | Badge or short supporting label only |
| `text-sm` | 14 px / 20 px | Secondary metadata, navigation label |
| `text-md` | 16 px / 24 px | Default body, field, and button text |
| `text-lg` | 18 px / 26 px | Card title or emphasized body |
| `text-xl` | 20 px / 28 px | Section title |
| `text-2xl` | 24 px / 32 px | Screen title |
| `text-3xl` | 28 px / 36 px | Compact greeting / large laptop title |
| `text-4xl` | 32 px / 40 px | Reserved display size; never a mobile default |

Rules:

1. Ordinary workflow body and form text defaults to 16 pixels.
2. No user-facing text is smaller than 12 pixels.
3. Do not rely on text classified as “large” to rescue an otherwise weak color pairing.
4. Screen headings may use `clamp(24px, 20px + 1vw, 32px)` only when wrapping and 200% zoom remain safe.
5. Text containers grow vertically; fixed heights must not clip enlarged text.

### Weights and tracking

| Token | Value | Use |
| --- | ---: | --- |
| `font-regular` | 400 | Body |
| `font-medium` | 500 | Metadata emphasis and controls |
| `font-semibold` | 600 | Section, card, and button labels |
| `font-bold` | 700 | Screen headings and exceptional emphasis |
| `tracking-normal` | `0` | All ordinary content |
| `tracking-label` | `0.01em` | Short compact labels only |

Avoid all-caps headings. Sentence case is the default. Weight cannot be the only distinction between interactive and noninteractive text.

## Spacing scale

The base unit is 4 CSS pixels.

| Token | Value | Typical use |
| --- | ---: | --- |
| `space-0` | 0 | Reset |
| `space-1` | 4 px | Icon/text optical adjustment |
| `space-2` | 8 px | Tight inline gap |
| `space-3` | 12 px | Compact internal gap |
| `space-4` | 16 px | Compact padding / mobile gutter |
| `space-5` | 20 px | Standard mobile gutter |
| `space-6` | 24 px | Standard card/desktop gap |
| `space-7` | 28 px | Exceptional internal spacing |
| `space-8` | 32 px | Laptop gutter/major separation |
| `space-10` | 40 px | Large section separation |
| `space-12` | 48 px | Major separation/control size reference |
| `space-16` | 64 px | Shell reference |
| `space-20` | 80 px | Rare large page spacing |

Use `gap` and logical padding/margin properties. Do not use blank text, repeated line breaks, or absolute positioning to create layout spacing.

## Responsive and width tokens

| Token | Value |
| --- | ---: |
| `breakpoint-compact` | 400 px |
| `breakpoint-wide-mobile` | 768 px |
| `breakpoint-laptop` | 1024 px |
| `breakpoint-wide-laptop` | 1280 px |
| `width-canvas-max` | 1440 px |
| `width-form-max` | 720 px |
| `width-dialog-max` | 560 px |
| `width-drawer` | 320 px, capped by available width |
| `width-reading` | 70ch |
| `rail-laptop` | 224 px |
| `rail-wide-laptop` | 256 px |

Breakpoints remain content thresholds, not device detection. CSS pixels are used. The application must collapse to the mobile shell when zoom or available content space makes the laptop rail unsafe.

## Control and target sizes

| Token | Value | Use |
| --- | ---: | --- |
| `target-min` | 44 px | Minimum width and height of any interactive target |
| `control-sm` | 44 px | Compact approved control |
| `control-md` | 48 px | Default button and input minimum height |
| `control-lg` | 52 px | Prominent field action |
| `row-compact-min` | 72 px | Compact actionable lead/rep row |
| `icon-sm` | 16 px | Inline decorative/supporting icon |
| `icon-md` | 20 px | Default control icon |
| `icon-lg` | 24 px | Navigation or section icon |
| `icon-xl` | 32 px | Empty/system-state illustration component |
| `icon-container` | 40 px | Standard noninteractive icon background |
| `topbar-mobile-min` | 64 px plus safe area | Mobile shell |
| `topbar-detail-min` | 56 px plus safe area | Mobile nested route |
| `bottom-nav-min` | 68 px plus safe area | Mobile global navigation |

Icon artwork may be smaller than 44 pixels, but its interactive button must still meet `target-min`. Target spacing never substitutes for a target that can reasonably be made 44 pixels.

## Borders and radii

| Token | Value | Use |
| --- | ---: | --- |
| `border-0` | 0 | Explicit no-border state |
| `border-1` | 1 px | Card, divider, default input |
| `border-2` | 2 px | Error/selected emphasis when needed |
| `border-3` | 3 px | Outer focus-ring thickness |
| `radius-xs` | 4 px | Tiny indicator |
| `radius-sm` | 6 px | Compact badge |
| `radius-md` | 10 px | Input/filter control |
| `radius-lg` | 12 px | Button and small surface |
| `radius-xl` | 16 px | Standard card/group |
| `radius-2xl` | 20 px | Dialog and mobile sheet top corners |
| `radius-round` | 999 px | Count badge, avatar, status pill |

Do not nest multiple equally rounded elevated cards. A group surface may contain bordered rows; item cards may sit directly on the canvas.

## Shadows

| Token | Value | Use |
| --- | --- | --- |
| `shadow-none` | `none` | Default flat state |
| `shadow-card` | `0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.04)` | Select card elevation only |
| `shadow-raised` | `0 8px 24px rgba(15, 23, 42, 0.12)` | Dropdown or elevated panel |
| `shadow-overlay` | `0 16px 48px rgba(15, 23, 42, 0.18)` | Dialog/drawer overlay surface |

Borders establish structure; shadows do not communicate focus, selected state, validation, or status. Sticky navigation uses an opaque surface and a boundary before it uses shadow.

## Focus tokens

| Token | Value |
| --- | --- |
| `focus-inner` | `0 0 0 2px #FFFFFF` when the control background is dark |
| `focus-outer` | `0 0 0 5px #1976D2` together with the inner separation |
| `focus-offset-light` | 2 px when a single outline is used on a light surface |
| `focus-width` | 3 px |

Rules:

1. Use `:focus-visible`, not blanket removal of `outline`.
2. A focused element remains visible above sticky bars and after sheet/dialog transitions.
3. Error and focus indicators appear together; focus does not replace the error boundary or message.
4. Forced-color mode uses system colors and preserves native outlines.
5. Focus treatment is verified on canvas, surface, selected blue surface, primary action, danger action, and every status background.

## Motion

| Token | Value | Use |
| --- | ---: | --- |
| `motion-instant` | 0 ms | Immediate state correction |
| `motion-press` | 100 ms | Press feedback |
| `motion-fast` | 160 ms | Hover/focus/color transition |
| `motion-standard` | 220 ms | Sheet/panel state transition |
| `motion-slow` | 320 ms | Short modal entrance maximum |
| `ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | General movement |
| `ease-enter` | `cubic-bezier(0, 0, 0, 1)` | Enter |
| `ease-exit` | `cubic-bezier(0.3, 0, 1, 1)` | Exit |

Rules:

1. Do not use pulsing alarms, parallax, animated gradients, or infinite decorative motion.
2. Loading animation cannot be the only signal; include accessible status text or announcements as appropriate.
3. Under `prefers-reduced-motion: reduce`, use `0ms` or effectively immediate transitions, disable nonessential transforms and shimmer, and use automatic rather than smooth scrolling.
4. Motion never delays a business command, hides an unknown result, or suggests delivery/completion before the authoritative state exists.

## Layering

| Token | Value | Layer |
| --- | ---: | --- |
| `z-base` | 0 | Page content |
| `z-sticky` | 100 | Top/bottom navigation |
| `z-dropdown` | 300 | Menu/listbox |
| `z-drawer` | 400 | Mobile sheet/drawer |
| `z-modal` | 500 | Modal dialog |
| `z-toast` | 600 | Short system status |

No component may introduce an arbitrary high z-index. A modal and drawer make the background inert; a toast must not cover the bottom navigation or the primary action.

## CSS implementation contract

When application code begins, expose semantic tokens on `:root` and keep primitive values in the same centralized token file. The implementation shape is:

```css
:root {
  --color-canvas: #f5f7fa;
  --color-surface: #ffffff;
  --color-text: #243247;
  --color-action-primary: #0b4b91;
  --space-4: 1rem;
  --control-md: 3rem;
  --radius-xl: 1rem;
  --motion-fast: 160ms;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-press: 0ms;
    --motion-fast: 0ms;
    --motion-standard: 0ms;
    --motion-slow: 0ms;
  }
}
```

This sample is an interface contract, not the Step 5 application stylesheet. Step 5 will add the complete centralized file and automated token checks.

## Automated validation contract

Before a public preview can pass:

1. A script verifies all approved contrast pairs from their source values.
2. Static checks reject raw component hex colors except within the central token definition and approved test fixtures.
3. Component tests confirm 44-pixel target and 48-pixel default-control minimums where geometry is measurable.
4. Browser tests cover focus visibility, keyboard traversal, reduced motion, forced colors where supported, 200% zoom, 320-pixel width, long fictional names, and large text.
5. Visual regression checks cover canvas, surface, selected, success, warning, danger, information, neutral, disabled, hover, pressed, and focus contexts.
6. Smartphone review includes outdoor/bright-light readability and one-handed target use.

## Explicit rejections

Do not add:

1. Unapproved official-brand claims or screenshot-derived color sampling presented as authoritative.
2. Light gray normal text that fails 4.5:1.
3. Color-only status, ranking, ownership, delivery, or validation meaning.
4. Full-control opacity as the disabled design.
5. One-off component colors, spacing, radii, shadows, sizes, z-indices, or durations.
6. Gradient primary actions, glassmorphism, heavy card shadows, or decorative nested cards.
7. Motion that pulses, blocks action, suggests false completion, or ignores reduced-motion preference.
8. Fixed component heights that clip zoomed or wrapped content.
9. Dark mode in the first prototype; it would double state testing before field value is proven.

## Standards references

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WCAG normal text contrast technique](https://www.w3.org/WAI/WCAG22/Techniques/general/G18)
- [WCAG non-text contrast](https://www.w3.org/WAI/WCAG22/understanding/non-text-contrast.html)
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [WCAG enhanced 44-pixel target](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced)
- [WCAG focus visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible)
- [WCAG focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)

## Acceptance checklist

- [x] Provisional Territory Desk blue and neutral palettes are approved.
- [x] Success, warning, danger, information, and neutral status sets are approved.
- [x] Exact contrast matrix and dual focus-ring rule are approved.
- [x] System font stack, type scale, weights, and sentence-case rule are approved.
- [x] Four-pixel spacing scale and responsive width tokens are approved.
- [x] Target, control, row, icon, and shell-size tokens are approved.
- [x] Border, radius, shadow, layering, and restrained-surface rules are approved.
- [x] Motion and reduced-motion tokens are approved.
- [x] Centralized CSS and automated-validation contracts are approved for Step 5.
- [x] Dark mode remains outside the first prototype.

## User action

No GitHub or coding action is required from the user. This exact system is approved. Step 4.4 will define the default, hover, focus, pressed, disabled, loading, error, success, and empty states for every reusable component.
