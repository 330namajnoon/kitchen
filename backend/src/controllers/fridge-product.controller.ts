import { createController } from "sm-express-server";

import {
  createFridgeProduct,
  deleteFridgeProduct,
  getFridgeProducts,
  updateFridgeProduct,
} from "@/services/fridge-product.service";
import { logger } from "@/utils/logger";

const isNotFoundError = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === "P2025";

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

export const editFridgeProduct = createController(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Identificador de producto inválido" });
    return;
  }

  const { barcode, name, photoUrl, description, category, expirationDate, quantityRemaining, comment } = req.body;

  try {
    const product = await updateFridgeProduct(id, {
      barcode,
      name,
      photoUrl,
      description,
      category,
      expirationDate,
      quantityRemaining: quantityRemaining === undefined ? undefined : Number(quantityRemaining),
      comment,
    });
    res.json(product);
  } catch (error) {
    if (isNotFoundError(error)) {
      res.status(404).json({ error: "No se ha encontrado el producto" });
      return;
    }
    logger.error("Error actualizando producto de la nevera", error);
    res.status(500).json({ error: "No se pudo actualizar el producto" });
  }
});

export const removeFridgeProduct = createController(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Identificador de producto inválido" });
    return;
  }

  try {
    await deleteFridgeProduct(id);
    res.status(204).send();
  } catch (error) {
    if (isNotFoundError(error)) {
      res.status(404).json({ error: "No se ha encontrado el producto" });
      return;
    }
    logger.error("Error borrando producto de la nevera", error);
    res.status(500).json({ error: "No se pudo borrar el producto" });
  }
});
