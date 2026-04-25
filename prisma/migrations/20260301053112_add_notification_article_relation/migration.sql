-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipientId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "articleId" TEXT,
    CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notifications_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notifications_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_notifications" ("actorId", "articleId", "createdAt", "id", "read", "recipientId", "type") SELECT "actorId", "articleId", "createdAt", "id", "read", "recipientId", "type" FROM "notifications";
DROP TABLE "notifications";
ALTER TABLE "new_notifications" RENAME TO "notifications";
CREATE INDEX "notifications_recipientId_idx" ON "notifications"("recipientId");
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
