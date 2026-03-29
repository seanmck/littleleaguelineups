-- Merge battingOrder into lineup JSON before dropping the column
-- For games that have both lineup and battingOrder, wrap the lineup innings
-- in a { "battingOrder": [...], "innings": { ... } } structure.
UPDATE "Game"
SET "lineup" = jsonb_build_object(
  'battingOrder', "battingOrder",
  'innings', "lineup"
)
WHERE "battingOrder" IS NOT NULL AND "lineup" IS NOT NULL;

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "battingOrder";
