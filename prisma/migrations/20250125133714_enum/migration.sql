/*
  Warnings:

  - Changed the type of `entryType` on the `Entry` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('EPUB', 'AUDIO');

-- AlterTable
ALTER TABLE "Entry" ADD COLUMN "entryType1" "FileType" not null default 'EPUB';
UPDATE "Entry" set "entryType1" = "entryType"::"FileType";
ALTER TABLE "Entry" DROP COLUMN "entryType";
ALTER TABLE "Entry" RENAME COLUMN "entryType1" TO "entryType";