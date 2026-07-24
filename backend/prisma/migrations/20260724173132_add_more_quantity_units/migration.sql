-- AlterTable
ALTER TABLE `products` MODIFY `quantityUnit` ENUM('g', 'ml', 'u', 'tsp', 'tbsp', 'pinch', 'cup') NULL;

-- AlterTable
ALTER TABLE `recipe_ingredients` MODIFY `quantityUnit` ENUM('g', 'ml', 'u', 'tsp', 'tbsp', 'pinch', 'cup') NOT NULL;

-- AlterTable
ALTER TABLE `shopping_list_items` MODIFY `quantityUnit` ENUM('g', 'ml', 'u', 'tsp', 'tbsp', 'pinch', 'cup') NOT NULL;
