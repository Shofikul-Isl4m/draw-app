/*
  Warnings:

  - You are about to drop the column `isTemporary` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `maxTimeLimit` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `maxUsers` on the `Room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "isTemporary",
DROP COLUMN "maxTimeLimit",
DROP COLUMN "maxUsers";
