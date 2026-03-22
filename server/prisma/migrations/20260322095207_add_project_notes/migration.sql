-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "links" JSONB DEFAULT '[]',
ADD COLUMN     "notes" TEXT DEFAULT '';
