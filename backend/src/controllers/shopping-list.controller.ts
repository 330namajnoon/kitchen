import { createController } from "sm-express-server";

import {
  createShoppingList,
  deleteShoppingList,
  getShoppingLists,
  updateShoppingList,
  type ShoppingListItemInput,
  type ShoppingListStatus,
} from "@/services/shopping-list.service";
import { logger } from "@/utils/logger";

const isNotFoundError = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === "P2025";

/** Valida y normaliza el body de productos; devuelve null si el formato es inválido. */
const parseItems = (input: unknown): ShoppingListItemInput[] | null => {
  if (!Array.isArray(input)) return null;

  const items: ShoppingListItemInput[] = [];
  for (const item of input) {
    if (typeof item !== "object" || item === null) return null;
    const { genericProductId, quantityAmount, quantityUnit } = item as Record<string, unknown>;

    if (
      genericProductId === undefined ||
      quantityAmount === undefined ||
      !["g", "ml", "u", "tsp", "tbsp", "pinch", "cup"].includes(quantityUnit as string)
    ) {
      return null;
    }

    items.push({
      genericProductId: Number(genericProductId),
      quantityAmount: Number(quantityAmount),
      quantityUnit: quantityUnit as "g" | "ml" | "u" | "tsp" | "tbsp" | "pinch" | "cup",
    });
  }

  return items;
};

const parseStatus = (input: unknown): ShoppingListStatus | null => {
  if (input === undefined) return null;
  return ["pending", "completed"].includes(input as string) ? (input as ShoppingListStatus) : null;
};

export const addShoppingList = createController(async (req, res) => {
  const { estimatedPurchaseDate, status, items } = req.body;

  if (!estimatedPurchaseDate) {
    res.status(400).json({ error: "Faltan campos obligatorios" });
    return;
  }

  const parsedItems = parseItems(items ?? []);
  if (!parsedItems) {
    res.status(400).json({ error: "Lista de productos inválida" });
    return;
  }

  let parsedStatus: ShoppingListStatus | undefined;
  if (status !== undefined) {
    const parsed = parseStatus(status);
    if (!parsed) {
      res.status(400).json({ error: "Estado inválido" });
      return;
    }
    parsedStatus = parsed;
  }

  try {
    const shoppingList = await createShoppingList({
      estimatedPurchaseDate: new Date(estimatedPurchaseDate),
      status: parsedStatus,
      items: parsedItems,
    });
    res.status(201).json(shoppingList);
  } catch (error) {
    logger.error("Error guardando lista de la compra", error);
    res.status(500).json({ error: "No se pudo guardar la lista de la compra" });
  }
});

export const listShoppingLists = createController(async (_req, res) => {
  try {
    const shoppingLists = await getShoppingLists();
    res.json(shoppingLists);
  } catch (error) {
    logger.error("Error obteniendo listas de la compra", error);
    res.status(500).json({ error: "No se pudo obtener el listado de listas de la compra" });
  }
});

export const editShoppingList = createController(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Identificador de lista de la compra inválido" });
    return;
  }

  const { estimatedPurchaseDate, status, items } = req.body;

  let parsedItems: ShoppingListItemInput[] | undefined;
  if (items !== undefined) {
    const parsed = parseItems(items);
    if (!parsed) {
      res.status(400).json({ error: "Lista de productos inválida" });
      return;
    }
    parsedItems = parsed;
  }

  let parsedStatus: ShoppingListStatus | undefined;
  if (status !== undefined) {
    const parsed = parseStatus(status);
    if (!parsed) {
      res.status(400).json({ error: "Estado inválido" });
      return;
    }
    parsedStatus = parsed;
  }

  try {
    const shoppingList = await updateShoppingList(id, {
      estimatedPurchaseDate: estimatedPurchaseDate ? new Date(estimatedPurchaseDate) : undefined,
      status: parsedStatus,
      items: parsedItems,
    });
    res.json(shoppingList);
  } catch (error) {
    if (isNotFoundError(error)) {
      res.status(404).json({ error: "No se ha encontrado la lista de la compra" });
      return;
    }
    logger.error("Error actualizando lista de la compra", error);
    res.status(500).json({ error: "No se pudo actualizar la lista de la compra" });
  }
});

export const removeShoppingList = createController(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Identificador de lista de la compra inválido" });
    return;
  }

  try {
    await deleteShoppingList(id);
    res.status(204).send();
  } catch (error) {
    if (isNotFoundError(error)) {
      res.status(404).json({ error: "No se ha encontrado la lista de la compra" });
      return;
    }
    logger.error("Error borrando lista de la compra", error);
    res.status(500).json({ error: "No se pudo borrar la lista de la compra" });
  }
});
