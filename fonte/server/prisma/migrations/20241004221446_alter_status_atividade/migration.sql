/*
  Warnings:

  - You are about to drop the column `status` on the `atividade` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_atividade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "criador_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'Única',
    "izzy_id" TEXT NOT NULL,
    "data_inicio" DATETIME NOT NULL,
    "data_limite" DATETIME,
    "data_final" DATETIME,
    CONSTRAINT "atividade_criador_id_fkey" FOREIGN KEY ("criador_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "atividade_izzy_id_fkey" FOREIGN KEY ("izzy_id") REFERENCES "izzy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_atividade" ("criador_id", "data_final", "data_inicio", "data_limite", "descricao", "id", "izzy_id", "tipo", "titulo") SELECT "criador_id", "data_final", "data_inicio", "data_limite", "descricao", "id", "izzy_id", "tipo", "titulo" FROM "atividade";
DROP TABLE "atividade";
ALTER TABLE "new_atividade" RENAME TO "atividade";
CREATE TABLE "new_atividade_user" (
    "user_id" TEXT NOT NULL,
    "atividade_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',

    PRIMARY KEY ("user_id", "atividade_id"),
    CONSTRAINT "atividade_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "atividade_user_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividade" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_atividade_user" ("atividade_id", "user_id") SELECT "atividade_id", "user_id" FROM "atividade_user";
DROP TABLE "atividade_user";
ALTER TABLE "new_atividade_user" RENAME TO "atividade_user";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
