-- RenameTable
RENAME TABLE `fridge_products` TO `products`;

-- RenameForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `fridge_products_genericProductId_fkey`;
ALTER TABLE `products` ADD CONSTRAINT `products_genericProductId_fkey` FOREIGN KEY (`genericProductId`) REFERENCES `generic_products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
