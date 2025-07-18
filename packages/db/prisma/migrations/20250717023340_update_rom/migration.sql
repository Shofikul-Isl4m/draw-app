/*
  Warnings:

  - Added the required column `maxTimeLimit` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxUsers` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "isTemporary" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxTimeLimit" INTEGER NOT NULL,
ADD COLUMN     "maxUsers" INTEGER NOT NULL;
