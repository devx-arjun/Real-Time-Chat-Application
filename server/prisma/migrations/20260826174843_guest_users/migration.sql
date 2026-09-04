/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[guestId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usernameNormalized]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `guestId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usernameNormalized` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "passwordHash",
ADD COLUMN     "guestId" TEXT NOT NULL,
ADD COLUMN     "usernameNormalized" TEXT NOT NULL;

-- DropTable
DROP TABLE "Session";

-- CreateIndex
CREATE UNIQUE INDEX "User_guestId_key" ON "User"("guestId");

-- CreateIndex
CREATE UNIQUE INDEX "User_usernameNormalized_key" ON "User"("usernameNormalized");
