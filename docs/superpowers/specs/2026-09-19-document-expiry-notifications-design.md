# Document Expiry Notifications Design

## Purpose

The Personal Document Expiry Tracker will present one current notification per applicable document. Notification status, message, priority, and day count will be derived from the document's reminder and expiry dates whenever the application loads or the document changes. The same notification data will drive the authenticated header, Dashboard, and Reminders page.

## Status Rules

All comparisons use local calendar dates in `YYYY-MM-DD` form and ignore time-of-day values.

| Condition | Status | Priority | Example |
| --- | --- | --- | --- |
| Today is before the reminder date | None | None | No notification |
| Today is on or after the reminder date and before expiry | `ReminderActive` | Medium | “Passport expires in 10 days. Please prepare for renewal.” |
| Today equals expiry | `ExpiresToday` | High | “Driving Licence expires today. Please renew it.” |
| Today is after expiry | `Expired` | Critical | “Insurance document expired 3 days ago. Please renew or update the document.” |

A missing reminder date suppresses only the pre-expiry `ReminderActive` state. `ExpiresToday` and `Expired` are derived from the required expiry date and still appear.

Remaining and overdue values are calendar-day differences. The reminder day and expiry day are inclusive boundaries. Updating a document's reminder or expiry date immediately recalculates its notification.

## Architecture

Document fields remain the source of truth. The system will not persist calculated messages, remaining days, or current status because those values change with the date and could become stale.

The Angular application will contain a pure date-only notification calculator and a notification service. The service will combine existing document and category data with persisted read state, expose the full notification list, unread count, priority ordering, and grouped counts, and refresh reactively when document data changes.

The .NET API will manage read state through an authenticated notification-state endpoint. MySQL will store a single `DocumentNotification` row per document with:

- `Id`
- `DocumentId`, with a unique index and cascade deletion
- nullable `LastReadStatus`
- `UpdatedAt`

The unique document constraint prevents duplicate notification records. Rows store state only; notification eligibility remains derived from document dates.

## Read and Unread Behavior

A notification is unread when its current calculated status differs from `LastReadStatus`, or when no read-state row exists. Opening the notification dropdown marks all currently displayed statuses as read in one authenticated request.

Changing the remaining-day value does not make a notification unread again. A notification becomes unread when it transitions from `ReminderActive` to `ExpiresToday`, or from `ExpiresToday` to `Expired`. Renewal recalculates status from the new dates; if the new dates place the document before its reminder date, the notification disappears.

Notifications remain visible in the dropdown and pages after being read. Reading changes only the bell count and visual unread treatment.

## API Design

The notification-state API will be scoped to the authenticated user through each notification's document ownership.

- `GET /api/notifications/state` returns document IDs and their last-read statuses.
- `PUT /api/notifications/read` accepts the currently displayed document ID and status pairs and upserts one state row per owned document.

The API rejects unknown statuses with `400 Bad Request`. If any requested document is missing or not owned by the authenticated user, the entire batch returns `404 Not Found` without changing read state. Updates use the unique `DocumentId` constraint to remain idempotent.

Existing document APIs continue to supply document, reminder-date, expiry-date, and category data. Creating or updating a document does not create daily notification rows. Deleting a document removes its read state through cascade deletion.

## Header Notification Panel

The authenticated header bell displays the number of unread applicable notifications. Zero has no badge; values greater than 99 display as `99+`. The accessible label includes the unread count.

Clicking the bell opens a keyboard-accessible dropdown containing each applicable notification with:

- document name
- category
- expiry date
- status and priority indicator
- generated message
- remaining or overdue day count
- a `View Document` link

Opening the panel marks its currently displayed statuses as read. The panel closes on outside click, Escape, navigation, or a second bell click.

Notifications are ordered by priority: `ExpiresToday`, `Expired`, then `ReminderActive`. Within a priority, the closest relevant expiry comes first.

## Dashboard

The Dashboard will expose notification-specific summaries:

- **Expiring Soon:** count of `ReminderActive` notifications
- **Expiring Today:** count of `ExpiresToday` notifications
- **Expired:** count of `Expired` notifications

It will also show the most urgent applicable notifications using the shared calculated list and link each entry to its document. Existing general document totals may remain where they add distinct value, but notification summary labels and counts must use notification status rules rather than the configurable document warning period.

## Reminders Page

The Reminders page will display all applicable notifications grouped in this order:

1. `Expires Today`
2. `Expired`
3. `Reminder Active`

Each row uses the same message, dates, day count, priority indicator, and document link as the header panel. The page no longer categorizes future reminder dates as active notifications. Empty states explain when no notification currently applies.

## Visual and Accessibility Requirements

Medium, high, and critical priorities use distinct color, icon, text label, and accessible name so meaning never depends on color alone. The bell is a button with expanded-state semantics and an associated panel. Focus order, Escape handling, and document links must work by keyboard.

The implementation will reuse the current application styles and shared icon system.

## Loading and Error Handling

Notification calculation runs after authenticated document, category, and read-state data load. It also reruns reactively after document renewal, editing, deletion, login, refresh, and route navigation to the Dashboard or Reminders page.

If read-state loading fails, applicable notifications remain visible and are treated as unread for that session. If marking notifications read fails, the unread count remains unchanged and the existing feedback pattern reports the error. Previously loaded document data is retained when a refresh request fails.

## Testing

Backend tests will verify:

- one read-state row per document
- idempotent mark-read updates
- authenticated ownership enforcement
- invalid status rejection
- cascade deletion

Frontend unit tests will verify:

- no notification before reminder date
- inclusive reminder date
- active dates between reminder and expiry
- inclusive expiry-day transition
- expired day counts
- missing reminder-date behavior
- local date normalization without UTC day shifts
- priority ordering and grouping
- unread state changes only when status changes
- renewal and deletion recalculation
- Dashboard summary counts

Component or end-to-end tests will verify the bell badge, dropdown contents, mark-read behavior, document navigation, Dashboard notification summaries, and Reminders page groups.

## Migration and Compatibility

An EF Core migration will create `DocumentNotifications`, its unique `DocumentId` index, and its cascade foreign key. Existing documents need no notification backfill because read-state rows are created only when notifications are marked read. The existing `Reminders` table and endpoints remain for database compatibility during this change, but the Angular notification UI will stop reading them. The new notification calculation uses `Document.ReminderDate` and `Document.ExpiryDate` as its authoritative inputs.
