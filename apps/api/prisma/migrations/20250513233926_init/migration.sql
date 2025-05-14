/*
  Warnings:

  - The `preferredPositions` column on the `Player` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `avoidPositions` column on the `Player` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "preferredPositions",
ADD COLUMN     "preferredPositions" TEXT[],
DROP COLUMN "avoidPositions",
ADD COLUMN     "avoidPositions" TEXT[];

-- DropEnum
DROP TYPE "Position";
