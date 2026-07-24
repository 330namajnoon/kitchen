import { createController } from "sm-express-server";

import {
  createAvailableProducts,
  deleteAvailableProduct,
  getAvailableProductById,
  getAvailableProducts,
  updateAvailableProductPercentage,
  type AvailableProductItemInput,
} from "@/services/available-product.service";
import { logger } from "@/utils/logger";

const isNotFoundError = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === "P2025";

const parseItems = (input: unknown): AvailableProductItemInput[] | null => {
  if (!Array.isArray(input) || input.length === 0) return null;

  const items: AvailableProductItemInput[] = [];
  for (const item of input) {
    if (typeof item !== "object" || item === null) return null;
    const { productId, quantity } = item as Record<string, unknown>;

    if (productId === undefined || quantity === undefined) return null;

    const parsedProductId = Number(productId);
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedProductId) || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0) return null;

    items.push({ productId: parsedProductId, quantity: parsedQuantity });
  }

  return items;
};

export const addAvailableProducts = createController(async (req, res) => {
  const parsedItems = parseItems(req.body.items);

  if (!parsedItems) {
    res.status(400).json({ error: "Lista de productos inválida" });
    return;
  }

  try {
    const availableProducts = await createAvailableProducts(parsedItems);
    res.status(201).json(availableProducts);
  } catch (error) {
    logger.error("Error guardando productos disponibles", error);
    res.status(500).json({ error: "No se pudo guardar la compra" });
  }
});

export const listAvailableProducts = createController(async (_req, res) => {
  try {
    const availableProducts = await getAvailableProducts();
    res.json(availableProducts);
  } catch (error) {
    logger.error("Error obteniendo productos disponibles", error);
    res.status(500).json({ error: "No se pudo obtener el listado de productos disponibles" });
  }
});

export const getAvailableProduct = createController(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Identificador de producto disponible inválido" });
    return;
  }

  try {
    const availableProduct = await getAvailableProductById(id);
    res.json(availableProduct);
  } catch (error) {
    if (isNotFoundError(error)) {
      res.status(404).json({ error: "No se ha encontrado el producto disponible" });
      return;
    }
    logger.error("Error obteniendo producto disponible", error);
    res.status(500).json({ error: "No se pudo obtener el producto disponible" });
  }
});

export const editAvailableProductPercentage = createController(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Identificador de producto disponible inválido" });
    return;
  }

  const { percentageRemaining } = req.body;
  const parsedPercentage = Number(percentageRemaining);

  if (!Number.isInteger(parsedPercentage) || parsedPercentage < 0 || parsedPercentage > 100) {
    res.status(400).json({ error: "Porcentaje restante inválido" });
    return;
  }

  try {
    const availableProduct = await updateAvailableProductPercentage(id, parsedPercentage);
    res.json(availableProduct);
  } catch (error) {
    if (isNotFoundError(error)) {
      res.status(404).json({ error: "No se ha encontrado el producto disponible" });
      return;
    }
    logger.error("Error actualizando producto disponible", error);
    res.status(500).json({ error: "No se pudo actualizar el producto disponible" });
  }
});

export const removeAvailableProduct = createController(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Identificador de producto disponible inválido" });
    return;
  }

  try {
    await deleteAvailableProduct(id);
    res.status(204).send();
  } catch (error) {
    if (isNotFoundError(error)) {
      res.status(404).json({ error: "No se ha encontrado el producto disponible" });
      return;
    }
    logger.error("Error borrando producto disponible", error);
    res.status(500).json({ error: "No se pudo borrar el producto disponible" });
  }
});
