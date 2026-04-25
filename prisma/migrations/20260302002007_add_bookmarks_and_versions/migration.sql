/*
  Warnings:

  - You are about to drop the `purchases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tips` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `isPaid` on the `articles` table. All the data in the column will be lost.
  - You are about to drop the column `previewEnd` on the `articles` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `articles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "purchases_userId_articleId_key";

-- DropIndex
DROP INDEX "purchases_userId_idx";

-- DropIndex
DROP INDEX "tips_receiverId_idx";

-- DropIndex
DROP INDEX "tips_senderId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "purchases";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "tips";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "bookmark_collections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "bookmark_collections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "collectionId" TEXT,
    CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookmarks_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookmarks_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "bookmark_collections" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "article_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "thumbnail" TEXT,
    "changeNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "articleId" TEXT NOT NULL,
    CONSTRAINT "article_versions_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_articles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "thumbnail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" DATETIME,
    "scheduledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT,
    CONSTRAINT "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_articles" ("authorId", "categoryId", "content", "createdAt", "excerpt", "id", "publishedAt", "scheduledAt", "slug", "status", "thumbnail", "title", "updatedAt") SELECT "authorId", "categoryId", "content", "createdAt", "excerpt", "id", "publishedAt", "scheduledAt", "slug", "status", "thumbnail", "title", "updatedAt" FROM "articles";
DROP TABLE "articles";
ALTER TABLE "new_articles" RENAME TO "articles";
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");
CREATE INDEX "articles_authorId_idx" ON "articles"("authorId");
CREATE INDEX "articles_slug_idx" ON "articles"("slug");
CREATE INDEX "articles_status_idx" ON "articles"("status");
CREATE INDEX "articles_publishedAt_idx" ON "articles"("publishedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "bookmark_collections_userId_idx" ON "bookmark_collections"("userId");

-- CreateIndex
CREATE INDEX "bookmarks_userId_idx" ON "bookmarks"("userId");

-- CreateIndex
CREATE INDEX "bookmarks_articleId_idx" ON "bookmarks"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_userId_articleId_key" ON "bookmarks"("userId", "articleId");

-- CreateIndex
CREATE INDEX "article_versions_articleId_idx" ON "article_versions"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "article_versions_articleId_version_key" ON "article_versions"("articleId", "version");
