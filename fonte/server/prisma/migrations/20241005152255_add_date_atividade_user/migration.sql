/*
  Warnings:

  - Added the required column `data_limite` to the `atividade_user` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_atividade_user" (
    "user_id" TEXT NOT NULL,
    "atividade_id" TEXT NOT NULL,
    "data_limite" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',

    PRIMARY KEY ("user_id", "atividade_id"),
    CONSTRAINT "atividade_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "atividade_user_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividade" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_atividade_user" ("atividade_id", "status", "user_id") SELECT "atividade_id", "status", "user_id" FROM "atividade_user";
DROP TABLE "atividade_user";
ALTER TABLE "new_atividade_user" RENAME TO "atividade_user";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
