CREATE TYPE "public"."audio_kind" AS ENUM('vocab', 'grammar', 'dialogue');--> statement-breakpoint
CREATE TYPE "public"."vocabulary_audio_role" AS ENUM('pronunciation', 'example');--> statement-breakpoint
CREATE TABLE "audio_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "audio_kind" NOT NULL,
	"container" text DEFAULT 'audio' NOT NULL,
	"storage_key" text NOT NULL,
	"content_type" text,
	"duration_seconds" real,
	"transcript" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "examples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vocabulary_id" uuid NOT NULL,
	"darija_text" text NOT NULL,
	"translation" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grammar_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"title" text NOT NULL,
	"explanation" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"level" text DEFAULT 'beginner' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vocabulary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid,
	"term" text NOT NULL,
	"translation" text NOT NULL,
	"transliteration" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vocabulary_audio" (
	"vocabulary_id" uuid NOT NULL,
	"audio_asset_id" uuid NOT NULL,
	"role" "vocabulary_audio_role" DEFAULT 'pronunciation' NOT NULL,
	CONSTRAINT "vocabulary_audio_vocabulary_id_audio_asset_id_role_pk" PRIMARY KEY("vocabulary_id","audio_asset_id","role")
);
--> statement-breakpoint
ALTER TABLE "examples" ADD CONSTRAINT "examples_vocabulary_id_vocabulary_id_fk" FOREIGN KEY ("vocabulary_id") REFERENCES "public"."vocabulary"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_points" ADD CONSTRAINT "grammar_points_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary" ADD CONSTRAINT "vocabulary_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_audio" ADD CONSTRAINT "vocabulary_audio_vocabulary_id_vocabulary_id_fk" FOREIGN KEY ("vocabulary_id") REFERENCES "public"."vocabulary"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_audio" ADD CONSTRAINT "vocabulary_audio_audio_asset_id_audio_assets_id_fk" FOREIGN KEY ("audio_asset_id") REFERENCES "public"."audio_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "audio_assets_container_key_unique" ON "audio_assets" USING btree ("container","storage_key");--> statement-breakpoint
CREATE INDEX "examples_vocabulary_idx" ON "examples" USING btree ("vocabulary_id");--> statement-breakpoint
CREATE INDEX "grammar_points_lesson_idx" ON "grammar_points" USING btree ("lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_slug_unique" ON "lessons" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "vocabulary_lesson_idx" ON "vocabulary" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "vocabulary_audio_audio_idx" ON "vocabulary_audio" USING btree ("audio_asset_id");