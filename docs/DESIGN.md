# WoodSpec Design System

## Palette

Source: Realtime Colors

- Text: `#1b0b09`
- Background: `#fcf9f8`
- Primary: `#d5695d`
- Secondary: `#a53327`
- Accent: `#d58d85`

## Tailwind Tokens

- Use Tailwind v4 tokens from `src/index.css` as the single source of truth.
- Prefer semantic classes: `text-foreground`, `bg-background`, `bg-card`, `bg-primary`, `bg-secondary`, `bg-accent`, `border-border`.
- Do not hardcode brand colors inside component class names unless the value represents real product material color.
- Product material swatches may keep their own hex values.

## Typography

- Font: Inter via `@fontsource-variable/inter`.
- Use clear hierarchy through weight, size, and spacing.
- Keep Vietnamese text short, direct, and user-facing.

## Components

- Cards: `bg-card`, thin `border-border`, soft `shadow-gallery-sm`, moderate radius.
- Primary buttons: `bg-primary text-primary-foreground`.
- Secondary/outline buttons: use token variants from shared `Button`.
- Inputs: `bg-card`, `border-border`, `focus:border-primary`.
- Badges/statuses: use semantic tokens like `success`, `warning`, `primary`, `secondary`.

## Icons

- Use `lucide-react` only.
- Icons should help scanning in nav, primary actions, step headings, and statuses.
- Do not place icons on every input, every metric, or every line of copy.

## Flow Rule

- Configurator is the only place to edit product dimensions, material, internal layout, and request details.
- Spec Review is read-only. It shows what the user already chose, lets the user confirm each group, and then sends the quote request.
- If a user needs to change anything from Spec Review, send them back to Configurator with `Chỉnh trong mô hình 3D`.
