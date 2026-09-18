# Personal Document Expiry Tracker — Backend Plan

## Goal

Build the backend for the Personal Document Expiry Tracker using:

- C#
- ASP.NET Core Web API
- Entity Framework Core
- MySQL
- JWT Authentication
- Swagger/OpenAPI

The Angular frontend will later connect to this backend through REST APIs.

---

## 1. Project Structure

```text
personal-document-expiry-tracker/
├── frontend/
├── backend/
└── database/
```

Create the .NET project inside:

```text
backend/
└── DocumentExpiryTracker.API/
```

Recommended structure:

```text
DocumentExpiryTracker.API/
├── Controllers/
├── Data/
├── Models/
├── DTOs/
├── Interfaces/
├── Services/
├── Helpers/
├── Middleware/
├── Migrations/
├── Uploads/
├── Program.cs
├── appsettings.json
└── appsettings.Development.json
```

---

## 2. Main Backend Modules

Start with:

```text
Authentication
Document Categories
Documents
Expiry Calculation
Dashboard
```

Add later:

```text
Profile
Settings
Reminders
File Uploads
Renewal History
```

---

## 3. Controllers

Planned controllers:

```text
AuthController
DocumentsController
CategoriesController
DashboardController
ProfileController
SettingsController
RemindersController
```

Controllers should:

- Receive HTTP requests
- Call services
- Return correct status codes
- Avoid containing major business logic

---

## 4. Services

Planned services:

```text
AuthService
DocumentService
CategoryService
ExpiryService
DashboardService
ProfileService
SettingsService
ReminderService
```

Matching interfaces:

```text
IAuthService
IDocumentService
ICategoryService
IExpiryService
IDashboardService
IProfileService
ISettingsService
IReminderService
```

---

## 5. Models

Version 1:

```text
User
DocumentCategory
Document
```

Later:

```text
Reminder
UserSetting
DocumentRenewal
```

---

## 6. DTOs

Authentication:

```text
RegisterDTO
LoginDTO
AuthResponseDTO
```

Documents:

```text
CreateDocumentDTO
UpdateDocumentDTO
DocumentResponseDTO
```

Other:

```text
CategoryResponseDTO
DashboardResponseDTO
ProfileResponseDTO
SettingsResponseDTO
```

---

## 7. Authentication

Endpoints:

```text
POST /api/auth/register
POST /api/auth/login
```

Registration flow:

```text
Receive details
→ Validate
→ Check duplicate email
→ Hash password
→ Save user
→ Return safe response
```

Login flow:

```text
Receive email + password
→ Find user
→ Verify password
→ Generate JWT
→ Return token + user info
```

JWT claims should include only required values such as:

```text
UserId
Email
```

---

## 8. Document APIs

Required endpoints:

```text
GET    /api/documents
GET    /api/documents/{id}
POST   /api/documents
PUT    /api/documents/{id}
DELETE /api/documents/{id}
```

Every operation must apply only to the authenticated user's own documents.

---

## 9. Category API

Version 1:

```text
GET /api/categories
```

Default categories:

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

---

## 10. Expiry Rules

Calculate status in the backend:

```text
ExpiryDate < Today
→ Expired
```

```text
Today <= ExpiryDate <= Today + 30 days
→ Expiring Soon
```

```text
ExpiryDate > Today + 30 days
→ Active
```

Also calculate:

```text
DaysRemaining
```

Do not allow the frontend to decide final status values.

---

## 11. Dashboard API

Endpoint:

```text
GET /api/dashboard
```

Return:

```text
TotalDocuments
ActiveDocuments
ExpiringSoonDocuments
ExpiredDocuments
UpcomingExpirations
RecentDocuments
```

All data must belong to the logged-in user.

---

## 12. Validation

Validate at least:

```text
FullName required
Email required and valid
Email unique
Password required
DocumentName required
CategoryId required
ExpiryDate required
ExpiryDate cannot be before IssueDate
ReminderDate should not be after ExpiryDate
```

Backend validation is required even when Angular also validates forms.

---

## 13. HTTP Status Codes

Use correct status codes:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

---

## 14. CORS

During frontend development, allow:

```text
http://localhost:4200
```

Do not allow every origin in production.

---

## 15. Swagger

Use Swagger from the beginning.

Test:

```text
POST /api/auth/register
POST /api/auth/login
GET /api/categories
GET /api/documents
POST /api/documents
GET /api/documents/{id}
PUT /api/documents/{id}
DELETE /api/documents/{id}
GET /api/dashboard
```

After JWT is added, configure Swagger to send Bearer tokens.

---

## 16. Development Order

```text
1. Create ASP.NET Core Web API
2. Run Swagger
3. Configure MySQL
4. Add Entity Framework Core
5. Create ApplicationDbContext
6. Create User model
7. Create DocumentCategory model
8. Create Document model
9. Configure relationships
10. Create migration
11. Apply migration
12. Seed categories
13. Add DTOs
14. Build Category GET API
15. Build Document POST API
16. Build Document GET APIs
17. Build Document PUT API
18. Build Document DELETE API
19. Create ExpiryService
20. Add DaysRemaining
21. Add status calculation
22. Build registration
23. Add password hashing
24. Build login
25. Add JWT
26. Protect APIs
27. Enforce user ownership
28. Configure Swagger JWT
29. Build Dashboard API
30. Add validation
31. Add global error handling
32. Add Profile
33. Add Settings
34. Add Reminders
35. Add File Upload
36. Connect Angular
```

---

## 17. Version 1 Definition of Done

Version 1 is complete when:

- ASP.NET Core API runs.
- Swagger works.
- MySQL connection works.
- EF Core migrations work.
- Users can register.
- Passwords are hashed.
- Users can login.
- JWT works.
- Categories can be retrieved.
- Users can CRUD their own documents.
- One user cannot access another user's documents.
- Status is calculated.
- Days remaining is returned.
- Dashboard summary works.

---

## Final Backend Architecture

```text
Angular
  ↓
Controllers
  ↓
Services
  ↓
ApplicationDbContext
  ↓
Entity Framework Core
  ↓
MySQL
```
