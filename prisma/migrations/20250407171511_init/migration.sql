/*
  Warnings:

  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_password_key";

-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "username",
ADD COLUMN     "department" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "product" (
    "id" SERIAL NOT NULL,
    "product_name" TEXT,
    "user_used" TEXT,
    "product_id" TEXT,
    "price" TEXT,
    "department" TEXT,
    "product_type" TEXT,
    "image" TEXT,
    "add_by_user" TEXT,
    "create_date" TIMESTAMP(3),
    "update_date" TIMESTAMP(3),

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_user_used_fkey" FOREIGN KEY ("user_used") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
