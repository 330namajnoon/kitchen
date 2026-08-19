import { GoogleGenAI, Type } from "@google/genai";

import { env } from "@/config/env";

// Fijado a una versión concreta en vez del alias "gemini-flash-latest": ese alias empezó a
// devolver 500/503 de forma persistente (18/08/2026) mientras el modelo concreto funcionaba con
// la misma API key. Si Google vuelve a deprecar esta versión, revisar los modelos disponibles en
// https://aistudio.google.com/apikey.
const GEMINI_MODEL = "gemini-3.6-flash";

export class ProductDetectError extends Error {}

/** Igual forma que ProductLookupResponse (product-lookup.controller.ts), pero solo con los
 * campos que una foto de envase puede razonablemente inferir: no incluye Nutri-Score,
 * Eco-Score, Nova ni nutrientes, que son puntuaciones calculadas por Open Food Facts y no algo
 * que la IA deba inventar a partir de una imagen. */
export interface DetectedProduct {
  productName?: string;
  productBrands?: string;
  productQuantity?: string;
  productGenericName?: string;
  productGenericNameEs?: string;
  productIngredientsTextEs?: string;
  productCategories?: string[];
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    productName: { type: Type.STRING, nullable: true },
    productBrands: { type: Type.STRING, nullable: true },
    productQuantity: { type: Type.STRING, nullable: true },
    productGenericName: { type: Type.STRING, nullable: true },
    productGenericNameEs: { type: Type.STRING, nullable: true },
    productIngredientsTextEs: { type: Type.STRING, nullable: true },
    productCategories: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
  },
};

const PROMPT = `Eres un asistente que identifica productos de alimentación o droguería a partir de
una foto de su envase. Analiza la imagen y devuelve un JSON con esta información, en español,
dejando un campo como null si no se puede determinar a partir de la imagen:

- productName: nombre del producto tal y como aparece en el envase (incluyendo la marca si forma
  parte del nombre comercial).
- productBrands: marca o marcas del producto, separadas por coma si hay varias.
- productQuantity: cantidad/formato del envase tal y como aparece impreso (ej. "500 g", "1 l").
- productGenericName: nombre genérico corto del producto en inglés (ej. "whole milk").
- productGenericNameEs: nombre genérico corto del producto en español (ej. "leche entera").
- productIngredientsTextEs: lista de ingredientes en español si es legible en el envase, tal cual
  aparece impresa.
- productCategories: 1-3 categorías del producto en español, de más general a más específica
  (ej. ["lácteos", "leche"]).

No inventes datos que no se puedan leer o inferir razonablemente de la imagen.`;

let client: GoogleGenAI | null = null;

const getClient = () => {
  if (!env.geminiApiKey) {
    throw new ProductDetectError("Falta configurar GEMINI_API_KEY en el backend");
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: env.geminiApiKey });
  }
  return client;
};

export async function detectProductFromImage(imageBuffer: Buffer, mimeType: string): Promise<DetectedProduct> {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: imageBuffer.toString("base64") } },
          { text: PROMPT },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new ProductDetectError("Gemini no ha devuelto ningún resultado");
  }

  try {
    return JSON.parse(text) as DetectedProduct;
  } catch {
    throw new ProductDetectError("La respuesta de Gemini no es un JSON válido");
  }
}
