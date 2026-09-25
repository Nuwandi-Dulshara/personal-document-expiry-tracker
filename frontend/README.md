# Frontend

The Angular application is in `document-expiry-tracker-ui`.

```powershell
cd frontend/document-expiry-tracker-ui
npm.cmd ci
npm.cmd start
```

Open http://localhost:4200 and choose **Explore demo**, or use the validated mock login/register forms. In a non-PowerShell terminal, `npm` works in place of `npm.cmd`.

Requires Node.js 22.12+ (tested with 22.16.0) and npm. The committed `.npmrc` avoids an npm 11 optional-peer resolver crash encountered during setup; dependency versions are recorded in `package-lock.json`.

## Included

- Angular 21 standalone components, lazy routes, Reactive Forms and configured HttpClient.
- Angular Material confirmation dialogs and notifications; CDK mobile focus management.
- Yellow/grey/brown theme, locally bundled Inter font, responsive sidebar/header.
- Login, register, dashboard, document list/add/view/edit/delete, categories, reminders, profile, settings and 404.
- Document search by name/number/issuer; status/category/expiry filters and pagination.
- Calendar-day statuses and dashboard counts derived from documents and warning settings.
- Browser-local mock persistence, form validation, saving states, empty states and friendly storage errors.
- Attachment selection/validation stores the filename only. File contents are not uploaded or retained.

## Demo behavior

Login accepts any valid email and a password of at least eight characters. Registration saves a demo profile. No credentials are checked or stored; password recovery/change actions explain the future integration. Authentication is a session-storage flag. All demo users in the same browser share one local collection.

Sample expiry dates are relative to the first launch. Local storage preserves changes; clear the `document-tracker-demo-v1` key to reseed. Logout clears only the mock session.

Expiry day is included in **Expiring Soon**. Yesterday is **Expired**. Warning thresholds are inclusive. Reminder dates default from settings for new documents. Today includes overdue, undismissed reminders so they remain visible. Turning reminders off pauses their active schedule indication while preserving dates; this frontend does not send notifications.

Deleting a category containing documents is blocked; rename preserves document associations. Failed storage writes leave in-memory data unchanged and show a recoverable error.

## Checks

Run from `document-expiry-tracker-ui`:

```powershell
npm.cmd run build
npm.cmd test -- --watch=false
npm.cmd run test:e2e
```

Browser tests use installed Microsoft Edge (`channel: msedge`) and start a dev server on port 4200. Change the channel in `playwright.config.ts` if using another installed browser. They cover authentication, document CRUD, validation, attachment reselection, filtering, pagination, deletion cancellation, categories, settings, profile, reminders, navigation and all planned routes at 1920/1440/1024/768/480/375px. Screenshots are written to ignored `test-results/`.

## Structure and future integration

`src/app/core/services` contains domain services plus the mock store. Components call domain services; `shared/models` contains the API-facing shapes. `features` holds route components, `core/layout` the app shell, and `shared/components` reusable UI.

Replace service internals with HttpClient requests when the ASP.NET API contract exists. Real authentication, access control, file storage and delivered notifications remain backend integration work. No backend dependency is needed. Production builds are in `dist/document-expiry-tracker-ui/browser`; a static host must fall back to `index.html` for application routes.
