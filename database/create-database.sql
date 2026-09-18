CREATE DATABASE IF NOT EXISTS document_expiry_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE document_expiry_tracker;

-- Apply the EF Core schema after creating the database:
-- dotnet ef database update
