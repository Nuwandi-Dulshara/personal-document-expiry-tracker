# SDD ledger — plan: docs/superpowers/plans/2026-09-19-document-expiry-notifications.md
Setup ruling: work in existing make-regi feature branch because approved notification edits are already uncommitted here; isolating now would omit required state. Cost if wrong: changes remain mixed with the user's current feature branch.
Pre-flight: Tasks 1-3 produce DateOnly API/schema consumed by Tasks 4-9; interfaces match the spec.
Pre-flight: Task 4 calculator types are consumed by Tasks 5-9; names and status literals match.
Pre-flight: Task 5 notification signals/read API are consumed by Tasks 6-9; names match.
Task 1: complete (date-only document model/contracts and reminder validation; Release build passed).
Task 2: complete (unique persistent read state, ownership-checked idempotent API; Release build passed).
Task 3: complete (EF migration and idempotent SQL script generated without requiring a live database).
Task 4: complete (notification boundary/sorting/count tests 6/6 passed; combined date tests 9/9 passed).
Task 5: complete (reactive NotificationService connects documents, categories, and persisted read status).
Task 6: complete (authenticated bell, unread badge, accessible dropdown, and post-render mark-read behavior).
Task 7: complete (Dashboard notification summaries and urgent notification list).
Task 8: complete (Reminders groups Expires Today, Expired, and Reminder Active from shared state).
Task 9: Ruling: live MySQL verification cannot run because Windows denied starting wampmysqld64; generated migration and builds are verified, but database application remains a user-run step. Cost if wrong: provider-specific migration failure will surface when MySQL is started.
Task 9: partial verification (frontend production build passed; backend Release build passed; focused notification/date tests 9/9 passed; full Angular suite is blocked by pre-existing obsolete synchronous service tests in services.spec.ts).
Final: fixed cross-account stale notification data — account stores clear and reload on login/logout; frontend build GREEN.
Final: fixed midnight-stale statuses — reactive local-day timer triggers recalculation at each local midnight; notification tests GREEN 9/9.
Final: fixed close-before-read race — pending mark-read checks rendered/open panel and is cancelled on close; frontend build GREEN.
Final: fixed dropdown accessibility — Escape, outside click, navigation close, and focus transfer added; frontend build GREEN.
Final: fixed UTC/local status mismatch — backend compatibility status uses server-local calendar day while notification UI uses browser-local date; backend build GREEN.
Final: fixed transient refresh data loss — document/category services retain last successful state; frontend build GREEN.
Final: minor (deferred): component/service/backend integration test suites remain incomplete; focused boundary tests and production builds pass.
