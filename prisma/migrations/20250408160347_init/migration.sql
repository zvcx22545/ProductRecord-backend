-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(255),
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "department" VARCHAR(255),
    "position" VARCHAR(255),
    "role" VARCHAR(50) NOT NULL,
    "create_date" DATE,
    "update_date" DATE,
    "password" VARCHAR(255),
    "profile_image" VARCHAR(255),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" SERIAL NOT NULL,
    "product_name" VARCHAR(255),
    "user_used" VARCHAR(255),
    "product_id" VARCHAR(255),
    "price" INTEGER,
    "department" VARCHAR(255),
    "product_type" VARCHAR(255),
    "image" VARCHAR(255),
    "add_by_user" VARCHAR(255),
    "create_date" DATE,
    "update_date" DATE,
    "user_used_id" VARCHAR(255),

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_id_key" ON "users"("user_id");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_user_used_id_fkey" FOREIGN KEY ("user_used_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
