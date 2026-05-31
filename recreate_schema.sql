CREATE TABLE IF NOT EXISTS public."site_stats" (
  "id" bigint,
  "views" bigint,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."boosting" (
  "require_login" boolean,
  "rankOptions" jsonb,
  "oldPrice" numeric,
  "discountPercent" numeric,
  "allow_quantity" boolean,
  "id" bigint,
  "price" bigint,
  "game" text,
  "title" text,
  "desc" text,
  "image" text,
  "type" text,
  "priceUnit" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."comments" (
  "is_pinned" boolean,
  "created_at" timestamp with time zone,
  "parent_id" uuid,
  "is_edited" boolean,
  "edit_history" jsonb,
  "id" uuid,
  "content" text,
  "liked_by" text[],
  "disliked_by" text[],
  "reported_by" text[],
  "user_id" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."accounts" (
  "rentPricePerHour" bigint,
  "is_sold" boolean,
  "oldPrice" numeric,
  "oldRentPrice" numeric,
  "rentDiscountPercent" numeric,
  "stock" integer,
  "price" bigint,
  "id" text,
  "code" text,
  "game" text,
  "title" text,
  "tags" text,
  "description" text,
  "coverImage" text,
  "detailImages" text,
  "accUsername" text,
  "accPassword" text,
  "accEmail" text,
  "accPhone" text,
  "rentedUntil" text,
  "createdAt" text,
  "rentOptions" text,
  "tagColor" text,
  "tier" text,
  "rentStartedAt" text,
  "currentRenterId" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."users" (
  "balance" bigint,
  "spins" bigint,
  "is_locked" boolean,
  "is_email_verified" boolean,
  "is_cccd_verified" boolean,
  "savedHours" bigint,
  "rentFund" bigint,
  "is_trusted" boolean,
  "last_active" timestamp with time zone,
  "id" text,
  "name" text,
  "phone" text,
  "email" text,
  "password" text,
  "role" text,
  "created_at" text,
  "cccd_image" text,
  "cccd_number" text,
  "avatar_url" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."transactions" (
  "amount" bigint,
  "isSpinCost" boolean,
  "created_at" timestamp with time zone,
  "id" text,
  "user" text,
  "action" text,
  "date" text,
  "status" text,
  "type" text,
  "accDetails" text,
  "reqId" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."vouchers" (
  "isActive" boolean,
  "usage_limit" bigint,
  "user_limit" bigint,
  "percent" bigint,
  "bonusSpins" bigint,
  "id" text,
  "code" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."boosting_requests" (
  "boostingId" bigint,
  "created_at" timestamp with time zone,
  "id" text,
  "user" text,
  "boostingTitle" text,
  "date" text,
  "status" text,
  "info" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."wheel_items" (
  "value" bigint,
  "quantity" bigint,
  "id" text,
  "name" text,
  "type" text,
  "rate" text,
  "image" text,
  "wheel_type" text,
  "color" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."messages" (
  "timestamp" bigint,
  "isRead" boolean,
  "id" text,
  "senderId" text,
  "receiverId" text,
  "content" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."deposit_requests" (
  "amount" bigint,
  "bonusAmount" bigint,
  "voucherSpins" bigint,
  "telegram_message_id" bigint,
  "created_at" timestamp with time zone,
  "id" text,
  "user" text,
  "userId" text,
  "voucherCode" text,
  "status" text,
  "date" text,
  "details" text,
  "type" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."rent_requests" (
  "info" jsonb,
  "created_at" timestamp with time zone,
  "status" text,
  "date" text,
  "userId" text,
  "id" text,
  "user" text,
  "accCode" text,
  "time" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."site_config" (
  "value" jsonb,
  "id" text,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."voucher_usage" (
  "id" text,
  "userId" text,
  "voucherCode" text,
  "usedAt" text,
  PRIMARY KEY ("id")
);

