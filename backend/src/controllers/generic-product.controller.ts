import { createController } from "sm-express-server";

import {
  createGenericProduct,
  deleteGenericProduct,
  getGenericProducts,
  updateGenericProduct,
} from "@/services/generic-product.service";
import { logger } from "@/utils/logger";

const isNotFoundError = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === "P2025";

const isUniqueConstraintError = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === "P2002";

export const addGenericProduct = createController(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400).json({ error: "Faltan campos obligatorios" });
    return;
  }

  try {
    const product = await createGenericProduct({ name, description });
    res.status(201).json(product);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      res.status(409).json({ error: "Ya existe un producto genérico con ese nombre" });
      return;
    }
    logger.error("Error guardando producto genérico", error);
    res.status(500).json({ error: "No se pudo guardar el producto genérico" });
  }
});

export const listGenericProducts = createController(async (_req, res) => {
  try {
    const products = await getGenericProducts();
    res.json(products);
  } catch (error) {
    logger.error("Error obteniendo productos genéricos", error);
    res.status(500).json({ error: "No se pudo obtener el listado de productos genéricos" });
  }
});

export const editGenericProduct = createController(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Identificador de producto inválido" });
    return;
  }

  const { name, description } = req.body;

  try {
    const product = await updateGenericProduct(id, { name, description });
    res.json(product);
  } catch (error) {
    if (isNotFoundError(error)) {
      res.status(404).json({ error: "No se ha encontrado el producto" });
      return;
    }
    if (isUniqueConstraintError(error)) {
      res.status(409).json({ error: "Ya existe un producto genérico con ese nombre" });
      return;
    }
    logger.error("Error actualizando producto genérico", error);
    res.status(500).json({ error: "No se pudo actualizar el producto" });
  }
});

export const removeGenericProduct = createController(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Identificador de producto inválido" });
    return;
  }

  try {
    await deleteGenericProduct(id);
    res.status(204).send();
  } catch (error) {
    if (isNotFoundError(error)) {
      res.status(404).json({ error: "No se ha encontrado el producto" });
      return;
    }
    logger.error("Error borrando producto genérico", error);
    res.status(500).json({ error: "No se pudo borrar el producto" });
  }
});
