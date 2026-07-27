-- AlterTable
ALTER TABLE `products` DROP COLUMN `expirationDate`;

-- AlterTable
ALTER TABLE `available_products` ADD COLUMN `expirationDate` DATE NULL;
