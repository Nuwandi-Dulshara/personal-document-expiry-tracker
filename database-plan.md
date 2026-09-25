# Personal Document Expiry Tracker — Database Plan

## Goal

Design the MySQL database for the Personal Document Expiry Tracker and manage it through Entity Framework Core migrations.

Use:

```text
MySQL Community Server
MySQL Workbench
Entity Framework Core
ASP.NET Core
C#
```

---

## 1. Database Name

Create:

```text
document_expiry_tracker
```

Local setup:

```text
Server: localhost
Port: 3306
Database: document_expiry_tracker
```

---

## 2. Version 1 Tables

Start with:

```text
users
document_categories
documents
```

Add later:

```text
reminders
user_settings
document_renewals
```

---

## 3. Users Table

Table:

```text
users
```

Fields:

| Field | Purpose |
|---|---|
| id | Primary key |
| full_name | User's full name |
| email | Login email |
| password_hash | Secure password hash |
| phone | Optional phone |
| created_at | Created timestamp |
| updated_at | Updated timestamp |

Rules:

```text
id → primary key
email → unique
email → required
password_hash → required
full_name → required
```

Never store plain-text passwords.

---

## 4. Document Categories Table

Table:

```text
document_categories
```

Fields:

| Field | Purpose |
|---|---|
| id | Primary key |
| name | Category name |
| description | Optional description |
| created_at | Created timestamp |

Seed:

```text
Passport
Driving Licence
Insurance
Certificate
Vehicle Document
Professional Licence
Warranty
Membership
Other
```

Category name should be unique.

---

## 5. Documents Table

Table:

```text
documents
```

Fields:

| Field | Purpose |
|---|---|
| id | Primary key |
| user_id | Owner |
| category_id | Category |
| document_name | Display name |
| document_number | Optional number |
| issued_by | Optional issuer |
| issue_date | Optional issue date |
| expiry_date | Required expiry date |
| reminder_date | Optional reminder |
| description | Optional notes |
| file_path | Optional file reference |
| created_at | Created timestamp |
| updated_at | Updated timestamp |

Required:

```text
user_id
category_id
document_name
expiry_date
```

---

## 6. Relationships

User to Documents:

```text
users
  1
  │
  └────── many documents
```

Category to Documents:

```text
document_categories
  1
  │
  └────── many documents
```

Foreign keys:

```text
documents.user_id
→ users.id
```

```text
documents.category_id
→ document_categories.id
```

---

## 7. Do Not Store Status

Do not create a permanent:

```text
status
```

column in Version 1.

Calculate:

```text
Active
Expiring Soon
Expired
```

from:

```text
expiry_date
```

---

## 8. Do Not Store Days Remaining

Do not store:

```text
days_remaining
```

Calculate it dynamically from the current date and `expiry_date`.

---

## 9. Reminder Table

Add later:

```text
reminders
```

Fields:

| Field | Purpose |
|---|---|
| id | Primary key |
| document_id | Related document |
| reminder_date | Reminder date |
| is_completed | Completion state |
| created_at | Created timestamp |

Relationship:

```text
documents
  1
  │
  └────── many reminders
```

---

## 10. User Settings Table

Add later:

```text
user_settings
```

Fields:

| Field | Purpose |
|---|---|
| id | Primary key |
| user_id | Related user |
| expiry_warning_days | Expiring-soon threshold |
| default_reminder_days | Default reminder period |
| enable_reminders | Reminder preference |

Default:

```text
expiry_warning_days = 30
```

Relationship:

```text
users
  1
  │
  └────── 1 user_settings
```

---

## 11. Document Renewal Table

Future table:

```text
document_renewals
```

Fields:

| Field | Purpose |
|---|---|
| id | Primary key |
| document_id | Related document |
| old_expiry_date | Previous expiry |
| renewal_date | Renewal date |
| new_issue_date | New issue date |
| new_expiry_date | New expiry date |
| created_at | Created timestamp |

Relationship:

```text
documents
  1
  │
  └────── many document_renewals
```

---

## 12. Recommended Indexes

Use indexes for:

```text
users.email
documents.user_id
documents.category_id
documents.expiry_date
documents.document_name
```

These help:

- Login lookup
- User-specific queries
- Category filters
- Expiry sorting
- Search

---

## 13. Unique Constraints

Required:

```text
users.email
```

Recommended:

```text
document_categories.name
```

Do not make `document_number` globally unique unless the business rules later require it.

---

## 14. Date Rules

Rules:

```text
expiry_date is required
```

If `issue_date` exists:

```text
expiry_date >= issue_date
```

If `reminder_date` exists:

```text
reminder_date <= expiry_date
```

---

## 15. Nullability

Required:

```text
users.full_name
users.email
users.password_hash

document_categories.name

documents.user_id
documents.category_id
documents.document_name
documents.expiry_date
```

Optional:

```text
users.phone
document_categories.description
documents.document_number
documents.issued_by
documents.issue_date
documents.reminder_date
documents.description
documents.file_path
```

---

## 16. Timestamps

Use:

```text
created_at
updated_at
```

for major tables.

Prefer storing server-generated timestamps consistently, ideally in UTC.

---

## 17. Entity Framework Core Migrations

Use migrations for schema changes.

Initial flow:

```text
Create models
→ Configure DbContext
→ Create InitialCreate migration
→ Apply migration
→ Verify tables in MySQL Workbench
```

Future example:

```text
Add Reminder model
→ Create AddReminders migration
→ Apply migration
```

Avoid changing production tables manually without matching EF Core migrations.

---

## 18. Seed Data

Seed stable reference data only:

```text
Passport
Driving Licence
Insurance
Certificate
Vehicle Document
Professional Licence
Warranty
Membership
Other
```

Do not seed real users or personal documents into production.

---

## 19. Database Development Order

```text
1. Install MySQL Community Server
2. Install MySQL Workbench
3. Create document_expiry_tracker
4. Configure backend connection string
5. Add EF Core MySQL provider
6. Create User entity
7. Create DocumentCategory entity
8. Create Document entity
9. Create ApplicationDbContext
10. Configure relationships
11. Create InitialCreate migration
12. Apply migration
13. Verify tables
14. Seed categories
15. Test document insert from API
16. Test document retrieval
17. Test update
18. Test delete
19. Verify foreign keys
20. Add indexes if needed
21. Add Reminder table later
22. Add UserSettings table later
23. Add DocumentRenewal table later
```

---

## 20. Test Checklist

Verify:

```text
User can be created
Duplicate email is rejected
Categories are seeded
Document requires valid user
Document requires valid category
Document can be inserted
Document can be updated
Document can be deleted
Documents can be queried by user
Documents can be sorted by expiry date
Status can be derived from expiry_date
No plain-text password exists
No stored status column is required
No stored days_remaining column is required
```

---

## 21. Version 1 Definition of Done

Version 1 database is complete when:

- MySQL database exists.
- ASP.NET Core connects successfully.
- EF Core migrations run.
- `users` exists.
- `document_categories` exists.
- `documents` exists.
- Foreign keys work.
- Categories are seeded.
- Email uniqueness works.
- Documents can be created through the API.
- Documents can be retrieved, updated, and deleted.
- Passwords are stored only as hashes.

---

## Final Database Structure

```text
users
  │
  ├────────< documents >──────── document_categories
  │               │
  │               ├────────< reminders
  │               │
  │               └────────< document_renewals
  │
  └──────── user_settings
```

For Version 1, only use:

```text
users
document_categories
documents
```
