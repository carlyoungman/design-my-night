# DesignMyNight Booking Plugin

A WordPress plugin that embeds a multi‑step React booking widget and a small WP admin app. It integrates with
DesignMyNight (DMN) APIs to fetch venues, booking types, availability, and to submit bookings or enquiries.

> Status: actively developed. Front‑end built with TypeScript + React. Admin uses MUI. Plugin ships compiled assets in
`/dist`.

---

## Features

- Multi‑step booking flow: **Party → Venue → Date & Time → Type → Packages → Details → Review**.
- Live availability and booking‑type retrieval from DMN via WP REST endpoints.
- Optional packages/add‑ons step.
- Customer details capture with **first_name / last_name / email / phone / notes**.
- Accessibility‑first UI with keyboard support.
- Small React admin to sync venues and types and manage settings.

## Tech stack

- **WordPress** plugin (PHP) exposing `/wp-json/dmn/v1/*` endpoints and enqueueing compiled assets.
- **React + TypeScript** widget (Base UI components + Lucide icons).
- **SCSS** for widget styling.
- **MUI** for the admin UI with a custom dark theme.

## Repository layout

```
├─ dmn-booking-plugin.php        # Plugin bootstrap, hooks, enqueue, REST routes
├─ src/                          # TS/TSX sources (widget + admin)
│  ├─ frontend/app/              # React widget components and state
│  │  ├─ components/steps/       # Party, Venue, Date, Time, Type, Packages, Details, Review
│  │  ├─ hooks/                  # useVenues, useBookingTypes, useAvailability
│  │  ├─ WidgetProvider.tsx      # Context + reducer/state
│  │  └─ index.tsx               # Widget entry
│  └─ admin/                     # Admin React app
├─ dist/                         # Compiled, enqueued JS/CSS assets
├─ package.json                  # Scripts, deps
└─ README.md
```

## WordPress plugin

- Activate the plugin in **Plugins → Installed Plugins**.
- The plugin registers REST routes under `dmn/v1/*` that proxy to DMN with your credentials.
- The front‑end widget is enqueued on pages where you embed it (via block, shortcode, or template hook).

### Embed the widget

You can either use the provided block/shortcode (see the plugin’s Settings screen for the exact embed string) or mount
it in a template with a placeholder element and data‑attributes:

```php
<div id="dmn-booking-root"
     data-venue-group="<group-id>"
     data-forced-venue-id="<venue-id>">
</div>
```

The widget reads its config from the element or from a server‑rendered script tag the plugin outputs.

## Local development

1. Requirements: Node 18+, npm or yarn, PHP 8+, WordPress install.
2. Install deps:
   ```bash
   npm install
   ```
3. Start dev build with file watching:
   ```bash
   npm run dev
   ```
4. Build production assets:
   ```bash
   npm run build
   ```
5. Ensure WordPress points at the compiled assets in `/dist`.

> Notes
> - Dev server does not serve through WordPress; the plugin enqueues built files from `/dist`.
> - If you change PHP or REST route code, reload WordPress. For TS/SCSS, the watcher rebuilds.

## Environment & configuration

The plugin stores your DMN credentials in WordPress and proxies requests server‑side. Typical values:

- **DMN API base** (e.g., `https://api.designmynight.com/v4`).
- **DMN API key / secret** stored in WP options (never exposed to the browser).
- **Venue group** and optional **forcedVenueId** to constrain the widget.

## Widget architecture

### Step order and guards

```ts
// state.step progression
party → venue → date_time → type → packages ? → details → review
```

- **Type** depends on date+time to ensure correct availability.
- **Packages** step is skipped when no packages are available.

### Global state shape (excerpt)

```ts
// Keep DMN‑aligned names for customer
customer: {
  first_name: string;
  last_name: string;
  email: string;
  phone ? : string;
  message ? : string;   // mapped to DMN `notes`
  gdpr ? : boolean;     // local consent only; not sent verbatim
}

// Core booking shape validated by availability
venueId: string;
partySize: number;
date: string;      // YYYY‑MM‑DD
time: string;      // HH:mm
bookingType: string;  // DMN activity/type id
packagesSelected ? : Array <
...>
;
```

### Key hooks

- `useVenues(venueGroup, enabled)` → list of venues.
- `useBookingTypes({ venueId, date, partySize, enabled })` → activity types for the selected context. Debounced and
  aborted correctly to avoid duplicate calls.
- `useAvailability(payload)` → checks date/time/type validity and returns suggested times and `next` actions.

### Main components

- `PartySizeStep`, `VenueStep`, `DateStep`, `TimeStep`, `TypeStep`, `PackagesStep`, `DetailsStep`, `ReviewStep`.
- `WidgetProvider` holds reducer, actions, and error handling.

## DMN integration

All browser calls hit WordPress at `/wp-json/dmn/v1/*`, and the plugin forwards to DMN with auth.

Endpoints used:

- `GET /booking-types?venue_id&num_people&date` — available experiences for a date/party.
- `GET /booking-availability?fields=date|time&…` — calendar and time slots.
- `GET /venues?group=…` — venue list for a group.
- `POST /bookings` — create booking or enquiry if payment is not required.

Customer fields sent to DMN on submit:

```json
{
  "first_name": "Alice",
  "last_name": "Jones",
  "email": "alice@example.com",
  "phone": "+447700900123",
  "notes": "Vegetarian menu, please"
}
```

> `gdpr` is not an API field. Keep it locally for consent and map marketing opt‑ins to `newsletter_signup` /
`marketing_preferences[]` only if used.

## Validation rules (front‑end)

- First/last name: min 2 chars each.
- Email: simple RFC‑like regex.
- Phone: digits, spaces, `+`, `(`, `)`, `-`, up to 20 chars.
- Notes/message: max 500 chars.
- Consent required to proceed.

## Styling & theming

- Widget styles live under `src/frontend/app/styles` (SCSS). BEM‑style classes with a small design token layer.
- Admin app uses **MUI** with a custom dark theme; override via `createTheme` in `src/admin/theme.ts`.

## Accessibility

- Inputs have labels and `aria-invalid` / `aria-describedby` on error.
- Keyboard navigation through all steps.
- Focus management per step shell.

## Error handling

- Network and validation errors are surfaced via a global `ERROR` action in state and inline field errors where
  relevant.
- Duplicate requests are avoided via `AbortController` inside hooks.

## Building for release

- Run `npm run build` to produce `/dist/*` assets.
- Update plugin version in the file header.
- Tag a release in Git and deploy to your WP site.

## Roadmap

- Finish packages step UX for add‑ons.
- Dedupe any remaining double fetches in StrictMode.
- Integrate marketing preferences toggle when required.
- E2E tests for full flow.

## Contributing

- Code style enforced via ESLint + Prettier + Stylelint.
- Commit small, focused changes. Prefer descriptive PRs.

## License

Proprietary. All rights reserved.
