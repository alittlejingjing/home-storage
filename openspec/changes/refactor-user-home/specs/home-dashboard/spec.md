## ADDED Requirements

### Requirement: Home dashboard layout

The home page at `/home` SHALL display a mobile dashboard with: welcome header, search entry, summary statistics, horizontally scrollable category cards, quick action cards, and pull-to-refresh, consistent with `详细设计_搜索与仪表盘.md` section 7.1. The home page SHALL NOT display a recent items section or a cabinet summary list.

#### Scenario: User opens home after login

- **WHEN** authenticated user navigates to `/home`
- **THEN** the page shows search entry, summary statistics, category cards, and quick actions without recent items or per-cabinet list blocks

### Requirement: Search entry navigation

The home page SHALL provide a search entry control that navigates to `/search` when activated.

#### Scenario: User taps search entry

- **WHEN** user clicks the search entry area
- **THEN** the router navigates to `/search`

### Requirement: Category statistics and navigation

The home page SHALL show category statistics (name and item count) in a horizontally scrollable area; tapping a category SHALL navigate to the items list filtered by that category.

#### Scenario: User taps a category card

- **WHEN** user clicks a category card with id `cat-1`
- **THEN** the router navigates to `/items` with query `categoryId=cat-1`

### Requirement: Quick action entries

The home page SHALL provide quick action cards for navigating to all items (`/items`) and cabinet management (`/cabinets`); it SHALL NOT show a per-cabinet summary list on the home page.

#### Scenario: User taps cabinet quick action

- **WHEN** user clicks the cabinet quick action card
- **THEN** the router navigates to `/cabinets`

#### Scenario: User taps all items quick action

- **WHEN** user clicks the all items quick action card
- **THEN** the router navigates to `/items`

### Requirement: Pull to refresh

The home page SHALL support pull-to-refresh at scroll top to reload dashboard data.

#### Scenario: User pulls down to refresh

- **WHEN** user pulls down at page top past threshold and releases
- **THEN** dashboard data is reloaded and a refreshing indicator is shown until complete

### Requirement: Custom category dialog

The home page SHALL allow adding a custom category via Element Plus dialog with name input and confirm/cancel actions.

#### Scenario: User adds custom category

- **WHEN** user enters a non-empty category name and confirms
- **THEN** the category is persisted via the categories store and appears in category statistics

### Requirement: Technology stack compliance

The home module SHALL use Element Plus for interactive UI and Tailwind for layout; it MUST NOT import from `@/components/ui` or `lucide-vue-next`; files SHALL be split into `index.vue`, `index.ts`, and `index.less` under `views/home/`.

#### Scenario: Module structure inspection

- **WHEN** the home module is implemented
- **THEN** it follows html/js/css separation and uses `@element-plus/icons-vue` for icons

### Requirement: Visual consistency with login

The home page visual style SHALL use the shared cozy cream-yellow glass theme (same design tokens as the login page) for cards, backgrounds, and primary accents.

#### Scenario: Visual review

- **WHEN** user views login then home in sequence
- **THEN** both pages share cream-yellow palette and frosted-glass card treatment without purple-dominant accents
