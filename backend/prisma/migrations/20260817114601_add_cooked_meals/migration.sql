-- CreateTable
CREATE TABLE `cooked_meals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cookedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `servings` INTEGER NOT NULL,
    `rating` TINYINT NULL,
    `recipeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cooked_meal_ingredients` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantityAmount` DOUBLE NOT NULL,
    `quantityUnit` ENUM('g', 'ml', 'u', 'tsp', 'tbsp', 'pinch', 'cup') NOT NULL,
    `cookedMealId` INTEGER NOT NULL,
    `genericProductId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cooked_meals` ADD CONSTRAINT `cooked_meals_recipeId_fkey` FOREIGN KEY (`recipeId`) REFERENCES `recipes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cooked_meal_ingredients` ADD CONSTRAINT `cooked_meal_ingredients_cookedMealId_fkey` FOREIGN KEY (`cookedMealId`) REFERENCES `cooked_meals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cooked_meal_ingredients` ADD CONSTRAINT `cooked_meal_ingredients_genericProductId_fkey` FOREIGN KEY (`genericProductId`) REFERENCES `generic_products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
