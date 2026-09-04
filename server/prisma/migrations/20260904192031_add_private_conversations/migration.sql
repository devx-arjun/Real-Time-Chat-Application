/*
  Warnings:

  - A unique constraint covering the columns `[joinCode]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "joinCode" TEXT,
ALTER COLUMN "spaceId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_joinCode_key" ON "Conversation"("joinCode");
