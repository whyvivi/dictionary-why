-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "words" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "spelling" TEXT NOT NULL,
    "phonetic_uk" TEXT,
    "phonetic_us" TEXT,
    "audio_uk_url" TEXT,
    "audio_us_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "word_senses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "word_id" INTEGER NOT NULL,
    "sense_order" INTEGER NOT NULL,
    "part_of_speech" TEXT NOT NULL,
    "definition_en" TEXT NOT NULL,
    "definition_zh" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "word_senses_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "words" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "examples" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sense_id" INTEGER NOT NULL,
    "sentence_en" TEXT,
    "sentence_zh" TEXT,
    CONSTRAINT "examples_sense_id_fkey" FOREIGN KEY ("sense_id") REFERENCES "word_senses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "words_spelling_key" ON "words"("spelling");
