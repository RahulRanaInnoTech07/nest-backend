CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"cognito_sub" text UNIQUE,
	"email" text NOT NULL UNIQUE,
	"full_name" text,
	"avatar_url" text,
	"phone" text,
	"locale" text DEFAULT 'en',
	"timezone" text,
	"status" text DEFAULT 'active' NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
