-- AlterTable
ALTER TABLE `fridge_products` ADD COLUMN `quantityAmount` DOUBLE NULL,
    ADD COLUMN `quantityUnit` ENUM('g', 'ml') NULL;
