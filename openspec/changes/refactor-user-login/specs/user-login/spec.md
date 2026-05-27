## ADDED Requirements

### Requirement: Login form display

The login page SHALL display a mobile-friendly login form with email and password fields, a submit button, and branding for「家享收纳」.

#### Scenario: User opens login page

- **WHEN** user navigates to `/login`
- **THEN** the page shows email input, password input, login button, and demo account hint text

### Requirement: Form validation

The login form SHALL validate that email and password are provided before submission; email MUST match a valid email format.

#### Scenario: Empty fields submitted

- **WHEN** user submits with empty email or password
- **THEN** the system shows a validation error and does not attempt login

#### Scenario: Invalid email format

- **WHEN** user enters a malformed email and submits
- **THEN** the system shows an email format validation error

### Requirement: Password visibility toggle

The password field SHALL support toggling visibility using Element Plus built-in behavior.

#### Scenario: Toggle password visibility

- **WHEN** user activates the password visibility control
- **THEN** the password characters become visible or hidden accordingly

### Requirement: Demo account quick fill

The login page SHALL provide a control to auto-fill the demo credentials `admin@example.com` and `password`.

#### Scenario: User clicks demo account shortcut

- **WHEN** user clicks the demo account link or button
- **THEN** email and password fields are filled with demo values

### Requirement: Authentication submission

The system SHALL authenticate using the auth store with submitted credentials.

#### Scenario: Successful login

- **WHEN** user submits valid demo credentials
- **THEN** the system stores auth session, shows success feedback, and navigates to the home page

#### Scenario: Failed login

- **WHEN** user submits incorrect credentials
- **THEN** the system shows an error message and remains on the login page

### Requirement: Technology stack compliance

The login module SHALL use Element Plus for interactive UI components and Tailwind CSS for layout styling; it MUST NOT import from `@/components/ui` or `lucide-vue-next`.

#### Scenario: Code structure inspection

- **WHEN** the login module is implemented
- **THEN** it uses `el-form`, `el-input`, `el-button`, and separates template, logic, and styles into `index.vue`, `index.ts`, and `index.less`
