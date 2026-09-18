CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

ALTER DATABASE CHARACTER SET utf8mb4;

CREATE TABLE `DocumentCategories` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Description` longtext CHARACTER SET utf8mb4 NULL,
    `CreatedAt` datetime(6) NOT NULL,
    CONSTRAINT `PK_DocumentCategories` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Users` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `FullName` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Email` varchar(320) CHARACTER SET utf8mb4 NOT NULL,
    `PasswordHash` longtext CHARACTER SET utf8mb4 NOT NULL,
    `Phone` longtext CHARACTER SET utf8mb4 NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NOT NULL,
    CONSTRAINT `PK_Users` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Documents` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `UserId` int NOT NULL,
    `CategoryId` int NOT NULL,
    `DocumentName` longtext CHARACTER SET utf8mb4 NOT NULL,
    `DocumentNumber` longtext CHARACTER SET utf8mb4 NULL,
    `IssuedBy` longtext CHARACTER SET utf8mb4 NULL,
    `IssueDate` datetime(6) NULL,
    `ExpiryDate` datetime(6) NOT NULL,
    `ReminderDate` datetime(6) NULL,
    `Description` longtext CHARACTER SET utf8mb4 NULL,
    `FilePath` longtext CHARACTER SET utf8mb4 NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `UpdatedAt` datetime(6) NOT NULL,
    CONSTRAINT `PK_Documents` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Documents_DocumentCategories_CategoryId` FOREIGN KEY (`CategoryId`) REFERENCES `DocumentCategories` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_Documents_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `UserSettings` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `UserId` int NOT NULL,
    `ExpiryWarningDays` int NOT NULL,
    `DefaultReminderDays` int NOT NULL,
    `EnableReminders` tinyint(1) NOT NULL,
    CONSTRAINT `PK_UserSettings` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_UserSettings_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `Reminders` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `DocumentId` int NOT NULL,
    `ReminderDate` datetime(6) NOT NULL,
    `IsCompleted` tinyint(1) NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    CONSTRAINT `PK_Reminders` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Reminders_Documents_DocumentId` FOREIGN KEY (`DocumentId`) REFERENCES `Documents` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

INSERT INTO `DocumentCategories` (`Id`, `CreatedAt`, `Description`, `Name`)
VALUES (1, TIMESTAMP '2026-09-16 09:24:18', NULL, 'Passport'),
(2, TIMESTAMP '2026-09-16 09:24:18', NULL, 'Driving Licence'),
(3, TIMESTAMP '2026-09-16 09:24:18', NULL, 'Insurance'),
(4, TIMESTAMP '2026-09-16 09:24:18', NULL, 'Certificate'),
(5, TIMESTAMP '2026-09-16 09:24:18', NULL, 'Vehicle Document'),
(6, TIMESTAMP '2026-09-16 09:24:18', NULL, 'Professional Licence'),
(7, TIMESTAMP '2026-09-16 09:24:18', NULL, 'Warranty'),
(8, TIMESTAMP '2026-09-16 09:24:18', NULL, 'Membership'),
(9, TIMESTAMP '2026-09-16 09:24:18', NULL, 'Other');

CREATE INDEX `IX_Documents_CategoryId` ON `Documents` (`CategoryId`);

CREATE INDEX `IX_Documents_UserId` ON `Documents` (`UserId`);

CREATE INDEX `IX_Reminders_DocumentId` ON `Reminders` (`DocumentId`);

CREATE UNIQUE INDEX `IX_Users_Email` ON `Users` (`Email`);

CREATE UNIQUE INDEX `IX_UserSettings_UserId` ON `UserSettings` (`UserId`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260916092420_InitialCreate', '9.0.0');

ALTER TABLE `Documents` MODIFY COLUMN `DocumentName` varchar(255) CHARACTER SET utf8mb4 NOT NULL;

ALTER TABLE `DocumentCategories` MODIFY COLUMN `Name` varchar(255) CHARACTER SET utf8mb4 NOT NULL;

UPDATE `DocumentCategories` SET `CreatedAt` = TIMESTAMP '2026-01-01 00:00:00'
WHERE `Id` = 1;
SELECT ROW_COUNT();


UPDATE `DocumentCategories` SET `CreatedAt` = TIMESTAMP '2026-01-01 00:00:00'
WHERE `Id` = 2;
SELECT ROW_COUNT();


UPDATE `DocumentCategories` SET `CreatedAt` = TIMESTAMP '2026-01-01 00:00:00'
WHERE `Id` = 3;
SELECT ROW_COUNT();


UPDATE `DocumentCategories` SET `CreatedAt` = TIMESTAMP '2026-01-01 00:00:00'
WHERE `Id` = 4;
SELECT ROW_COUNT();


UPDATE `DocumentCategories` SET `CreatedAt` = TIMESTAMP '2026-01-01 00:00:00'
WHERE `Id` = 5;
SELECT ROW_COUNT();


UPDATE `DocumentCategories` SET `CreatedAt` = TIMESTAMP '2026-01-01 00:00:00'
WHERE `Id` = 6;
SELECT ROW_COUNT();


UPDATE `DocumentCategories` SET `CreatedAt` = TIMESTAMP '2026-01-01 00:00:00'
WHERE `Id` = 7;
SELECT ROW_COUNT();


UPDATE `DocumentCategories` SET `CreatedAt` = TIMESTAMP '2026-01-01 00:00:00'
WHERE `Id` = 8;
SELECT ROW_COUNT();


UPDATE `DocumentCategories` SET `CreatedAt` = TIMESTAMP '2026-01-01 00:00:00'
WHERE `Id` = 9;
SELECT ROW_COUNT();


CREATE INDEX `IX_Documents_DocumentName` ON `Documents` (`DocumentName`);

CREATE INDEX `IX_Documents_ExpiryDate` ON `Documents` (`ExpiryDate`);

CREATE UNIQUE INDEX `IX_DocumentCategories_Name` ON `DocumentCategories` (`Name`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260916101049_AddDatabaseIndexes', '9.0.0');

