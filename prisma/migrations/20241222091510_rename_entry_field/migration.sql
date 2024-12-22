/*
  Warnings:

  - You are about to drop the column `path` on the `Entry` table. All the data in the column will be lost.
  - Added the required column `pathPrefix` to the `Entry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Entry" RENAME COLUMN "path" to "pathPrefix";
ALTER TABLE "Entry" ADD COLUMN     "readingPath" TEXT;
