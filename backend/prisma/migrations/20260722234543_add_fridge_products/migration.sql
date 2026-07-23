-- CreateTable
CREATE TABLE `fridge_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `barcode` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NULL,
    `photoUrl` VARCHAR(500) NULL,
    `description` VARCHAR(500) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `expirationDate` DATE NOT NULL,
    `quantityRemaining` TINYINT NOT NULL,
    `comment` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
