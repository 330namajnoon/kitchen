-- AlterTable
ALTER TABLE `fridge_products` ADD COLUMN `genericProductId` INTEGER NULL;

-- CreateTable
CREATE TABLE `generic_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `generic_products_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fridge_products` ADD CONSTRAINT `fridge_products_genericProductId_fkey` FOREIGN KEY (`genericProductId`) REFERENCES `generic_products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
