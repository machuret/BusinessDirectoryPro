CREATE TABLE "businesses" (
	"placeid" text PRIMARY KEY NOT NULL,
	"title" text,
	"subtitle" text,
	"description" text,
	"categoryname" text,
	"categories" jsonb,
	"price" text,
	"website" text,
	"phone" text,
	"phoneunformatted" text,
	"menu" text,
	"address" text,
	"neighborhood" text,
	"street" text,
	"city" text,
	"postalcode" text,
	"state" text,
	"countrycode" text,
	"lat" numeric,
	"lng" numeric,
	"pluscode" text,
	"locatedin" text,
	"fid" text,
	"cid" text,
	"kgmid" text,
	"url" text,
	"searchpageurl" text,
	"googlefoodurl" text,
	"claimthisbusiness" boolean,
	"permanentlyclosed" boolean,
	"temporarilyclosed" boolean,
	"isadvertisement" boolean,
	"featured" boolean,
	"totalscore" numeric,
	"reviewscount" integer,
	"reviewsdistribution" jsonb,
	"reviewstags" jsonb,
	"reviews" jsonb,
	"imageurl" text,
	"imagescount" integer,
	"imagecategories" jsonb,
	"imageurls" jsonb,
	"images" jsonb,
	"logo" jsonb,
	"openinghours" jsonb,
	"additionalopeninghours" jsonb,
	"openinghoursbusinessconfirmationtext" text,
	"additionalinfo" jsonb,
	"amenities" jsonb,
	"accessibility" jsonb,
	"planning" jsonb,
	"reservetableurl" text,
	"tablereservationlinks" jsonb,
	"bookinglinks" jsonb,
	"orderby" jsonb,
	"restaurantdata" jsonb,
	"hotelads" jsonb,
	"hotelstars" integer,
	"hoteldescription" text,
	"checkindate" text,
	"checkoutdate" text,
	"similarhotelsnearby" jsonb,
	"hotelreviewsummary" jsonb,
	"peoplealsosearch" jsonb,
	"placestags" jsonb,
	"gasprices" jsonb,
	"questionsandanswers" jsonb,
	"updatesfromcustomers" jsonb,
	"ownerupdates" jsonb,
	"webresults" jsonb,
	"leadsenrichment" jsonb,
	"userplacenote" text,
	"scrapedat" timestamp,
	"searchstring" text,
	"language" text,
	"rank" integer,
	"ownerid" text,
	"seotitle" text,
	"slug" text NOT NULL,
	"seodescription" text,
	"createdat" timestamp DEFAULT now(),
	"updatedat" timestamp DEFAULT now(),
	"faq" jsonb,
	CONSTRAINT "businesses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"icon" varchar NOT NULL,
	"color" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"subject" varchar NOT NULL,
	"message" text NOT NULL,
	"status" varchar DEFAULT 'unread' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"sender_name" varchar NOT NULL,
	"sender_email" varchar NOT NULL,
	"sender_phone" varchar,
	"message" text NOT NULL,
	"status" varchar DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"position" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"target" text DEFAULT '_self',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ownership_claims" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"business_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"message" text,
	"admin_message" text,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" varchar NOT NULL,
	"content" text,
	"seo_title" text,
	"seo_description" text,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"author_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" text,
	"user_id" varchar,
	"author_name" text,
	"author_email" text,
	"rating" integer NOT NULL,
	"title" text,
	"comment" text,
	"status" text DEFAULT 'pending',
	"admin_notes" text,
	"created_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp,
	"reviewed_by" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"value" text,
	"description" text,
	"category" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"password" text,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" text,
	"role" varchar DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "website_faq" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" varchar DEFAULT 'general' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_ownerid_users_id_fk" FOREIGN KEY ("ownerid") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_business_id_businesses_placeid_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("placeid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ownership_claims" ADD CONSTRAINT "ownership_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ownership_claims" ADD CONSTRAINT "ownership_claims_business_id_businesses_placeid_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("placeid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ownership_claims" ADD CONSTRAINT "ownership_claims_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_business_id_businesses_placeid_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("placeid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;