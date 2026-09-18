# Database setup

The API uses MySQL database `document_expiry_tracker` and Entity Framework Core migrations.

## Setup

1. Start MySQL on `localhost:3306`.
2. Set the MySQL password in `backend/DocumentExpiryTracker.API/appsettings.json`.
3. From `backend/DocumentExpiryTracker.API`, run:

```powershell
dotnet ef database update
```

This creates the EF-managed schema, foreign keys, indexes, and seeded document categories.

## Direct bootstrap

Run `create-database.sql` in MySQL Workbench if the database does not exist. The generated `schema.sql` contains the SQL produced from the EF migrations and is useful for review or manual execution.

The canonical schema source is the EF migration chain in `backend/DocumentExpiryTracker.API/Migrations/`.
