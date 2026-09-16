# Personal Document Expiry Tracker — ASP.NET Core API Plan

## 1. Goal

Build the backend API for the **Personal Document Expiry Tracker** using:

- C#
- ASP.NET Core Web API
- Entity Framework Core
- MySQL
- JWT Authentication
- Swagger / OpenAPI

The API will later connect to the Angular frontend.

---

## 2. Backend Stack

```text
Language: C#
Backend: ASP.NET Core Web API
Framework: .NET LTS
ORM: Entity Framework Core
Database: MySQL
Authentication: JWT
API Testing: Swagger + Postman
IDE: Visual Studio Community
Version Control: Git + GitHub
```

---

## 3. Project Structure

Keep backend and frontend separate.

```text
personal-document-expiry-tracker/
│
├── frontend/
│
└── backend/
    └── DocumentExpiryTracker.API/
```

Create the backend project inside:

```text
backend/
```

Project name:

```text
DocumentExpiryTracker.API
```

---

## 4. Create the ASP.NET Core Web API Project

In Visual Studio Community:

1. Select **Create a new project**.
2. Choose **ASP.NET Core Web API**.
3. Set the project name to:

```text
DocumentExpiryTracker.API
```

4. Set the location to:

```text
personal-document-expiry-tracker/backend/
```

Recommended options:

```text
Framework: Current supported .NET LTS
Authentication: None
Configure for HTTPS: Yes
Enable OpenAPI: Yes
Use Controllers: Yes
```

Use Controllers because the project needs a clear API structure.

---

## 5. Run the Empty API First

Before adding features:

```text
Run ASP.NET Core
        ↓
Swagger opens
        ↓
No startup errors
```

Do not continue until the empty API works correctly.

Remove default sample files such as WeatherForecast after confirming the project works.

---

## 6. Backend Folder Structure

Recommended structure:

```text
DocumentExpiryTracker.API/
│
├── Controllers/
├── Data/
├── Models/
├── DTOs/
├── Services/
├── Interfaces/
├── Helpers/
├── Middleware/
├── Migrations/
├── Uploads/
│
├── Program.cs
├── appsettings.json
└── appsettings.Development.json
```

Initially focus on:

```text
Controllers
Data
Models
DTOs
Services
Interfaces
```

---

## 7. Folder Responsibilities

### Controllers

Contains API endpoints.

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

### Models

Contains database entities.

Start with:

```text
User
Document
DocumentCategory
```

Later add:

```text
Reminder
UserSetting
DocumentRenewal
```

### DTOs

Used for API requests and responses.

Examples:

```text
RegisterDTO
LoginDTO
AuthResponseDTO
CreateDocumentDTO
UpdateDocumentDTO
DocumentResponseDTO
CategoryResponseDTO
DashboardResponseDTO
```

### Data

Contains:

```text
ApplicationDbContext
```

### Services

Contains business logic.

Examples:

```text
AuthService
DocumentService
ExpiryService
CategoryService
DashboardService
ReminderService
ProfileService
SettingsService
```

### Interfaces

Examples:

```text
IAuthService
IDocumentService
IExpiryService
ICategoryService
IDashboardService
```

---

## 8. MySQL Setup

Install:

```text
MySQL Community Server
MySQL Workbench
```

Create a database:

```text
document_expiry_tracker
```

Typical local development connection:

```text
Server: localhost
Port: 3306
Database: document_expiry_tracker
Username: root
Password: your local MySQL password
```

Do not manually create all tables. Use Entity Framework Core migrations.

---

## 9. Entity Framework Core

Architecture:

```text
Controller
    ↓
Service
    ↓
ApplicationDbContext
    ↓
Entity Framework Core
    ↓
MySQL
```

Set up:

1. Entity Framework Core.
2. MySQL EF Core provider.
3. EF Core migration tools.
4. Database connection string.
5. `ApplicationDbContext`.
6. Register DbContext in `Program.cs`.

---

## 10. ApplicationDbContext

For Version 1, it should contain:

```text
Users
DocumentCategories
Documents
```

Later add:

```text
Reminders
UserSettings
DocumentRenewals
```

---

## 11. User Model

Planned fields:

```text
Id
FullName
Email
PasswordHash
Phone
CreatedAt
UpdatedAt
```

Rules:

- Email must be unique.
- Never store plain text passwords.
- Never return `PasswordHash` to the frontend.

---

## 12. DocumentCategory Model

Fields:

```text
Id
Name
Description
CreatedAt
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

## 13. Document Model

Fields:

```text
Id
UserId
CategoryId
DocumentName
DocumentNumber
IssuedBy
IssueDate
ExpiryDate
ReminderDate
Description
FilePath
CreatedAt
UpdatedAt
```

Relationships:

```text
User 1 → Many Documents
DocumentCategory 1 → Many Documents
```

---

## 14. Do Not Store Status Initially

Do not permanently store:

```text
Active
Expiring Soon
Expired
```

Calculate status using `ExpiryDate`.

Version 1 rules:

```text
ExpiryDate < Today
→ Expired
```

```text
ExpiryDate is today or within 30 days
→ Expiring Soon
```

```text
ExpiryDate > 30 days away
→ Active
```

Also calculate:

```text
DaysRemaining
```

---

## 15. ExpiryService

Create an `ExpiryService` responsible for:

```text
Calculate status
Calculate days remaining
Check expired
Check expiring soon
```

Later make the warning period configurable through user settings.

---

## 16. Initial Database Migration

After creating models and DbContext:

```text
Create migration: InitialCreate
        ↓
Apply migration
        ↓
Check MySQL Workbench
```

Expected tables:

```text
Users
DocumentCategories
Documents
```

Seed the standard document categories automatically.

---

## 17. DTO Strategy

Use DTOs instead of exposing database models directly.

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

Dashboard:

```text
DashboardResponseDTO
```

---

## 18. Authentication API

Create:

```text
AuthController
AuthService
IAuthService
```

Endpoints:

```text
POST /api/auth/register
POST /api/auth/login
```

---

## 19. Registration Flow

Input:

```text
FullName
Email
Phone
Password
ConfirmPassword
```

Flow:

```text
Validate fields
      ↓
Check duplicate email
      ↓
Hash password
      ↓
Create user
      ↓
Save to MySQL
```

---

## 20. Login Flow

Input:

```text
Email
Password
```

Flow:

```text
Find user
      ↓
Verify password
      ↓
Generate JWT
      ↓
Return token + user information
```

---

## 21. JWT Authentication

Angular will later send:

```text
Authorization: Bearer <token>
```

Useful JWT claims:

```text
UserId
Email
```

Do not store sensitive information inside the token.

Protect:

```text
Documents
Dashboard
Profile
Settings
Reminders
```

Without a valid token:

```text
401 Unauthorized
```

---

## 22. User Data Isolation

Every document belongs to a user.

If User A is logged in:

```text
GET /api/documents
```

must return only User A's documents.

The backend must also verify ownership for:

```text
GET /api/documents/{id}
PUT /api/documents/{id}
DELETE /api/documents/{id}
```

Never depend on Angular alone for security.

---

## 23. Document CRUD API

Create:

```text
DocumentsController
DocumentService
IDocumentService
```

Endpoints:

```text
GET    /api/documents
GET    /api/documents/{id}
POST   /api/documents
PUT    /api/documents/{id}
DELETE /api/documents/{id}
```

---

## 24. Create Document

Endpoint:

```text
POST /api/documents
```

Input:

```text
DocumentName
CategoryId
DocumentNumber
IssuedBy
IssueDate
ExpiryDate
ReminderDate
Description
```

Backend responsibilities:

```text
Validate request
Validate category
Validate dates
Attach logged-in UserId
Save document
Calculate status
Calculate days remaining
Return created document
```

---

## 25. Get Documents

Endpoint:

```text
GET /api/documents
```

Return only the current user's documents.

Response should include:

```text
Id
DocumentName
Category
DocumentNumber
IssuedBy
IssueDate
ExpiryDate
ReminderDate
Description
DaysRemaining
Status
```

---

## 26. Get One Document

Endpoint:

```text
GET /api/documents/{id}
```

Flow:

```text
Find document
      ↓
Verify current user owns it
      ↓
Return document
```

If not found:

```text
404 Not Found
```

---

## 27. Update Document

Endpoint:

```text
PUT /api/documents/{id}
```

Editable fields:

```text
DocumentName
CategoryId
DocumentNumber
IssuedBy
IssueDate
ExpiryDate
ReminderDate
Description
```

Verify ownership before updating.

---

## 28. Delete Document

Endpoint:

```text
DELETE /api/documents/{id}
```

Flow:

```text
Find document
      ↓
Verify ownership
      ↓
Delete
```

---

## 29. Validation Rules

At minimum:

```text
DocumentName required
CategoryId required
ExpiryDate required
Valid category required
ExpiryDate cannot be before IssueDate
Email must be valid
Email must be unique
Password must satisfy minimum rules
```

Later validate ReminderDate against ExpiryDate.

---

## 30. Category API

Create:

```text
CategoriesController
CategoryService
ICategoryService
```

Version 1 endpoint:

```text
GET /api/categories
```

This will populate the Angular category dropdown later.

---

## 31. Search and Filtering

Add after CRUD works.

Search example:

```text
GET /api/documents?search=passport
```

Search fields:

```text
DocumentName
DocumentNumber
IssuedBy
```

Status filter:

```text
GET /api/documents?status=active
GET /api/documents?status=expiring
GET /api/documents?status=expired
```

Category filter:

```text
GET /api/documents?categoryId=1
```

---

## 32. Sorting

Example:

```text
GET /api/documents?sortBy=expiryDate&sortDirection=asc
```

Possible fields:

```text
ExpiryDate
IssueDate
DocumentName
CreatedAt
```

---

## 33. Pagination

Add later:

```text
GET /api/documents?page=1&pageSize=10
```

Response can include:

```text
Items
CurrentPage
PageSize
TotalItems
TotalPages
```

---

## 34. Dashboard API

Create:

```text
DashboardController
DashboardService
IDashboardService
```

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

All values must belong to the logged-in user.

---

## 35. Profile API

Later create:

```text
GET /api/profile
PUT /api/profile
```

Fields:

```text
FullName
Email
Phone
```

Never return password hashes.

---

## 36. Settings API

Later create:

```text
GET /api/settings
PUT /api/settings
```

Settings:

```text
ExpiryWarningDays
DefaultReminderDays
EnableReminders
```

Default:

```text
ExpiryWarningDays = 30
```

---

## 37. Reminders

Add after Version 1.

Suggested model:

```text
Reminder

Id
DocumentId
ReminderDate
IsCompleted
CreatedAt
```

Possible endpoints:

```text
GET    /api/reminders
POST   /api/reminders
PUT    /api/reminders/{id}
DELETE /api/reminders/{id}
```

---

## 38. File Uploads

Do not build file uploads before document CRUD works.

Later support:

```text
PDF
JPG
JPEG
PNG
```

Flow:

```text
Angular
   ↓
ASP.NET upload API
   ↓
Validate file
   ↓
Generate safe filename
   ↓
Save file
   ↓
Store reference on Document
```

Security checks:

```text
Extension
MIME type
Maximum size
Ownership
Safe filename
```

---

## 39. Error Handling

Use correct HTTP status codes:

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

Return friendly messages such as:

```text
Document not found.
Email already registered.
Invalid email or password.
Expiry date cannot be before issue date.
```

Do not expose stack traces in production.

---

## 40. Swagger

Use Swagger throughout backend development.

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

After JWT is implemented, configure Swagger authentication so protected endpoints can be tested with a bearer token.

---

## 41. Postman

After Swagger works, create a Postman collection with folders:

```text
Authentication
Documents
Categories
Dashboard
Profile
Settings
Reminders
```

Environment variables:

```text
baseUrl
token
```

---

## 42. CORS

When Angular is connected later, it will likely run on:

```text
http://localhost:4200
```

Configure ASP.NET Core CORS to allow the Angular development origin.

Do not allow every origin permanently in production.

---

## 43. Version 1 API Scope

Version 1 should include only:

```text
Register
Login
JWT Authentication

Get Categories

Create Document
Get Documents
Get Document by ID
Update Document
Delete Document

Expiry Status
Days Remaining

Dashboard Summary

User Data Isolation
Swagger
MySQL
Entity Framework Core
```

---

## 44. Version 2

After Version 1 works:

```text
Search
Filters
Sorting
Pagination
Profile
Settings
Reminder Date
File Upload
File Download
```

---

## 45. Version 3

Later:

```text
Multiple reminders
Renewal history
Email notifications
Export
Admin APIs
Audit logs
```

---

## 46. Renewal History

A useful future entity:

```text
DocumentRenewal

Id
DocumentId
OldExpiryDate
RenewalDate
NewIssueDate
NewExpiryDate
CreatedAt
```

This preserves previous expiry information after renewal.

---

## 47. Recommended Development Order

Follow this order:

```text
1. Create ASP.NET Core Web API
        ↓
2. Run Swagger
        ↓
3. Setup MySQL
        ↓
4. Configure Entity Framework Core
        ↓
5. Create ApplicationDbContext
        ↓
6. Create User model
        ↓
7. Create DocumentCategory model
        ↓
8. Create Document model
        ↓
9. Configure relationships
        ↓
10. Create InitialCreate migration
        ↓
11. Apply migration
        ↓
12. Seed categories
        ↓
13. Create DTOs
        ↓
14. Create Category GET API
        ↓
15. Create Document POST API
        ↓
16. Test POST in Swagger
        ↓
17. Create Document GET APIs
        ↓
18. Create PUT API
        ↓
19. Create DELETE API
        ↓
20. Create ExpiryService
        ↓
21. Add DaysRemaining
        ↓
22. Add Status calculation
        ↓
23. Create registration
        ↓
24. Add password hashing
        ↓
25. Create login
        ↓
26. Add JWT
        ↓
27. Protect APIs
        ↓
28. Restrict documents to current user
        ↓
29. Configure Swagger JWT
        ↓
30. Create Dashboard API
        ↓
31. Add validation
        ↓
32. Add global error handling
        ↓
33. Add search/filtering
        ↓
34. Add pagination
        ↓
35. Add profile/settings
        ↓
36. Add reminders
        ↓
37. Add file upload
        ↓
38. Test with Postman
        ↓
39. Connect Angular frontend
```

---

## 48. First Backend Milestone

Do not start with JWT.

First target:

```text
ASP.NET Core API
      ↓
Entity Framework Core
      ↓
MySQL
      ↓
POST Document
      ↓
Record appears in MySQL
```

Then complete:

```text
GET
PUT
DELETE
```

---

## 49. Second Backend Milestone

After CRUD:

```text
ExpiryService
      ↓
DaysRemaining
      ↓
Active / Expiring Soon / Expired
```

Test this in Swagger.

---

## 50. Third Backend Milestone

Then:

```text
Register
      ↓
Password Hashing
      ↓
Login
      ↓
JWT
      ↓
Protected Documents API
```

---

## 51. Fourth Backend Milestone

Then:

```text
Current User
      ↓
Only their documents
      ↓
Dashboard Summary
```

At this point the API is ready for the main Angular integration.

---

## 52. Final API Map

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Categories

```text
GET /api/categories
```

### Documents

```text
GET    /api/documents
GET    /api/documents/{id}
POST   /api/documents
PUT    /api/documents/{id}
DELETE /api/documents/{id}
```

### Dashboard

```text
GET /api/dashboard
```

### Profile

```text
GET /api/profile
PUT /api/profile
```

### Settings

```text
GET /api/settings
PUT /api/settings
```

### Reminders — Later

```text
GET    /api/reminders
POST   /api/reminders
PUT    /api/reminders/{id}
DELETE /api/reminders/{id}
```

---

## 53. Suggested Document API Response

```text
Id
DocumentName
DocumentNumber
CategoryId
CategoryName
IssuedBy
IssueDate
ExpiryDate
ReminderDate
Description
DaysRemaining
Status
CreatedAt
UpdatedAt
```

Do not return unnecessary internal database information.

---

## 54. Suggested Dashboard Response

```text
TotalDocuments
ActiveDocuments
ExpiringSoonDocuments
ExpiredDocuments
UpcomingExpirations
RecentDocuments
```

The Angular dashboard should consume this response instead of recalculating all dashboard totals itself.

---

## 55. Security Checklist

Before calling the API complete, verify:

```text
Passwords are hashed
JWT secret is protected
JWT expiration exists
Protected APIs require authentication
Users see only their own documents
Changing a document ID cannot bypass ownership
Input is validated
Uploaded files are validated
Sensitive data is not returned
Database credentials are not publicly committed
Production errors do not expose stack traces
CORS is restricted
```

---

## 56. Testing Checklist

Test at minimum:

```text
Register new user
Register duplicate email
Login with correct password
Login with wrong password

Create document
Create invalid document
Get own documents
Get one document
Update document
Delete document

Attempt to access another user's document

Active status
Expiring Soon status
Expired status

Dashboard totals
Category retrieval
Unauthorized request
```

---

## 57. Definition of Version 1 Complete

The Version 1 backend is complete when:

- ASP.NET Core API runs.
- Swagger works.
- MySQL is connected.
- EF Core migrations work.
- Users can register.
- Passwords are hashed.
- Users can log in.
- JWT authentication works.
- Categories can be retrieved.
- Logged-in users can CRUD their own documents.
- Users cannot access another user's documents.
- Expiry status is calculated dynamically.
- Days remaining is calculated.
- Dashboard summary works.
- Correct HTTP status codes are returned.
- Angular can consume the API without changing the backend architecture.

---

# Final Backend Architecture

```text
Angular Frontend
      │
      │ REST / JSON
      ▼
ASP.NET Core Controllers
      │
      ▼
Services
      │
      ├── AuthService
      ├── DocumentService
      ├── ExpiryService
      └── DashboardService
      │
      ▼
ApplicationDbContext
      │
      ▼
Entity Framework Core
      │
      ▼
MySQL
```

## First Implementation Target

Start only with:

```text
Create ASP.NET Core API
        ↓
Run Swagger
        ↓
Connect MySQL
        ↓
Create Models
        ↓
Create Migration
        ↓
Build Document CRUD
        ↓
Test everything in Swagger
```

After this works, continue with authentication and JWT.
