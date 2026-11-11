import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Content model for Darija Genie.
 *
 * Text content (lessons, grammar, vocabulary) lives here; audio files live in
 * Azure Blob Storage and are referenced from `audio_assets` by storage key.
 * Audio bytes are never stored in the database.
 */

export const audioKindEnum = pgEnum("audio_kind", [
  "vocab", // single-term pronunciation clip
  "grammar", // example sentence / grammar drill audio
  "dialogue", // longer conversation audio
]);

export const vocabularyAudioRoleEnum = pgEnum("vocabulary_audio_role", [
  "pronunciation", // how to say the term itself
  "example", // clip of the example sentence
]);

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    // beginner | intermediate | advanced
    level: text("level").notNull().default("beginner"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("lessons_slug_unique").on(table.slug)],
);

export const grammarPoints = pgTable(
  "grammar_points",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    explanation: text("explanation").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("grammar_points_lesson_idx").on(table.lessonId)],
);

export const vocabulary = pgTable(
  "vocabulary",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
    // Darija term as written (Arabic script)
    term: text("term").notNull(),
    translation: text("translation").notNull(),
    transliteration: text("transliteration"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("vocabulary_lesson_idx").on(table.lessonId)],
);

export const examples = pgTable(
  "examples",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vocabularyId: uuid("vocabulary_id")
      .notNull()
      .references(() => vocabulary.id, { onDelete: "cascade" }),
    darijaText: text("darija_text").notNull(),
    translation: text("translation").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("examples_vocabulary_idx").on(table.vocabularyId)],
);

/**
 * One row per audio file in Azure Blob Storage.
 * `storageKey` is the blob name inside the container (e.g. `vocab/salam.mp3`).
 * `transcript` stores the reference text so we can benchmark ASR accuracy
 * and re-run comparisons without re-uploading.
 */
export const audioAssets = pgTable(
  "audio_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kind: audioKindEnum("kind").notNull(),
    container: text("container").notNull().default("audio"),
    storageKey: text("storage_key").notNull(),
    contentType: text("content_type"),
    durationSeconds: real("duration_seconds"),
    transcript: text("transcript"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("audio_assets_container_key_unique").on(table.container, table.storageKey),
  ],
);

/** Links vocabulary terms to their audio clips (a clip can be reused by terms). */
export const vocabularyAudio = pgTable(
  "vocabulary_audio",
  {
    vocabularyId: uuid("vocabulary_id")
      .notNull()
      .references(() => vocabulary.id, { onDelete: "cascade" }),
    audioAssetId: uuid("audio_asset_id")
      .notNull()
      .references(() => audioAssets.id, { onDelete: "cascade" }),
    role: vocabularyAudioRoleEnum("role").notNull().default("pronunciation"),
  },
  (table) => [
    primaryKey({ columns: [table.vocabularyId, table.audioAssetId, table.role] }),
    index("vocabulary_audio_audio_idx").on(table.audioAssetId),
  ],
);

export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;
export type GrammarPoint = typeof grammarPoints.$inferSelect;
export type VocabularyItem = typeof vocabulary.$inferSelect;
export type Example = typeof examples.$inferSelect;
export type AudioAsset = typeof audioAssets.$inferSelect;
