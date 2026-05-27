## ADDED Requirements

### Requirement: Shared cozy design tokens

The application SHALL provide a shared stylesheet defining cream-yellow cozy design CSS variables (background, accent, glass surface, text, shadow) for reuse across pages.

#### Scenario: Theme file exists

- **WHEN** developers implement styled pages after this change
- **THEN** `frontend/src/assets/css/cozy-theme.less` defines `--fd-cozy-*` variables documented in comments

### Requirement: Global Tailwind semantic colors alignment

The global `main.css` `:root` color tokens SHALL align with the cozy cream-yellow theme so Tailwind utility classes (`bg-background`, `text-foreground`, `primary`, etc.) are consistent with login and home pages.

#### Scenario: Background color consistency

- **WHEN** user navigates between `/login` and `/home`
- **THEN** page background hues remain in the same warm cream-yellow family

### Requirement: Glass surface pattern

Shared theme variables SHALL include frosted-glass surface values (semi-transparent white background, blur-friendly border, warm shadow) used by login and home card components.

#### Scenario: Card glass styling

- **WHEN** home or login cards are rendered
- **THEN** both use variables from the shared cozy theme for glass background and border

### Requirement: No purple-primary accent in cozy theme

The cozy visual theme SHALL NOT use purple as a primary brand accent; primary accents SHALL be honey/amber/cream tones.

#### Scenario: Theme variable inspection

- **WHEN** reviewing `--fd-cozy-*` definitions
- **THEN** no purple hex or violet HSL is defined as primary accent
