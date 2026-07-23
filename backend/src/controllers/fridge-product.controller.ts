import { createController } from "sm-express-server";

import { createFridgeProduct, getFridgeProducts } from "@/services/fridge-product.service";
import { logger } from "@/utils/logger";

export const addFridgeProduct = createController(async (req, res) => {
  const { barcode, name, photoUrl, description, category, expirationDate, quantityRemaining, comment } = req.body;

  if (!barcode || !description || !category || !expirationDate || quantityRemaining === undefined) {
    res.status(400).json({ error: "Faltan campos obligatorios" });
    return;
  }

  try {
    const product = await createFridgeProduct({
      barcode,
      name,
      photoUrl,
      description,
      category,
      expirationDate,
      quantityRemaining: Number(quantityRemaining),
      comment,
    });
    res.status(201).json(product);
  } catch (error) {
    logger.error("Error guardando producto en la nevera", error);
    res.status(500).json({ error: "No se pudo guardar el producto" });
  }
});

export const listFridgeProducts = createController(async (_req, res) => {
  try {
    const products = await getFridgeProducts();
    res.json(products);
  } catch (error) {
    logger.error("Error obteniendo productos de la nevera", error);
    res.status(500).json({ error: "No se pudo obtener el listado de productos" });
  }
});
