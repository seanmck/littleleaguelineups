-- CreateEnum
CREATE TYPE "BattingOrderStrategy" AS ENUM ('rotate', 'keepSame', 'continue', 'balancedFairness');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "battingOrder" JSONB,
ADD COLUMN     "battingOrderStrategy" "BattingOrderStrategy",
ADD COLUMN     "lastBatterIndex" INTEGER;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "battingOrderStrategy" "BattingOrderStrategy" NOT NULL DEFAULT 'rotate';
