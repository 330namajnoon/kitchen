-- AlterTable
ALTER TABLE `fridge_products` ADD COLUMN `price` DOUBLE NULL,
    MODIFY `quantityUnit` ENUM('g', 'ml', 'u') NULL;
