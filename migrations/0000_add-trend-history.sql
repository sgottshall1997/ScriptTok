CREATE TABLE "affiliate_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" integer,
	"product_name" text NOT NULL,
	"affiliate_url" text NOT NULL,
	"network" text DEFAULT 'amazon' NOT NULL,
	"commission" numeric DEFAULT '0',
	"clicks" integer DEFAULT 0 NOT NULL,
	"conversions" integer DEFAULT 0,
	"revenue" numeric DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_model_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"niche" text NOT NULL,
	"template_type" text NOT NULL,
	"tone" text NOT NULL,
	"temperature" numeric DEFAULT '0.7' NOT NULL,
	"frequency_penalty" numeric DEFAULT '0.0' NOT NULL,
	"presence_penalty" numeric DEFAULT '0.0' NOT NULL,
	"model_name" text DEFAULT 'gpt-4' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	CONSTRAINT "ai_model_configs_niche_template_type_tone_unique" UNIQUE("niche","template_type","tone")
);
--> statement-breakpoint
CREATE TABLE "amazon_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"asin" text NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"price" numeric,
	"currency" text DEFAULT 'USD',
	"image_url" text,
	"category" text,
	"rating" numeric,
	"review_count" integer,
	"availability" text,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "amazon_products_asin_unique" UNIQUE("asin")
);
--> statement-breakpoint
CREATE TABLE "api_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"niche" text,
	"template_type" text,
	"tone" text,
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE "content_generations" (
	"id" serial PRIMARY KEY NOT NULL,
	"product" text NOT NULL,
	"niche" text DEFAULT 'skincare' NOT NULL,
	"template_type" text NOT NULL,
	"tone" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"session_id" text,
	"niche" text NOT NULL,
	"content_type" text NOT NULL,
	"tone" text NOT NULL,
	"product_name" text NOT NULL,
	"prompt_text" text NOT NULL,
	"output_text" text NOT NULL,
	"platforms_selected" jsonb,
	"generated_output" jsonb,
	"affiliate_link" text,
	"viral_inspo" jsonb,
	"model_used" text NOT NULL,
	"token_count" integer NOT NULL,
	"fallback_level" text,
	"ai_model" text,
	"content_format" text,
	"top_rated_style_used" boolean DEFAULT false,
	"user_overall_rating" integer,
	"user_tiktok_rating" integer,
	"user_instagram_rating" integer,
	"user_youtube_rating" integer,
	"user_comments" text,
	"viral_score" jsonb,
	"viral_score_overall" integer,
	"viral_analysis" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_scraper_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"date" text NOT NULL,
	"data" jsonb,
	"success" boolean DEFAULT false NOT NULL,
	"error" text,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_scraper_cache_source_date_unique" UNIQUE("source","date")
);
--> statement-breakpoint
CREATE TABLE "scraper_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"status" text NOT NULL,
	"last_check" timestamp DEFAULT now() NOT NULL,
	"error_message" text,
	CONSTRAINT "scraper_status_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trend_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_type" text NOT NULL,
	"niche" text NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL,
	"trend_category" text,
	"trend_name" text,
	"trend_description" text,
	"trend_volume" text,
	"trend_growth" text,
	"trend_when" text,
	"trend_opportunity" text,
	"trend_reason" text,
	"product_title" text,
	"product_mentions" integer,
	"product_engagement" integer,
	"product_source" text,
	"product_reason" text,
	"product_description" text,
	"viral_keywords" text[],
	"product_data" jsonb,
	"raw_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trending_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"source" text NOT NULL,
	"mentions" integer,
	"source_url" text,
	"niche" text DEFAULT 'skincare' NOT NULL,
	"data_source" text DEFAULT 'gpt',
	"reason" text,
	"fetched_at" timestamp DEFAULT now() NOT NULL,
	"engagement" integer,
	"description" text,
	"viral_keywords" text[],
	"perplexity_notes" text,
	"trend_category" text,
	"video_count" text,
	"growth_percentage" text,
	"trend_momentum" text,
	"price" text,
	"price_numeric" numeric,
	"price_currency" text DEFAULT 'USD',
	"price_type" text DEFAULT 'one-time',
	"asin" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text,
	"role" text DEFAULT 'creator' NOT NULL,
	"first_name" text,
	"last_name" text,
	"profile_image" text,
	"status" text DEFAULT 'active' NOT NULL,
	"last_login" timestamp,
	"preferences" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "affiliate_links" ADD CONSTRAINT "affiliate_links_content_id_content_generations_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_generations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_model_configs" ADD CONSTRAINT "ai_model_configs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_usage" ADD CONSTRAINT "api_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_history" ADD CONSTRAINT "content_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;