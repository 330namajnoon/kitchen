import { createController } from "sm-express-server";

import {
  getProductByBarcode,
  ProductLookupError,
} from "@/services/product-lookup.service";
import { logger } from "@/utils/logger";

export const getProduct = createController(async (req, res) => {
  const { barcode } = req.params;

  try {
    const product = await getProductByBarcode(barcode);
    res.json({
      productName: product.product_name,
      productImage: product.image_url,
      productBrands: product.brands,
      productQuantity: product.quantity,
      productNutriscore: product.nutriscore_grade,
      productNovaGroup: product.nova_group,
      productEcoscore: product.ecoscore_grade,
      productIngredients: product.ingredients_text,
      productAllergens: product.allergens_tags,
      productNutriments: product.nutriments,
      productCategories: product.categories_tags,
      productLabels: product.labels_tags,
      productCountries: product.countries_tags,
      productCompleteness: product.completeness,
      productIngredientsAnalysis: product.ingredients_analysis_tags,
      productGenericName: product.generic_name,
      productGenericNameEs: product.generic_name_es,
      productIngredientsTextEs: product.ingredients_text_es,
      productImageFrontUrl: product.image_front_url,
      productImageFrontSmallUrl: product.image_front_small_url,
      productImageIngredientsUrl: product.image_ingredients_url,
      productImageNutritionUrl: product.image_nutrition_url,
      productBrandsTags: product.brands_tags,
      productNutriscore2023Tags: product.nutriscore_2023_tags,
      productEcoscoreTags: product.ecoscore_tags,
    });
  } catch (error) {
    if (error instanceof ProductLookupError) {
      res.status(error.status).json({ error: error.message });
      return;
    }

    logger.error("Error consultando Open Food Facts", error);
    res.status(502).json({ error: "No se pudo consultar Open Food Facts" });
  }
});
