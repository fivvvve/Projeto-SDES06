-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "excluido" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "izzy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "codigo_convite" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "user_izzy" (
    "user_id" TEXT NOT NULL,
    "izzy_id" TEXT NOT NULL,
    "saiu" BOOLEAN NOT NULL DEFAULT false,
    "responsavel" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("user_id", "izzy_id"),
    CONSTRAINT "user_izzy_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_izzy_izzy_id_fkey" FOREIGN KEY ("izzy_id") REFERENCES "izzy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "atividade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "criador_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
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

-- CreateTable
CREATE TABLE "atividade_user" (
    "user_id" TEXT NOT NULL,
    "atividade_id" TEXT NOT NULL,

    PRIMARY KEY ("user_id", "atividade_id"),
    CONSTRAINT "atividade_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "atividade_user_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividade" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "data_atividade" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL,
    "atividade_id" TEXT NOT NULL,
    CONSTRAINT "data_atividade_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividade" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dia" TEXT NOT NULL,
    "atividade_id" TEXT NOT NULL,
    CONSTRAINT "dia_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividade" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "izzy_codigo_convite_key" ON "izzy"("codigo_convite");
