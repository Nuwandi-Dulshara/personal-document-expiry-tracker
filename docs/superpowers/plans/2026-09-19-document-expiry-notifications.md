# Document Expiry Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a date-driven document notification system with persistent read state, a header dropdown, Dashboard summaries, and grouped Reminders-page notifications.

**Architecture:** `Document.ReminderDate` and `Document.ExpiryDate` remain authoritative date-only values. Angular derives the current notification from those dates and combines it with one persisted `DocumentNotification.LastReadStatus` value per document; the API stores only read state and never stores changing messages or day counts.

**Tech Stack:** Angular 21 signals and reactive templates, Vitest, Playwright, ASP.NET Core 10 controllers, EF Core/Pomelo MySQL, MySQL `DATE` columns, xUnit with EF Core InMemory for API service tests.

**Spec:** `docs/superpowers/specs/2026-09-19-document-expiry-notifications-design.md`

## Global Constraints

- Status precedence is `ExpiresToday`, then `Expired`, then `ReminderActive`, then no notification.
- `Document.ReminderDate` must be absent or less than or equal to `Document.ExpiryDate`.
- Date values are ISO `YYYY-MM-DD` calendar dates; notification code must not convert them through UTC timestamps.
- A unique `DocumentNotification` row per document stores only `LastReadStatus` and `UpdatedAt`.
- Opening and successfully rendering the bell panel marks the rendered statuses read; changing day counts alone never makes them unread again.
- Expired notifications sort by most recently expired first; other groups sort by closest expiry, then document name, then document ID.
- The legacy `Reminders` table and endpoints remain for compatibility but are no longer consumed by the notification UI.

## Review Focus

- A reminder date equal to expiry must yield `ExpiresToday`, never `ReminderActive`; Task 3 pins this precedence.
- A browser in a timezone behind or ahead of UTC must retain the displayed calendar date; Tasks 1 and 3 test date-only serialization and local comparison.
- A mark-read batch containing one foreign or missing document must make no changes; Task 2 tests atomic ownership rejection.
- Renewing an expired document into the future must remove or downgrade the old notification immediately; Tasks 3 and 4 test reactive recalculation.
- Rapid repeated panel opens must not create duplicate state rows or stale unread counts; Tasks 2, 4, and 5 test idempotency and in-flight guarding.

---

## File Structure

### Backend

- `Models/DocumentNotification.cs`: persistent per-document read state.
- `Models/Document.cs`: `DateOnly` expiry/reminder fields and notification navigation.
- `DTOs/Contracts.cs`: notification-state contracts and date-only document contracts.
- `Interfaces/Services.cs`: notification-state service interface.
- `Services/NotificationStateService.cs`: ownership-checked state load and atomic mark-read upsert.
- `Controllers/NotificationsController.cs`: authenticated state endpoints.
- `Data/ApplicationDbContext.cs`: notification mapping, unique index, cascade relationship.
- `Migrations/20260919093000_AddDocumentNotifications.cs`: notification table and document `DATE` conversion.
- `DocumentExpiryTracker.API.Tests/*`: service, validation, serialization, and ownership tests.

### Frontend

- `shared/models/notification.ts`: notification status, priority, calculated notification, and read-state types.
- `shared/utils/document-notification.ts`: pure date-only calculation, message generation, sorting, and grouping.
- `shared/utils/document-notification.spec.ts`: all calendar boundaries and ordering.
- `core/services/notification.service.ts`: computed notification state and read-state API integration.
- `core/services/notification.service.spec.ts`: unread and reactive state behavior.
- `core/layout/layout.ts` and `layout.html`: bell state, open/close behavior, and panel placement.
- `shared/components/notification-panel.ts`: accessible notification dropdown rendering.
- `features/dashboard/dashboard.ts` and `dashboard.html`: notification summaries and urgent list.
- `features/reminders/reminders.ts`: grouped notification page replacing legacy reminder consumption.
- `styles.scss`: notification priority, badge, dropdown, summary, and responsive styles.
- `e2e/frontend.spec.ts`: authenticated bell, Dashboard, Reminders, renewal, and read-state flow.

---

### Task 1: Enforce date-only document contracts and validation

**Files:**
- Create: `backend/DocumentExpiryTracker.API.Tests/DocumentExpiryTracker.API.Tests.csproj`
- Create: `backend/DocumentExpiryTracker.API.Tests/TestServices.cs`
- Create: `backend/DocumentExpiryTracker.API.Tests/DocumentServiceTests.cs`
- Modify: `backend/DocumentExpiryTracker.API/Models/Document.cs`
- Modify: `backend/DocumentExpiryTracker.API/DTOs/Contracts.cs`
- Modify: `backend/DocumentExpiryTracker.API/Interfaces/Services.cs`
- Modify: `backend/DocumentExpiryTracker.API/Services/ApplicationServices.cs`

**Interfaces:**
- Produces: `Document.ExpiryDate: DateOnly`, `Document.ReminderDate: DateOnly?`, and document DTO fields with the same types.
- Produces: document create/update rejection message `Reminder date cannot be after expiry date.`

- [ ] **Step 1: Create the API test project and failing validation tests**

Create the test project with references to `Microsoft.NET.Test.Sdk`, `xunit`, `xunit.runner.visualstudio`, `Microsoft.EntityFrameworkCore.InMemory` version `9.0.0`, and a project reference to the API. Add `TestServices` helpers that create a uniquely named in-memory database, seed a user and category ID `1`, and return real `DocumentService` or `NotificationStateService` instances. Add tests that call `DocumentService.CreateAsync` and `UpdateAsync` with `ReminderDate` one day after `ExpiryDate`.

```csharp
[Fact]
public async Task Create_rejects_reminder_after_expiry()
{
    var service = TestServices.CreateDocumentService(out var db, out var userId);
    var result = await service.CreateAsync(userId,
        new CreateDocumentDto("Passport", 1, null, null, null,
            new DateOnly(2026, 10, 1), new DateOnly(2026, 10, 2), null));

    Assert.False(result.Success);
    Assert.Equal("Reminder date cannot be after expiry date.", result.Error);
    Assert.Empty(db.Documents);
}
```

- [ ] **Step 2: Run the validation tests and verify RED**

Run: `dotnet test backend/DocumentExpiryTracker.API.Tests/DocumentExpiryTracker.API.Tests.csproj --filter DocumentServiceTests`

Expected: FAIL because the contracts still use `DateTime` and date-only model behavior is absent.

- [ ] **Step 3: Convert document dates to `DateOnly` and retain validation**

Change `Document.IssueDate`, `ExpiryDate`, and `ReminderDate` plus matching DTO properties to `DateOnly?`, `DateOnly`, and `DateOnly?`. Change `IExpiryService.Calculate` to accept `DateOnly` and compare it with `DateOnly.FromDateTime(DateTime.UtcNow)` only for backend document-status compatibility. Keep document validation explicit:

```csharp
if (!expiryDate.HasValue) return "Expiry date is required.";
if (issueDate.HasValue && expiryDate.Value < issueDate.Value)
    return "Expiry date cannot be before issue date.";
if (reminderDate.HasValue && reminderDate.Value > expiryDate.Value)
    return "Reminder date cannot be after expiry date.";
```

- [ ] **Step 4: Add serialization and equal-date tests**

Assert that a DTO containing `new DateOnly(2026, 9, 19)` serializes as `"2026-09-19"`, and that create/update accepts `ReminderDate == ExpiryDate`.

- [ ] **Step 5: Run Task 1 tests and the API build**

Run: `dotnet test backend/DocumentExpiryTracker.API.Tests/DocumentExpiryTracker.API.Tests.csproj --filter "DocumentServiceTests|DateOnlyContractTests"`

Run: `dotnet build backend/DocumentExpiryTracker.API/DocumentExpiryTracker.API.csproj -c Release`

Expected: all selected tests pass; build reports zero errors.

- [ ] **Step 6: Commit Task 1**

```powershell
git add backend/DocumentExpiryTracker.API backend/DocumentExpiryTracker.API.Tests
git commit -m "feat: use date-only document expiry fields"
```

### Task 2: Add persistent notification read state and authenticated API

**Files:**
- Create: `backend/DocumentExpiryTracker.API/Models/DocumentNotification.cs`
- Create: `backend/DocumentExpiryTracker.API/Services/NotificationStateService.cs`
- Create: `backend/DocumentExpiryTracker.API/Controllers/NotificationsController.cs`
- Create: `backend/DocumentExpiryTracker.API.Tests/NotificationStateServiceTests.cs`
- Modify: `backend/DocumentExpiryTracker.API/Models/Document.cs`
- Modify: `backend/DocumentExpiryTracker.API/Data/ApplicationDbContext.cs`
- Modify: `backend/DocumentExpiryTracker.API/DTOs/Contracts.cs`
- Modify: `backend/DocumentExpiryTracker.API/Interfaces/Services.cs`
- Modify: `backend/DocumentExpiryTracker.API/Program.cs`

**Interfaces:**
- Produces: `NotificationStateDto(int DocumentId, string? LastReadStatus)`.
- Produces: `MarkNotificationReadDto(int DocumentId, string Status)` and `MarkNotificationsReadDto(IReadOnlyList<MarkNotificationReadDto> Notifications)`.
- Produces: `INotificationStateService.GetAsync(int userId)` and `MarkReadAsync(int userId, MarkNotificationsReadDto request)`.

- [ ] **Step 1: Write failing state-service tests**

Test initial empty state, idempotent repeated writes, one row per document, status replacement, invalid-status rejection, and an atomic batch containing a foreign document.

```csharp
[Fact]
public async Task MarkRead_updates_one_row_when_status_changes()
{
    var service = TestServices.CreateNotificationStateService(out var db, out var userId, documentCount: 1);
    var documentId = await db.Documents.Select(x => x.Id).SingleAsync();

    Assert.True((await service.MarkReadAsync(userId,
        new([new(documentId, "ReminderActive")]))).Success);
    Assert.True((await service.MarkReadAsync(userId,
        new([new(documentId, "ExpiresToday")]))).Success);

    var state = Assert.Single(db.DocumentNotifications);
    Assert.Equal("ExpiresToday", state.LastReadStatus);
}
```

- [ ] **Step 2: Run state tests and verify RED**

Run: `dotnet test backend/DocumentExpiryTracker.API.Tests/DocumentExpiryTracker.API.Tests.csproj --filter NotificationStateServiceTests`

Expected: FAIL because notification state types and service do not exist.

- [ ] **Step 3: Implement the entity and EF mapping**

```csharp
public class DocumentNotification
{
    public int Id { get; set; }
    public int DocumentId { get; set; }
    public string? LastReadStatus { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Document Document { get; set; } = null!;
}
```

Add `DbSet<DocumentNotification>`, a unique index on `DocumentId`, a maximum length of 32 for `LastReadStatus`, and cascade deletion from `Document`.

- [ ] **Step 4: Implement atomic load and upsert behavior**

Accept only `ReminderActive`, `ExpiresToday`, and `Expired`. Load every requested owned document ID before mutation; return `(false, "Notification document not found.")` if the owned count differs from distinct requested IDs. Upsert by `DocumentId`, set `UpdatedAt = DateTime.UtcNow`, then save once.

- [ ] **Step 5: Add the authenticated controller and registration**

```csharp
[Route("api/notifications")]
public sealed class NotificationsController(INotificationStateService notifications) : ApiControllerBase
{
    [HttpGet("state")]
    public async Task<ActionResult<IReadOnlyList<NotificationStateDto>>> GetState() =>
        Ok(await notifications.GetAsync(CurrentUserId));

    [HttpPut("read")]
    public async Task<IActionResult> MarkRead(MarkNotificationsReadDto request)
    {
        var result = await notifications.MarkReadAsync(CurrentUserId, request);
        return result.Success ? NoContent() :
            result.Error == "Notification document not found."
                ? NotFound(new { message = result.Error })
                : BadRequest(new { message = result.Error });
    }
}
```

- [ ] **Step 6: Run Task 2 tests**

Run: `dotnet test backend/DocumentExpiryTracker.API.Tests/DocumentExpiryTracker.API.Tests.csproj --filter NotificationStateServiceTests`

Expected: all tests pass, including no partial update for a foreign-document batch.

- [ ] **Step 7: Commit Task 2**

```powershell
git add backend/DocumentExpiryTracker.API backend/DocumentExpiryTracker.API.Tests
git commit -m "feat: persist document notification read state"
```

### Task 3: Add the migration for notification state and date-only columns

**Files:**
- Create: `backend/DocumentExpiryTracker.API/Migrations/20260919093000_AddDocumentNotifications.cs`
- Modify: `backend/DocumentExpiryTracker.API/Migrations/ApplicationDbContextModelSnapshot.cs`
- Test: `backend/DocumentExpiryTracker.API.Tests/MigrationModelTests.cs`

**Interfaces:**
- Consumes: `DocumentNotification` mapping and `DateOnly` document properties from Tasks 1–2.
- Produces: MySQL schema with one notification state per document and `DATE` document columns.

- [ ] **Step 1: Write a failing EF model test**

Assert that the model has a unique index on `DocumentNotification.DocumentId`, a cascade foreign key, and column types `date` for `Document.ExpiryDate` and `Document.ReminderDate`.

- [ ] **Step 2: Run the model test and verify RED**

Run: `dotnet test backend/DocumentExpiryTracker.API.Tests/DocumentExpiryTracker.API.Tests.csproj --filter MigrationModelTests`

Expected: FAIL until the mappings and migration snapshot contain the required schema.

- [ ] **Step 3: Generate the migration**

With MySQL running on the configured connection, run from `backend/DocumentExpiryTracker.API`:

```powershell
dotnet ef migrations add AddDocumentNotifications
```

Inspect `Up` to confirm it alters `Documents.ExpiryDate` and `Documents.ReminderDate` to `date`, creates `DocumentNotifications`, creates a unique index on `DocumentId`, and adds an `ON DELETE CASCADE` foreign key. Confirm `Down` restores the two `datetime(6)` columns and drops only the new table.

- [ ] **Step 4: Run the model test and script the migration**

Run: `dotnet test backend/DocumentExpiryTracker.API.Tests/DocumentExpiryTracker.API.Tests.csproj --filter MigrationModelTests`

Run: `dotnet ef migrations script --idempotent --output notification-migration.sql`

Expected: test passes and SQL contains `CREATE TABLE DocumentNotifications`, a unique index, and document-column `DATE` alterations.

- [ ] **Step 5: Commit Task 3**

```powershell
git add backend/DocumentExpiryTracker.API/Migrations backend/DocumentExpiryTracker.API/notification-migration.sql
git commit -m "feat: add document notification schema"
```

### Task 4: Build the pure frontend notification calculator

**Files:**
- Create: `frontend/document-expiry-tracker-ui/src/app/shared/models/notification.ts`
- Create: `frontend/document-expiry-tracker-ui/src/app/shared/utils/document-notification.ts`
- Create: `frontend/document-expiry-tracker-ui/src/app/shared/utils/document-notification.spec.ts`
- Remove after replacement: `frontend/document-expiry-tracker-ui/src/app/shared/utils/reminder-date.ts`
- Remove after replacement: `frontend/document-expiry-tracker-ui/src/app/shared/utils/reminder-date.spec.ts`

**Interfaces:**
- Produces: `NotificationStatus = 'ReminderActive' | 'ExpiresToday' | 'Expired'`.
- Produces: `calculateDocumentNotification(document, category, today?): DocumentNotificationView | null`.
- Produces: `sortNotifications(items): DocumentNotificationView[]` and `notificationCounts(items)`.

- [ ] **Step 1: Write failing boundary and precedence tests**

Cover before reminder, reminder day, inside window, expiry day, after expiry, absent reminder, equal reminder/expiry, leap/month/year boundaries, and a local date near midnight.

```typescript
it('gives expiry-day status precedence over an equal reminder date', () => {
  const result = calculateDocumentNotification(
    document({ reminderDate: '2026-09-19', expiryDate: '2026-09-19' }),
    'Passport',
    new Date(2026, 8, 19, 23, 59),
  );
  expect(result?.status).toBe('ExpiresToday');
  expect(result?.message).toBe('Passport expires today. Please renew it.');
});
```

- [ ] **Step 2: Run the calculator tests and verify RED**

Run from the frontend directory:

`npx vitest run src/app/shared/utils/document-notification.spec.ts --environment jsdom`

Expected: FAIL because the calculator does not exist.

- [ ] **Step 3: Implement date-only calculation and messages**

Parse ISO values with `split('-').map(Number)` and compare `Date.UTC(year, month - 1, day)` integer day values. Build today's value from `getFullYear()`, `getMonth()`, and `getDate()` so the browser's local calendar day is retained. Never call `new Date(isoDate)` or `toISOString()` for notification status.

Return status, priority, signed day difference, absolute display days, message, category, and expiry date. Apply expiry-first precedence exactly as specified.

- [ ] **Step 4: Implement deterministic sorting and summaries**

Priority rank is `ExpiresToday = 0`, `Expired = 1`, `ReminderActive = 2`. Sort expired items by expiry descending; sort the other statuses by expiry ascending; then name ascending and numeric/string ID ascending. Return counts `{ reminderActive, expiresToday, expired, total }`.

- [ ] **Step 5: Run calculator tests and the frontend build**

Run: `npx vitest run src/app/shared/utils/document-notification.spec.ts --environment jsdom`

Run: `npm run build`

Expected: tests and build pass.

- [ ] **Step 6: Commit Task 4**

```powershell
git add frontend/document-expiry-tracker-ui/src/app/shared
git commit -m "feat: calculate document expiry notifications"
```

### Task 5: Connect calculated notifications to persistent read state

**Files:**
- Create: `frontend/document-expiry-tracker-ui/src/app/core/services/notification.service.ts`
- Create: `frontend/document-expiry-tracker-ui/src/app/core/services/notification.service.spec.ts`
- Modify: `frontend/document-expiry-tracker-ui/src/app/core/services/document.service.ts`
- Modify: `frontend/document-expiry-tracker-ui/src/app/core/services/category.service.ts`

**Interfaces:**
- Consumes: Task 4 calculator and Task 2 API contracts.
- Produces: signals `notifications`, `unreadNotifications`, `unreadCount`, and `counts`.
- Produces: `loadReadState(): Promise<void>` and `markRenderedRead(items): Promise<void>`.

- [ ] **Step 1: Write failing service tests**

Use Angular HTTP testing providers and service fakes/signals to verify initial state loading, current-status versus `LastReadStatus`, day-count changes remaining read, status transitions becoming unread, renewal recalculation, deletion removal, failed state load treating items as unread, and repeated concurrent `markRenderedRead` calls issuing one request.

- [ ] **Step 2: Run the focused service test and verify RED**

Run: `npm test -- --watch=false --include src/app/core/services/notification.service.spec.ts`

Expected: FAIL because `NotificationService` does not exist.

- [ ] **Step 3: Implement computed notification state**

Inject `DocumentService`, `CategoryService`, `HttpClient`, and `AuthService`. Compute notifications by mapping documents through Task 4, dropping null results, applying read state by document ID/status, and sorting. Derive unread count and group counts without copying arrays into mutable state.

- [ ] **Step 4: Implement read-state loading and mark-read**

Load `GET /api/notifications/state` after authenticated service construction. `markRenderedRead` sends only the rendered `documentId/status` pairs to `PUT /api/notifications/read`, guards an identical in-flight batch, and updates local read state only after a successful `204` response.

- [ ] **Step 5: Stop clearing valid document/category data on transient refresh errors**

Change load catch blocks to retain the last successful signal values. This satisfies the spec's fallback behavior while fresh sessions still begin empty.

- [ ] **Step 6: Run service tests and frontend build**

Run: `npm test -- --watch=false --include src/app/core/services/notification.service.spec.ts`

Run: `npm run build`

Expected: focused tests and build pass.

- [ ] **Step 7: Commit Task 5**

```powershell
git add frontend/document-expiry-tracker-ui/src/app/core/services
git commit -m "feat: connect notification read state"
```

### Task 6: Add the accessible header notification dropdown

**Files:**
- Create: `frontend/document-expiry-tracker-ui/src/app/shared/components/notification-panel.ts`
- Create: `frontend/document-expiry-tracker-ui/src/app/shared/components/notification-panel.spec.ts`
- Modify: `frontend/document-expiry-tracker-ui/src/app/core/layout/layout.ts`
- Modify: `frontend/document-expiry-tracker-ui/src/app/core/layout/layout.html`
- Modify: `frontend/document-expiry-tracker-ui/src/styles.scss`

**Interfaces:**
- Consumes: Task 5 `NotificationService` signals and `markRenderedRead`.
- Produces: bell button with `aria-expanded`, `aria-controls`, unread badge, and rendered panel.

- [ ] **Step 1: Write failing panel behavior tests**

Test zero-badge hiding, `99+`, rendered fields, exact status labels, view links, Escape close, second-click close, navigation close, outside-click close, and that mark-read runs only after a populated panel render.

- [ ] **Step 2: Run panel tests and verify RED**

Run: `npm test -- --watch=false --include src/app/shared/components/notification-panel.spec.ts`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the standalone panel**

Render document name, category, formatted expiry, status/priority label, message, day count, and `/documents/:id` link. Expose a close output and focus the first link when opened by keyboard. Show a clear empty state when no notifications apply.

- [ ] **Step 4: Integrate bell state and post-render read marking**

Replace the existing decorative badge with a button. Toggle `panelOpen`, render `<app-notification-panel>` conditionally, call `markRenderedRead(notificationService.notifications())` from an `afterNextRender` callback only after the opened panel exists, and report failures through `Feedback.error` without changing unread state.

- [ ] **Step 5: Add priority and responsive styles**

Add medium amber, high orange, and critical red treatments with visible text labels. Keep the panel within the viewport at desktop and mobile widths, cap its height with internal scrolling, and preserve focus outlines.

- [ ] **Step 6: Run panel tests and build**

Run: `npm test -- --watch=false --include src/app/shared/components/notification-panel.spec.ts`

Run: `npm run build`

Expected: tests and build pass without accessibility template errors.

- [ ] **Step 7: Commit Task 6**

```powershell
git add frontend/document-expiry-tracker-ui/src/app/core/layout frontend/document-expiry-tracker-ui/src/app/shared/components frontend/document-expiry-tracker-ui/src/styles.scss
git commit -m "feat: add notification bell dropdown"
```

### Task 7: Connect Dashboard notification summaries and urgent list

**Files:**
- Create: `frontend/document-expiry-tracker-ui/src/app/features/dashboard/dashboard.spec.ts`
- Modify: `frontend/document-expiry-tracker-ui/src/app/features/dashboard/dashboard.ts`
- Modify: `frontend/document-expiry-tracker-ui/src/app/features/dashboard/dashboard.html`
- Modify: `frontend/document-expiry-tracker-ui/src/app/core/services/dashboard.service.ts`
- Modify: `frontend/document-expiry-tracker-ui/src/styles.scss`

**Interfaces:**
- Consumes: Task 5 notification `counts` and sorted `notifications`.
- Produces: Dashboard summary cards for `Expiring Soon`, `Expiring Today`, and `Expired`, plus urgent notification rows.

- [ ] **Step 1: Write failing Dashboard tests**

Seed one item of each status and assert exact card totals, labels, priority indicators, messages, and view links. Include a document inside the configurable warning period but before its reminder date and assert it is absent from notification counts.

- [ ] **Step 2: Run Dashboard tests and verify RED**

Run: `npm test -- --watch=false --include src/app/features/dashboard/dashboard.spec.ts`

Expected: FAIL because Dashboard still uses generic expiry-warning summaries.

- [ ] **Step 3: Use notification summaries in DashboardService**

Inject `NotificationService`; expose its counts and `notifications().slice(0, 5)` as the urgent list. Retain total document count separately.

- [ ] **Step 4: Update Dashboard template and styles**

Render Total Documents plus the three required notification cards. Replace the generic attention banner/upcoming logic with notification-aware copy and the shared status/message/day presentation. Link each row to its document and the section footer to `/reminders`.

- [ ] **Step 5: Run Dashboard tests and build**

Run: `npm test -- --watch=false --include src/app/features/dashboard/dashboard.spec.ts`

Run: `npm run build`

Expected: tests and build pass.

- [ ] **Step 6: Commit Task 7**

```powershell
git add frontend/document-expiry-tracker-ui/src/app/features/dashboard frontend/document-expiry-tracker-ui/src/app/core/services/dashboard.service.ts frontend/document-expiry-tracker-ui/src/styles.scss
git commit -m "feat: show notification summaries on dashboard"
```

### Task 8: Replace the Reminders page with grouped calculated notifications

**Files:**
- Create: `frontend/document-expiry-tracker-ui/src/app/features/reminders/reminders.spec.ts`
- Modify: `frontend/document-expiry-tracker-ui/src/app/features/reminders/reminders.ts`
- Modify: `frontend/document-expiry-tracker-ui/src/styles.scss`
- Remove frontend usage: `frontend/document-expiry-tracker-ui/src/app/core/services/reminder.service.ts`

**Interfaces:**
- Consumes: Task 5 sorted calculated notification list.
- Produces: groups `Expires Today`, `Expired`, and `Reminder Active` in that order.

- [ ] **Step 1: Write failing Reminders-page tests**

Assert group order, counts, row metadata, messages, empty states, most-recently-expired order, and exclusion of documents before their reminder date. Assert a document without a reminder still appears in expiry-day and expired groups.

- [ ] **Step 2: Run Reminders tests and verify RED**

Run: `npm test -- --watch=false --include src/app/features/reminders/reminders.spec.ts`

Expected: FAIL because the page still consumes legacy reminder records and Today/Upcoming groups.

- [ ] **Step 3: Render shared calculated notification groups**

Inject `NotificationService`, define the three fixed group descriptors, filter by exact status, and render priority label, document/category, expiry date, message, day count, read indicator, and `View Document` link. Remove Dismiss/Restore actions because read state is controlled by the bell panel and notifications remain visible after reading.

- [ ] **Step 4: Remove legacy frontend reminder consumption**

Delete `ReminderService` only after `rg "ReminderService" frontend/document-expiry-tracker-ui/src` confirms the Reminders page and layout no longer reference it. Keep backend legacy endpoints and schema as specified.

- [ ] **Step 5: Run Reminders tests and build**

Run: `npm test -- --watch=false --include src/app/features/reminders/reminders.spec.ts`

Run: `npm run build`

Expected: tests and build pass.

- [ ] **Step 6: Commit Task 8**

```powershell
git add frontend/document-expiry-tracker-ui/src/app/features/reminders frontend/document-expiry-tracker-ui/src/app/core/services/reminder.service.ts frontend/document-expiry-tracker-ui/src/styles.scss
git commit -m "feat: group calculated expiry notifications"
```

### Task 9: Verify the complete authenticated notification flow

**Files:**
- Modify: `frontend/document-expiry-tracker-ui/e2e/frontend.spec.ts`
- Modify: `frontend/document-expiry-tracker-ui/src/app/core/services/notification.service.ts`
- Modify: `frontend/document-expiry-tracker-ui/src/app/shared/components/notification-panel.ts`
- Modify: `frontend/document-expiry-tracker-ui/src/app/features/dashboard/dashboard.html`
- Modify: `frontend/document-expiry-tracker-ui/src/app/features/reminders/reminders.ts`

**Interfaces:**
- Consumes: the complete backend API and Angular notification UI.
- Produces: end-to-end evidence for the specification.

- [ ] **Step 1: Add failing authenticated end-to-end scenarios**

Use API-seeded or UI-created documents for before-reminder, active, today, and expired dates. Assert the bell unread count, dropdown ordering/content, mark-read count clearing after render, Dashboard totals, Reminders groups, and view navigation. Renew the expired document to future reminder/expiry dates and assert its old expired notification disappears without duplication.

- [ ] **Step 2: Run the notification E2E test and verify RED**

Start MySQL and apply migrations, then run:

`npx playwright test e2e/frontend.spec.ts --grep "document expiry notifications"`

Expected: FAIL at the first unimplemented or incorrectly connected behavior.

- [ ] **Step 3: Complete the integration wiring exercised by the scenario**

Ensure `NotificationService` reloads read state after login, `notification-panel` calls `markRenderedRead` only after populated DOM render, Dashboard binds `notificationService.counts()`, and Reminders binds the shared sorted list. Re-run the focused E2E scenario after each wiring correction; do not add polling or persist calculated messages.

- [ ] **Step 4: Run complete verification**

Run:

```powershell
dotnet test backend/DocumentExpiryTracker.API.Tests/DocumentExpiryTracker.API.Tests.csproj
dotnet build backend/DocumentExpiryTracker.API/DocumentExpiryTracker.API.csproj -c Release
```

From `frontend/document-expiry-tracker-ui`, run:

```powershell
npm test -- --watch=false
npm run build
npx playwright test
```

Expected: zero failed tests, zero build errors, and no browser console errors.

- [ ] **Step 5: Verify schema and duplicate prevention against MySQL**

Run `dotnet ef database update`, open the dropdown twice, and query `DocumentNotifications` to confirm at most one row per document. Renew one document and confirm the row is reused with its new status after the next read action.

- [ ] **Step 6: Commit final integration coverage**

```powershell
git add frontend/document-expiry-tracker-ui/e2e frontend/document-expiry-tracker-ui/src backend/DocumentExpiryTracker.API backend/DocumentExpiryTracker.API.Tests
git commit -m "test: verify document expiry notification flow"
```
