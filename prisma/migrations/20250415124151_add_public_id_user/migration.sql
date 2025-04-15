/*
  Warnings:

  - You are about to alter the column `image_public_id` on the `product` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "product" ALTER COLUMN "image_public_id" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profile_image_public_id" VARCHAR(255);
