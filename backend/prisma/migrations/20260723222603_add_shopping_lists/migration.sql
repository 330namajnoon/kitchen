-- CreateTable
CREATE TABLE `shopping_lists` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `estimatedPurchaseDate` DATE NOT NULL,
    `status` ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shopping_list_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantityAmount` DOUBLE NOT NULL,
    `quantityUnit` ENUM('g', 'ml', 'u') NOT NULL,
    `shoppingListId` INTEGER NOT NULL,
    `genericProductId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `shopping_list_items` ADD CONSTRAINT `shopping_list_items_shoppingListId_fkey` FOREIGN KEY (`shoppingListId`) REFERENCES `shopping_lists`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shopping_list_items` ADD CONSTRAINT `shopping_list_items_genericProductId_fkey` FOREIGN KEY (`genericProductId`) REFERENCES `generic_products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
