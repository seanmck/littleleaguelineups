/*
  Warnings:

  - The `preferredPositions` column on the `Player` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `avoidPositions` column on the `Player` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Position" AS ENUM ('PITCHER', 'CATCHER', 'FIRST_BASE', 'SECOND_BASE', 'THIRD_BASE', 'SHORTSTOP', 'LEFT_FIELD', 'CENTER_FIELD', 'RIGHT_FIELD', 'DESIGNATED_HITTER', 'BENCH');

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "preferredPositions",
ADD COLUMN     "preferredPositions" "Position"[],
DROP COLUMN "avoidPositions",
ADD COLUMN     "avoidPositions" "Position"[];
