import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { createRouter } from "sm-express-server";

import {
  addProduct,
  editProduct,
  listProducts,
  removeProduct,
  uploadProductPhoto,
} from "@/controllers/product.controller";
import { env } from "@/config/env";

const productPhotosDir = path.join(env.staticDir, "uploads/products");
fs.mkdirSync(productPhotosDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: productPhotosDir,
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`),
  }),
});

export const productRouter = createRouter("/products", (router) => {
  router.get("/", listProducts);
  router.post("/", addProduct);
  router.put("/:id", editProduct);
  router.delete("/:id", removeProduct);
  router.post("/photo", upload.single("photo"), uploadProductPhoto);
});
