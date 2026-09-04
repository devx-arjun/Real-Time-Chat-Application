/*
  Warnings:

  - A unique constraint covering the columns `[userId,messageId]` on the table `MessageReaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "MessageReaction_userId_messageId_emoji_key";

-- CreateIndex
CREATE UNIQUE INDEX "MessageReaction_userId_messageId_key" ON "MessageReaction"("userId", "messageId");
