-- CreateEnum
CREATE TYPE "JobStage" AS ENUM ('INIT', 'PRE_PROCESSING', 'PROCESSING', 'POST_PROCESSING', 'DONE');

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "stage" "JobStage" NOT NULL DEFAULT 'INIT',
    "done" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_entryId_key" ON "Job"("entryId");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
