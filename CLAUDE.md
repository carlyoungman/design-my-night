# Dashboard UI Design Rules

> Reusable design and implementation guidance for modern, user-friendly dashboards, especially WordPress admin plugin applications. Use this document as an instruction file for AI-assisted development, including Claude Code.
>
> This plugin has two UI surfaces: the **wp-admin app** (`src/admin`, React + MUI + SCSS) and the **customer-facing booking widget** (`src/frontend`, React + Base UI + SCSS). Sections 1–10 cover the admin app. Section 11 covers the widget. Section 12 covers integration with the DesignMyNight API, which must always follow the official DMN developer documentation.

## 1. Design goals

Design dashboards that help users understand their current state, identify what requires attention, and complete common tasks efficiently. Prioritise usability, accessibility, clarity, consistency, and performance over decoration.

- Treat **Material Design 3 (Material 3)** as the design target, adapted where needed for the product and the WordPress admin environment.
- The admin is built with **MUI v7**, which implements Material Design 2. Theme and style MUI components toward Material 3 (shape, colour roles, typography, component states) instead of accepting MUI's default Material 2 look. Don't add a second component library just to get Material 3 components.
- Apply established SaaS dashboard interaction patterns rather than inventing unfamiliar controls.
- Maintain a common design-token and component system across related plugins.
- Use a clean, approachable theme, light by default with a dark mode (section 4), with restrained colour, generous whitespace, clear typography, and rounded components.
- Do not copy the example data or visual treatment blindly: choose structure and content according to each screen's actual user goals.

## 2. Information architecture and layout

- Start each screen with a meaningful page title, short supporting context if needed, and the most relevant primary action.
- Prioritise the few metrics or tasks that answer the user's main questions. Do not fill space with low-value KPI cards.
- Place summary information above detailed charts and record-level tables; use progressive disclosure for advanced controls and secondary information.
- Group related content by task or concept. Separate sections with spacing, meaningful headings, subtle surfaces, or borders rather than excessive decoration.
- Use a responsive grid (a 12-column desktop grid is appropriate when useful). Do not force every screen into a uniform card layout.
- Keep alignment consistent. Avoid excessive nested cards, cramped controls, dense iconography, and large areas of unusable whitespace.
- Support appropriate empty, loading, error, and success states for every data-dependent area.

### Suggested overview structure (adapt to the product)

1. Page title, context, global date range or filters, and primary action.
2. Small set of relevant KPI summaries with units and comparison periods.
3. Main trend or operational view, with contextual filters.
4. Secondary breakdown or status information.
5. Recent activity, exceptions, or actionable records.

This is a starting point, not a mandatory template. For operational dashboards, urgent tasks may belong above historical analytics.

## 3. Navigation

The admin screen is one WordPress menu page with a page header (title and intro) followed by section tabs, each with an icon and a text label: Dashboard, Venues, Connection, URL parameters, Shortcode, and Appearance (`SECTIONS` in `src/admin/AdminContext.tsx`). The active section is kept in the URL hash. Every panel stays mounted and inactive ones are hidden, so switching section never loses unsaved edits; tabs with unsaved edits show a marker.

Dashboard is the landing view (`Dashboard.tsx`): setup steps until the plugin is connected and imported, the outcome of the last import (recorded by `dmn_admin_sync_all` in the `dmn_last_import` option and read from `GET dmn/v1/admin/overview`), the connection settings, totals, and venues that need attention. It makes no DesignMyNight request when opened.

The Connection section is the setup flow, in numbered steps: **1. Connect to DesignMyNight** (`SettingsCard`: save and test the API credentials), then **2. Import venues and activities** (`ImportDataCard`, `POST dmn/v1/admin/sync/all`; waits for saved credentials, shows the last import, and points to Venues afterwards). Saving settings and a failed import call `notifyOverviewChanged` (not `notifyDataChanged`, which would reload the activity editor and discard its unsaved edits) so step 2 and the Dashboard see the new credentials or import record. It ends with **Start over** (`RemoveDataCard`, `DELETE dmn/v1/admin/data`), which after a confirmation dialog deletes the imported venues, activities, and the import record, and optionally resets every setting, so the plugin is back to how it looks before an import.

The Venues section starts with an overview of every imported venue with a summary of its activities (`VenuesOverview`). Opening a venue shows its activities (`#venues/<id>`, `ActivityManagerCard`), with a breadcrumb back to the overview, and a **Venue options** sidebar (beside the activities on wide screens, above them on narrow ones) with the setting for unavailable activities (show them disabled with DMN's reason, or hide them; the `dmn_hide_unavailable` venue meta, applied by `GET dmn/v1/booking-types`), which saves as soon as it changes. The activity editor stays mounted behind the overview, so going back keeps unsaved edits (the venue's card shows them), and opening a different venue asks before discarding them (`VenuesPanel`).

The Shortcode section starts with a generator (`ShortcodeGenerator`): a form for every `[dmn_booking]` option, with the venue and activities picked from the imported ones (their DMN IDs fill `venue_id` and `type_id`), and the resulting shortcode with a Copy button. It saves nothing and makes no DesignMyNight request. The options reference table follows it (`ShortcodeCard`).

- Keep the existing WordPress admin navigation for plugins that run inside wp-admin.
- Place plugin screens and subsections in a logical, stable hierarchy; avoid duplicating the whole WordPress sidebar inside a plugin.
- Use descriptive labels and indicate the active page clearly.
- Use breadcrumbs for genuinely multi-level flows and meaningful back navigation for detail pages.
- Keep frequently used actions discoverable. Use contextual menus only for secondary actions.
- Do not make users memorise navigation paths or rely on icons without labels where meaning is ambiguous.

## 4. Typography, spacing, colour, and elevation

Use the shared design tokens instead of ad-hoc values. The values below are this plugin's admin tokens, defined on `.dmn-admin` in `src/admin/styles/styles.scss`. Update this section if you change the tokens.

| Token or element                    | Value                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Font                                | Michroma (`--font-family`), falling back to the system sans-serif stack                                       |
| Body text                           | 16 px, line-height 1.6, weight 400 (`--font-base-size`, `--font-base-line-height`, `--font-base-font-weight`) |
| Labels, status text, tabs           | 14 px, weight 600 for labels and tabs                                                                         |
| Supporting / help text and metadata | 13 px (`.dmn-admin__help`)                                                                                    |
| Page heading                        | 28 px (`.dmn-admin__title`); section headings (`h2`) 22 px, card titles (`h3`) 18 px                          |
| Spacing scale                       | 15 px base (`--universal-space`): 7.5 (`-half`), 15, 30 (`-2`), 45 (`-3`), 60 (`-4`) px                       |
| Card corner radius                  | 15 px (`--border-radius`)                                                                                     |
| Borders                             | 1 px `--c-divider`                                                                                            |
| Shadows                             | `--box-shadow-1` (resting), `--box-shadow-2` (raised), `--box-shadow-3` (overlay)                             |
| Transition                          | `--transition`: `all 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)`                                                |
| Colour                              | See the colour palette below                                                                                  |
| Breakpoints                         | 320, 576, 768, 992, 1200, 1440 px, used through the mixins in `settings/_breakpoints.scss`                    |

### Colour palette

This palette applies to both the admin app and the booking widget. It is defined once, in `src/shared/styles/_palette.scss`, and included on `.dmn-admin` and `.dmn-widget-root`. Variables are named by role, so each has a light and a dark value.

| Variable            | Light                                            | Dark                   | Use                                                                                                               |
| ------------------- | ------------------------------------------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `--c-primary`       | theme colour (default `#6750A4`)                 | theme colour, shaded   | Primary buttons, selection, active navigation, and focus rings                                                    |
| `--c-primary-text`  | theme colour, shaded                             | theme colour, shaded   | The theme colour used as text or icons: links, secondary and text buttons                                         |
| `--c-on-primary`    | `#FFFFFF` or `#1D1B20`                           | `#FFFFFF` or `#1D1B20` | Text and icons on `--c-primary` fills                                                                             |
| `--c-primary-hover` | `--c-primary` mixed 12% with `--c-primary-shade` | same                   | Hovered primary fills. The shade is the opposite of `--c-on-primary`, so hovering only raises the text's contrast |
| `--c-surface`       | `#FFFFFF`                                        | `#211F26`              | Cards, panels, inputs, and primary content surfaces                                                               |
| `--c-background`    | `#F8F7FA`                                        | `#141218`              | Main application background                                                                                       |
| `--c-divider`       | `#E7E0EC`                                        | `#49454F`              | Decorative borders, dividers, and secondary surfaces                                                              |
| `--c-outline`       | `#79747E`                                        | `#938F99`              | Input, checkbox, and other control borders                                                                        |
| `--c-text`          | `#1D1B20`                                        | `#E6E0E9`              | Main headings and body text                                                                                       |
| `--c-success`       | `#379f70`                                        | `#6fcf9f`              | Success and saved states                                                                                          |
| `--c-error`         | `#bb3d3d`                                        | `#f2b8b5`              | Errors and unsaved changes                                                                                        |

**Theme colour and mode.** The theme colour and the light/dark mode are settings in the admin's Appearance section (`Appearance` in `src/php/Config/Appearance.php`, `GET/POST dmn/v1/admin/appearance`). There is one theme colour for both surfaces and a separate mode for each (`light`, `dark`, or `system` to follow the device). The server writes the mode as `data-mode` and the colour as `--theme-*` custom properties on each root element, so pages render in the right colours before any script runs. Because any colour can be picked, `Appearance::css_vars()` shades it per mode (towards black in light mode, white in dark) until fills reach 3:1 against the surfaces with 4.5:1 for the text on them, and `--c-primary-text` reaches 4.5:1. Never use `--c-primary` for text; use `--c-primary-text`. For a hovered primary fill use `--c-primary-hover`, never a mix toward `--c-on-primary` or `--c-text`, which can lower the contrast of the text on it. If you change a surface, background, or text colour, change it in both `_palette.scss` and `Appearance.php`.

Contrast limits (checked against `--c-surface` and `--c-background` in each mode):

- `--c-success` in light mode is only about 3.1–3.3:1, so it fails the 4.5:1 minimum for normal text. Use it for icons, fills, and borders, or for text of at least 24 px (19 px bold). Always pair it with a readable text label in `--c-text`.
- `--c-divider` is below 3:1 in both modes, so it only works as a decorative divider or surface. Input, checkbox, and other control borders need at least 3:1, so use `--c-outline` for those.
- `--c-outline` reaches at least 3:1 in both modes (about 4.3–4.6:1 light, 5.1–5.9:1 dark), enough for control borders.
- `--c-primary-text`, `--c-error`, and `--c-text` pass 4.5:1 on both surfaces in both modes.

- Distinguish page, section, label, metric, and supporting-text hierarchy through typography before adding decorative elements.
- Use the named palette variables for every colour. Do not add ad-hoc hex values; if a new colour is needed, add it to the palette first. Use each colour only for the purpose listed in the palette.
- Never use colour alone to convey status: pair it with readable text and, where useful, an icon.
- Check contrast in real rendered states, especially supporting text that is dimmed with opacity.
- Cards use a border, not a shadow. Use the three shadow levels only for real layering: raised buttons, menus, popovers, dialogs, and sticky elements over content. Avoid multiple competing accent colours and low-contrast grey text.
- Respect reduced-motion and user theme preferences where the product supports them.

## 5. Metrics, charts, and tables

- Display meaningful KPI labels, values, units, and measurement periods. Explain comparisons (for example, “vs previous 30 days”) rather than displaying an unexplained arrow or percentage.
- Do not invent metrics, growth percentages, dates, customer names, or financial figures in production UI. Clearly mark sample data in mockups.
- Use line charts for trends, bar charts for category comparisons, and tables when exact values or record-level actions are important.
- Use appropriate chart scales, legible axis labels, units, accessible tooltips, and text alternatives or associated data tables.
- Avoid misleading truncated axes, ambiguous date ranges, overloaded legends, decorative 3D charts, and too many series.
- Expose useful date filtering, search, sorting, and export only where the underlying functionality exists.
- For data tables, provide readable column labels, sensible alignment (especially numbers and currency), status text, sorting and pagination as necessary, and accessible row actions.
- Use progressive disclosure to move from an overview metric to detailed reports or records.

## 6. Forms, actions, and interaction feedback

- Make one primary action visually dominant within a form or focused section. Give secondary and destructive actions appropriately lower prominence.
- Use persistent field labels, appropriate input types, helpful descriptions when needed, and inline, specific validation messages.
- Preserve input after validation failures. Show which field needs attention and how to correct it.
- Display loading or pending states and prevent duplicate submission while an operation is in progress.
- Confirm consequential or irreversible operations; offer undo for reversible actions when practical.
- Show clear success or failure feedback. Avoid generic messages such as “Something went wrong” when a useful recovery action is known.
- **Feedback: toast or inline.** Report the outcome of an action the user started (a save, an import, continuing to checkout) in a toast (Base UI Toast; `useToast` in `src/admin/components/Toasts.tsx`, `useErrorToast` in `src/frontend/app/components/Toasts.tsx`). Errors have a short title saying what failed, the reason as the description, and a **Try again** action where one makes sense; they stay until dismissed and are announced assertively. Confirmations such as “Settings saved.” are announced politely and close after a few seconds, unless they carry an action. Each component owns one toast, so a new outcome replaces the last; clear it when the user retries. Keep feedback inline when it belongs to a place on the page or lasts: field validation, a load failure that leaves an area without content (with its Try again), progress while an action runs, state such as “Unsaved changes”, and results the user asked to see, such as the connection test.
- Ensure hover, focus, active, disabled, loading, and error states are visually distinct and functionally correct.
- Never use decorative buttons, filters, menus, or links that do nothing. If a feature is not implemented, do not present it as functional.

## 7. Responsive behaviour

- Design for desktop, tablet, and mobile, including the space taken by WordPress admin navigation and toolbar.
- At narrower widths, adapt layout and information priority rather than simply shrinking desktop components.
- Reflow KPI cards and sections; maintain visible titles and primary actions.
- For complex tables, selectively hide optional columns, offer a record-card layout, or enable accessible horizontal scrolling as appropriate. Never silently remove essential data or actions.
- Maintain comfortable control spacing and avoid unintended horizontal page overflow.
- Test realistic content lengths, long labels, validation errors, and browser zoom.

## 8. Accessibility: aim for WCAG 2.2 AA

- Use semantic HTML, appropriately structured headings, real buttons and links, and accessible names for icon-only controls.
- Support keyboard operation and a visible focus indicator. Ensure focus is not obscured by sticky headers, dialogs, or overlays.
- Provide at least **4.5:1** contrast for normal text and **3:1** for large text, with applicable WCAG exceptions; provide at least **3:1** contrast for non-text UI components and graphical objects where required.
- Meet the WCAG 2.2 AA minimum pointer target size of **24 × 24 CSS pixels**, allowing for the specification's exceptions. Prefer larger comfortable hit areas when space permits.
- Associate labels, descriptions, and error messages with form controls; communicate status changes appropriately to assistive technologies.
- Do not rely only on colour, icon shape, hover, animation, or spatial position to convey essential information.
- Make modal focus management, escape behaviour, keyboard navigation, and return-focus behaviour predictable.
- Honour `prefers-reduced-motion` for nonessential motion.
- Accessibility is a verified implementation requirement, not something a mockup alone can guarantee.

## 9. Loading, empty, error, and success states

Every asynchronous view should account for:

- **Loading:** use a progress indicator or skeleton that reflects the structure of the incoming content; avoid unnecessary layout shifts.
- **Empty:** explain what is missing and provide the next relevant action when one exists.
- **Error:** state what failed, preserve useful context and user input, and offer a sensible recovery path.
- **Success:** confirm completion near the relevant action without interrupting the user unnecessarily.
- **No results:** distinguish “there is no data” from “your filters returned no matches,” and allow filters to be cleared.

## 10. WordPress admin integration

- Preserve WordPress's top admin bar, global sidebar, permissions, and established navigation patterns. Apply Material 3 **within the plugin interface**, not to unrelated admin pages.
- Scope CSS under a plugin-specific root class (`.dmn-admin`) or equivalent isolation strategy; avoid broad selectors such as `button`, `input`, `h1`, or `.notice` without a parent scope. This applies to custom properties and to WordPress's own elements, **even on screens the plugin owns**.
- Use a shared token layer and reusable components for React, Gutenberg, and PHP-rendered plugin screens, adapting implementation to each environment.
- Respect WordPress capabilities, nonces, REST/API permissions, escaping, and server-side validation. Hiding an action in the UI is **not** authorisation.
- Load plugin assets only on the admin screens that need them. Keep dependencies and initial bundle size proportionate.
- Ensure Gutenberg integrations respect editor behaviour and do not override unrelated blocks or controls.
- Match the product's branding without breaking native admin expectations or accessibility.

## 11. Front-end booking widget

The booking widget (`src/frontend`) is embedded in pages of someone else's theme. It is not a wp-admin dashboard, but sections 4–9 apply to it too, with these differences.

- **Isolation first.** Everything, including the CSS reset and design tokens, is scoped under `.dmn-widget-root` (see `src/frontend/styles/index.scss`). Never add styles or custom properties on `:root`, `body`, or bare element selectors: the widget must not change the host theme, and the host theme should affect the widget as little as possible.
- **Own tokens.** The widget has its own token set, separate from the admin's. The base font size is 16 px and the font is inherited from the host theme; spacing, radius, and transition values match the admin (15 px base, 15 px radius). It uses the same colour palette as the admin (section 4), defined again inside `.dmn-widget-root`. Only use tokens that are defined inside `.dmn-widget-root`; admin tokens (such as `--box-shadow-1`) are not loaded on the front end. The widget defines `--box-shadow-3` for overlays such as toasts. Toasts live in one area per page, shared by every widget, at the end of `<body>` in a second `.dmn-widget-root--toasts` that copies the widget root's mode and theme colour, so a host theme's transforms can't trap them and they keep the widget's tokens. Their classes are prefixed (`dmn-toast`) because they sit directly in the host page.
- **Visual style.** The widget uses the same palette as the admin, including the theme colour, with its own light/dark mode setting: `--c-surface` cards on a `--c-background` panel, `--c-text` text, and `--c-primary` for primary actions and selection. Keep colours in tokens so a site can still re-theme it by overriding them on `.dmn-widget-root`. The palette rules use `:where()` so they have no specificity, and a site's override wins in every mode wherever its stylesheet loads; keep it that way. An Appearance setting, **Load the booking widget styles** (`Appearance::get_widget_styles()`, the `dmn_widget_styles` option), turns the widget stylesheet off so a site can style the widget from its theme; the markup and class names are unchanged, and the MUI calendar keeps its own built-in styles. The old token names still work: `--c-purple` in both modes, and `--c-white`, `--c-off-white`, `--c-lilac-grey`, `--c-near-black`, `--c-green`, and `--c-red` in light mode only. The MUI date calendar reads the same variables through its theme (`calendarTheme` in `src/frontend/app/utils/helpers.tsx`).
- **Step flow.** The booking flow is a linear sequence of steps, all shown on one page and defined in `src/frontend/app/utils/steps.ts`: Venue → Group size → Date → Experience → Time → Details, with the Review summary alongside. Add-ons are chosen on DesignMyNight's checkout. Each step must:
  - show where the user is in the flow (progress bar and step headings),
  - allow going back without losing entered data,
  - validate only the current step, inline, before moving on,
  - move focus to the next step's heading when a choice completes a step (`goToStep` in `src/frontend/app/utils/scroll.ts`), except while the customer is changing options with the arrow keys, which would pull them out of a radio group. Announce step changes and errors to assistive technologies, and when the customer continues with invalid details, move focus to the first invalid field.
- **Live data.** Venues, booking types, and availability come from the DMN API. Every step that depends on them needs loading, empty (for example, “no availability on this date”), and error states with a way to retry or pick something else.
- **Submission.** Prevent double submission, keep the user's details if a booking or enquiry fails, and show a clear confirmation or next step (including the external-booking hand-off) on success.
- **Performance.** Enqueue widget assets only on pages that render the `dmn_booking` shortcode, as the plugin does now.

## 12. DesignMyNight API integration

Every integration with DesignMyNight must follow the official **DMN developer documentation** at <https://developers.designmynight.com/>. Treat it as the source of truth for endpoints, request and response shapes, field names, parameters, and behaviour. The pages this plugin relies on most:

- [API Basics](https://developers.designmynight.com/api/api-basics/): authentication, base URL, rate limits, and the response envelope.
- [Venues API](https://developers.designmynight.com/api/venues-api/): venues, booking types, booking rules, and `booking-availability`.
- [Booking API](https://developers.designmynight.com/api/booking-api/): the availability check and creating bookings and enquiries.
- [Testing](https://developers.designmynight.com/testing/testing/) and [API FAQs](https://developers.designmynight.com/api/api-faqs/).

Rules:

- **Read the docs before you write or change an integration.** Check the relevant page for every new endpoint, parameter, or field. Do not guess endpoints, invent fields, or rely on memory of the API; if the docs and the live API disagree, follow the live API, note the difference in a code comment, and tell the user.
- **Use documented endpoints and flows only.** Follow the documented booking flow (booking rules and availability, then the booking or enquiry, or DMN's own hand-off) rather than workarounds. Don't call undocumented or internal endpoints.
- **All DMN calls go through the server.** Requests are made in PHP through `DmnClient` (`src/php/Services/DmnClient.php`) and exposed to the admin app and widget through the plugin's REST controllers. Never call the DMN API from the browser or expose the App ID or API key to the front end.
- **Authentication and base URL.** Send `Authorization: APP_ID:API_KEY` over HTTPS to the v4 base URL (`https://api.designmynight.com/v4`, or the QA URL when the environment setting is `qa`). Keep the base URL in one place rather than hard-coding it in new code.
- **Respect rate limits.** Limits are per App ID per hour (`X-RateLimit-*` headers, `429 Too Many Requests`). Cache GET responses where it is safe, avoid redundant calls, and use documented options such as `fields` on `booking-availability` to keep requests light.
- **Handle the documented response envelope and errors.** Read data from `payload`, check `status`, and turn documented error codes (400, 401, 403, 404, 429, 503) into specific, user-facing messages and recovery paths (see sections 6 and 9).
- **Validate against the docs server-side.** Use the documented rules (for example `min_people`, `max_people`, and booking hours from booking rules) to validate input in PHP, not only in the UI.
- **Test against QA.** Use DMN's test/QA environment for development and testing, not live venues.
- **Link the docs.** When adding or changing an integration, reference the relevant documentation page in the code comment or PR description.

## 13. Implementation approach for Claude Code

When designing or implementing a new dashboard screen or widget step:

1. Identify the screen's target users, top tasks, available data, and operational constraints. If the work touches DesignMyNight data, check the relevant DMN documentation page first (section 12).
2. Propose the information hierarchy and interactions before selecting decorative styles.
3. Reuse existing design tokens and components; add new ones only when necessary.
4. Build semantic, responsive layouts and implement real loading, empty, error, and success states.
5. Implement keyboard, focus, contrast, form validation, and reduced-motion requirements as part of the feature.
6. Check that actions, filters, charts, and links are connected to actual behaviour or explicitly presented as mock data in a prototype.
7. Validate the result at desktop, tablet, mobile, and 200% browser zoom, including long content and failure scenarios.
8. Check for WordPress (admin) or host-theme (widget) CSS collisions, and that plugin functionality and admin navigation remain intact.
9. Run `npm run lint` and `npm run build` (which includes the typecheck) before finishing.
10. Before opening a pull request, run a code review of the branch's changes (`/code-review`) and fix every issue it finds. Re-run the review, lint, and build after the fixes, and only open the PR once the review comes back clean.

### Acceptance checklist

- [ ] The page title and primary task are immediately identifiable.
- [ ] Information is ordered by user relevance, not by visual symmetry alone.
- [ ] Labels, metrics, units, dates, and comparison periods are unambiguous.
- [ ] Spacing, typography, colour, and component states use shared tokens.
- [ ] Navigation and primary/secondary actions are consistent and discoverable.
- [ ] All displayed interactive controls have meaningful working behaviour.
- [ ] Loading, empty, no-results, error, and success states are accounted for.
- [ ] Keyboard use, visible focus, contrast, names, labels, and error announcements have been checked.
- [ ] Layout works across relevant screen sizes and content lengths.
- [ ] WordPress admin styles and behaviour outside the plugin are unaffected.
- [ ] Widget styles stay inside `.dmn-widget-root` and only use tokens defined there.
- [ ] Performance, permissions, and server-side validation have been addressed.
- [ ] DesignMyNight API calls follow the official DMN developer documentation (section 12) and run server-side only.
- [ ] A code review has been run on the changes and every issue it found has been fixed before the PR was opened.

## Core principle

**Clarity over decoration; consistency over novelty; actionable information over vanity metrics; recognition over recall; feedback over uncertainty; and accessibility by default.**
