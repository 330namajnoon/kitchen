import fs from "node:fs/promises";
import { createController } from "sm-express-server";

import { detectProductFromImage, ProductDetectError } from "@/services/product-detect.service";
import { logger } from "@/utils/logger";

export const detectProduct = createController(async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No se ha subido ninguna imagen" });
    return;
  }

  try {
    const imageBuffer = await fs.readFile(file.path);
    const detected = await detectProductFromImage(imageBuffer, file.mimetype);
    res.json({
      ...detected,
      productImage: `/uploads/products-ai/${file.filename}`,
      productImageFrontUrl: `/uploads/products-ai/${file.filename}`,
    });
  } catch (error) {
    if (error instanceof ProductDetectError) {
      res.status(502).json({ error: error.message });
      return;
    }

    logger.error("Error detectando producto con Gemini", error);
    res.status(502).json({ error: "No se ha podido analizar la imagen" });
  }
});
