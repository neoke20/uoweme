/*
  Warnings:

  - You are about to drop the column `initiatorId` on the `Friendship` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `Friendship` table. All the data in the column will be lost.
  - Added the required column `friend` to the `Friendship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Friendship` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_initiatorId_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_receiverId_fkey";

-- AlterTable
ALTER TABLE "Friendship" DROP COLUMN "initiatorId",
DROP COLUMN "receiverId",
ADD COLUMN     "friend" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_friend_fkey" FOREIGN KEY ("friend") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
