-- CreateEnum
CREATE TYPE "UsageType" AS ENUM ('IMAGE_TOKENS', 'OTHERS');

-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "availableTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" "UsageType" NOT NULL DEFAULT 'IMAGE_TOKENS';
