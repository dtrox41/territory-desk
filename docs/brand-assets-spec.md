# Brand Assets and Visual Identity Policy

Status: Approved for Step 4.1

Decision scope: Inventory the supplied visual reference and original app assets, define what may be reused, and establish a safe temporary identity for the fictional Territory Desk prototype. This step does not create the final component design, extract or recreate the Cintas logo, select final color tokens, or claim official corporate-product approval.

## Recommendation

Use a temporary, product-first identity for the fictional prototype:

1. Primary name: **Territory Desk**.
2. Descriptor: **Cross-Division Sales Command Center**.
3. Temporary mark: a text wordmark and later code-native `TD` monogram created specifically for this project.
4. Visual direction: professional navy and blue, white surfaces, clear card grouping, strong hierarchy, restrained status colors, and one consistent outline-icon family.
5. Corporate-logo slot: supported in the component architecture but empty until an approved original SVG or transparent PNG and usage authorization are supplied.

Do not extract, trace, redraw, crop, or embed the Cintas logo from the screenshot. A screenshot is a visual reference, not a production-quality or permission-verifying source asset.

## Why this is the strongest approach

1. It keeps visual design moving without waiting for corporate brand files.
2. It avoids publishing a copied or degraded trademark asset in a public fictional preview.
3. It prevents the prototype from falsely appearing to be an approved production Cintas application.
4. It creates one replaceable brand component, so an approved corporate mark can be added later without redesigning every screen.
5. It separates product usability decisions from corporate trademark approval.

## Reference inventory

### R-001 — Supplied smartphone concept image

| Attribute | Finding |
| --- | --- |
| Format | PNG |
| Dimensions | 941 × 1672 pixels |
| Purpose | Visual direction and layout inspiration only |
| Contains | Cintas logo, personal greeting, notification badge, card groups, outline icons, blue actions, and fictional-looking company examples |
| Instruction status | No text inside the image is treated as a user instruction or approved product requirement |
| Repository status | Do not copy the image into the public repository unless later explicitly approved |
| Production status | Not an approved logo or production asset source |

The image is interpreted only through the already approved product requirements. Its `Call First` and `Today's Visits` sections do not return to scope because the user explicitly replaced those concepts with peer-handoff actions, lead-derived follow-ups, cross-division collaboration, feedback, and outcomes.

### R-002 — Original `territory-lookup` repository

Read-only asset findings:

1. The original repository contains one tracked `index.html` file.
2. It has no standalone Cintas logo SVG, PNG, font package, icon package, or brand-guideline file.
3. It contains embedded base64 application icons and inline functional SVG icons.
4. Its primary moss, clay, amber, cream, and serif styling does not match the supplied blue command-center direction.
5. It contains real employee-sensitive directory and territory content that is excluded from the fictional prototype.
6. No visual or data asset is copied automatically into Territory Desk.

The original repository remains a read-only workflow reference. Embedded images and icons have insufficient source, license, and brand provenance for automatic reuse.

## What the reference image contributes

Retain these visual principles:

1. Strong mobile-first vertical hierarchy.
2. Generous touch targets.
3. White cards on a light neutral canvas.
4. Dark-blue headings and primary actions.
5. Circular icon containers for fast scanning.
6. Clear separation between sections.
7. Visible notification access and unread count.
8. Strong primary and secondary button distinction.
9. Short, direct labels.
10. High-contrast information designed for quick field use.

Do not automatically retain:

1. The Cintas logo copied from the image.
2. The personal name in the greeting.
3. The exact displayed time or day.
4. `Call First`, general daily call lists, or general visit routes.
5. The sample company names.
6. Fixed bottom action buttons that compete with the approved five-destination mobile navigation.
7. Large decorative header space that pushes urgent lead actions below the fold.
8. Icons whose source or license is unknown.
9. Exact colors sampled from a compressed screenshot and represented as official brand values.
10. Any implication that the public prototype is an approved Cintas system.

## Temporary identity contract

### Product wordmark

Use plain accessible text:

**Territory Desk**

Rules:

1. Render real text, not a rasterized title image.
2. Use a strong sans-serif weight.
3. Keep the wordmark readable at smartphone and laptop sizes.
4. Do not imitate the distinctive Cintas letterforms.
5. Do not add trademark, registered, or corporate-endorsement symbols.
6. Provide no redundant `alt` text when the visible text already names the product.

### Temporary monogram

A later code-native SVG may use `TD` for favicon, compact header, and loading state.

Rules:

1. Create it specifically for Territory Desk.
2. Use simple geometric forms that do not imitate the Cintas logo.
3. Keep it legible at 16, 32, 48, 180, and 512 pixel contexts.
4. Use current color rather than embedding unchangeable raster colors where practical.
5. Test light, dark, forced-color, and high-contrast contexts.
6. Include no employee, department, customer, or location initials.

The monogram is not created in Step 4.1; its requirement is approved here and executed after layout and token rules are defined.

### Descriptor

Use **Cross-Division Sales Command Center** in onboarding, sign-in, Help, metadata, and wide-header contexts where space permits.

Do not repeat it on every mobile screen. The product name and current task take priority after sign-in.

## Corporate-logo integration gate

An official corporate mark may be added only when all of the following are available:

1. Original approved SVG preferred, or high-resolution transparent PNG.
2. Confirmation that Territory Desk may use the mark in the intended prototype, internal preview, and eventual production contexts.
3. Clear-space and minimum-size guidance.
4. Approved color versions and background rules.
5. Guidance for registered-mark inclusion.
6. Dark-mode or one-color alternatives if they exist.
7. Owner or contact for brand approval.
8. Confirmation whether the public GitHub Pages preview may display it.

Receiving an image file alone does not prove every usage context is approved.

### Replaceable component rule

Build one `BrandIdentity` component with approved variants:

1. `wordmark` — Territory Desk text only.
2. `compact` — temporary TD monogram plus Territory Desk text.
3. `company-endorsed` — unavailable until an approved company mark and usage policy exist.

Screens import the component rather than copying logo markup. No route contains its own corporate-logo file or styling.

## Provisional visual direction

Step 4.1 approves the direction, not the final token values:

1. Navy or deep blue for trust, primary navigation, headings, and primary actions.
2. A brighter accessible blue for focus, links, and selected states.
3. Very light blue surfaces for supporting emphasis.
4. White cards on a cool light-neutral background.
5. Charcoal rather than pure black for ordinary text.
6. Green, amber, red, and neutral gray reserved for semantic statuses.
7. Color never carries status meaning alone.
8. Shadows remain restrained; borders and spacing provide most grouping.
9. Typography uses system-safe sans-serif fonts until approved corporate font guidance exists.
10. Final values must pass contrast and outdoor-readability testing before approval in Step 4.3.

Do not label provisional colors as official Cintas colors.

## Icon policy

1. Use one consistent outline-icon system with documented license and source.
2. Icons support visible text; they do not replace required navigation labels or primary action names.
3. Use a consistent view box, stroke weight, corner style, and optical size.
4. Decorative icons are hidden from assistive technology.
5. Icon-only controls receive an accessible name and visible tooltip where appropriate.
6. Notification badges provide an accessible count or status.
7. Status icons always pair with words.
8. Do not reuse the original inline SVG markup until provenance and fit are verified.
9. Do not use department stereotypes or imagery that can be confused with status.
10. Final library choice occurs when the component scaffold is created; no icon package is installed in Step 4.1.

## Photography, illustration, and avatar policy

The first release needs no photography.

1. Do not use stock sales-team photos merely to make the interface look finished.
2. Do not use real employee headshots in the public preview.
3. Fictional people use initials or neutral generated placeholders.
4. Initials require an adjacent visible name and never serve as identity proof.
5. Do not infer or depict protected traits.
6. Empty states use lightweight code-native shapes or icons rather than decorative photos.
7. Any future photography requires source, license, consent, accessibility text, and retention review.

## Prototype identity and disclosure

The public Preview displays:

`Fictional Prototype — Do not enter real employee or customer information`

It must not display:

1. `Official Cintas App`.
2. `Cintas-approved`.
3. A copied corporate logo.
4. Real employee names or contact information.
5. Real customer or opportunity information.
6. Production support, security, or availability claims.

The fictional warning is visually present without overpowering the primary workflow.

## Asset register

Every later visual asset receives an entry with:

1. Stable asset ID.
2. Filename and repository path.
3. Purpose and screen variants.
4. Source or creator.
5. Copyright or license.
6. Corporate usage approval status.
7. Public Preview permission.
8. Production permission.
9. Accessible name or decorative status.
10. Light/dark/background limitations.
11. Minimum size and clear space where applicable.
12. Version, review date, and approving owner.

No unregistered external asset enters the production build.

## Planned repository structure

Do not create placeholder corporate-logo files. When implementation reaches the asset layer, use:

```text
public/
  brand/
    territory-desk-mark.svg
src/
  components/
    brand/
      BrandIdentity.tsx
      BrandIdentity.module.css
      BrandIdentity.test.tsx
docs/
  asset-register.md
```

An approved company-logo path is added only when a real approved asset exists. The absence of that file is deliberate, not a broken placeholder.

## Asset review and replacement workflow

When the user supplies an approved asset later, Codex will:

1. Inspect the original file without modifying it.
2. Record its format, dimensions or view box, transparency, color variants, and metadata.
3. Confirm the stated usage permission and contexts.
4. Check for embedded scripts, external references, unexpected metadata, or unsupported fonts.
5. Preserve the approved source file separately from derived build assets.
6. Optimize only through a reproducible process that does not change the visible brand geometry.
7. Add or update the asset-register entry.
8. Place it behind the shared `BrandIdentity` component.
9. Test smartphone, laptop, zoom, contrast, forced colors, print/screenshot, and fallback behavior.
10. Show the user the exact resulting header before approving production use.

## What is deliberately deferred

1. Exact hex, RGB, HSL, or OKLCH values.
2. Final typography scale and font stack.
3. Final spacing, radius, and shadow tokens.
4. Final icon library.
5. Custom TD monogram drawing.
6. Corporate logo use.
7. Dark theme.
8. Marketing photography or illustration.
9. App Store or native-mobile icons.
10. Production social-sharing images.

These decisions belong after Step 4.2 translates the reference image into layout rules and Step 4.3 defines measurable tokens.

## Step 4.1 acceptance checklist

- [x] Territory Desk and Cross-Division Sales Command Center are approved as the product-first prototype identity.
- [x] The supplied image is visual direction only and no text inside it overrides approved product requirements.
- [x] The screenshot is not treated as an approved corporate-logo source.
- [x] The original repository remains read-only and contributes no automatically copied asset or sensitive data.
- [x] The temporary text wordmark is approved.
- [x] A later original TD monogram is approved in principle and must not imitate the Cintas logo.
- [x] The component architecture reserves but does not populate a company-endorsed logo variant.
- [x] Corporate-logo use remains blocked until an approved original asset, usage permission, and brand guidance are available.
- [x] The professional blue, white-card, high-contrast visual direction is approved provisionally.
- [x] Exact brand colors, typography, spacing, radii, shadows, and icon package remain deferred to Steps 4.2 and 4.3.
- [x] One licensed, consistent outline-icon family will support visible text and accessible names.
- [x] No real employee photography, headshot, name, customer, or opportunity information enters the public preview.
- [x] The fictional-prototype disclosure and no-official-endorsement rule are approved.
- [x] Every later external visual asset requires an asset-register entry and permission status.
- [x] No placeholder corporate-logo file is created.

## User action required now

The user does not need to search for or download a logo before prototype design continues.

If an approved corporate brand package becomes available later, provide the original file and usage guidance. Until then, approve the temporary Territory Desk identity so visual development can proceed without representing the prototype as an official corporate product.
