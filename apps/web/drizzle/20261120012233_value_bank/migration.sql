CREATE TYPE "value_item_kind" AS ENUM('vocab', 'instruction', 'intent');--> statement-breakpoint
CREATE TABLE "value_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"pool_id" uuid NOT NULL,
	"item_key" text NOT NULL,
	"category" text,
	"kind" "value_item_kind" DEFAULT 'vocab'::"value_item_kind" NOT NULL,
	"canonical" text NOT NULL,
	"forms" text[] NOT NULL,
	"english" text,
	"transliteration" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "value_pools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"scenario_slug" text NOT NULL,
	"key" text NOT NULL,
	"slot" text NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "value_items_pool_key_unique" ON "value_items" ("pool_id","item_key");--> statement-breakpoint
CREATE INDEX "value_items_pool_idx" ON "value_items" ("pool_id");--> statement-breakpoint
CREATE UNIQUE INDEX "value_pools_scenario_key_unique" ON "value_pools" ("scenario_slug","key");--> statement-breakpoint
ALTER TABLE "value_items" ADD CONSTRAINT "value_items_pool_id_value_pools_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "value_pools"("id") ON DELETE CASCADE;