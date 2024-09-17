CREATE TABLE IF NOT EXISTS "coin_flip_games" (
	"id" serial PRIMARY KEY NOT NULL,
	"random_seed" varchar(255) NOT NULL,
	"player_id" integer NOT NULL,
	"player_selection" varchar(5),
	"wager_payment_id" varchar(255),
	"wager_amount" numeric(10, 2),
	"wager_payout_amount" numeric(10, 2),
	"result" varchar(5),
	"payout_id" varchar(255),
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coin_flip_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer,
	"total_games" integer DEFAULT 0,
	"total_wins" integer DEFAULT 0,
	"total_losses" integer DEFAULT 0,
	"total_payouts" numeric(20, 2) DEFAULT '0',
	"heads_wins" integer DEFAULT 0,
	"tails_wins" integer DEFAULT 0
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coin_flip_games" ADD CONSTRAINT "coin_flip_games_player_id_users_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coin_flip_stats" ADD CONSTRAINT "coin_flip_stats_player_id_users_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
