/*
  Warnings:

  - You are about to drop the `Lineup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Lineup" DROP CONSTRAINT "Lineup_gameId_fkey";

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "lineup" JSONB;

-- DropTable
DROP TABLE "Lineup";
