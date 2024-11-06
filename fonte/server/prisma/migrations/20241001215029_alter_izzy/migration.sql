-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_izzy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "codigo_convite" TEXT
);
INSERT INTO "new_izzy" ("codigo_convite", "descricao", "id", "nome") SELECT "codigo_convite", "descricao", "id", "nome" FROM "izzy";
DROP TABLE "izzy";
ALTER TABLE "new_izzy" RENAME TO "izzy";
CREATE UNIQUE INDEX "izzy_codigo_convite_key" ON "izzy"("codigo_convite");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
