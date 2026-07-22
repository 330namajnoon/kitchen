const OFF_API_URL = "https://world.openfoodfacts.net/api/v3.6/product";

export class ProductLookupError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface ProductNutriments {
  'energy-kcal_100g'?: number;
  'energy-kcal_serving'?: number;
  fat_100g?: number;
  'saturated-fat_100g'?: number;
  carbohydrates_100g?: number;
  sugars_100g?: number;
  fiber_100g?: number;
  proteins_100g?: number;
  salt_100g?: number;
  sodium_100g?: number;
}

export interface Product {
  // Identificación Básica
  _id: string;
  code: string;
  product_name?: string;
  generic_name?: string;
  generic_name_es?: string;
  brands?: string;
  brands_tags?: string[];
  quantity?: string;

  // Clasificaciones y Puntuaciones de Salud/Medioambiente
  nutriscore_grade?: 'a' | 'b' | 'c' | 'd' | 'e';
  nutriscore_2023_tags?: string[];
  nova_group?: 1 | 2 | 3 | 4;
  ecoscore_grade?: 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
  ecoscore_tags?: string[];

  // Ingredientes y Alérgenos
  ingredients_text?: string;
  ingredients_text_es?: string;
  ingredients_n?: number;
  allergens_tags?: string[];
  allergens_from_ingredients?: string;
  ingredients_analysis_tags?: string[]; // Ejemplo: ['en:palm-oil-free', 'en:vegan', 'en:vegetarian']

  // Valores Nutricionales (por 100g)
  nutriments?: ProductNutriments;

  // Categorías y Etiquetas (Labels)
  categories_tags?: string[];
  labels_tags?: string[]; // Ejemplo: ['en:no-gluten', 'en:no-added-sugar']
  countries_tags?: string[];

  // Imágenes
  image_url?: string;
  image_front_url?: string;
  image_front_small_url?: string;
  image_ingredients_url?: string;
  image_nutrition_url?: string;

  // Nivel de completitud del registro en la base de datos (0.0 a 1.0)
  completeness?: number;
}

export interface ProductResponse {
  product: Product;
}

export async function getProductByBarcode(barcode: string): Promise<Product> {
  const response = await fetch(`${OFF_API_URL}/${barcode}.json`);

  if (!response.ok) {
    throw new ProductLookupError(
      response.status,
      `Open Food Facts respondió con estado ${response.status}`,
    );
  }

  const data = await response.json() as ProductResponse;

  return data.product;
};
