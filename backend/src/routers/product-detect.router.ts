import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { createRouter } from "sm-express-server";

import { detectProduct } from "@/controllers/product-detect.controller";
import { env } from "@/config/env";

const productPhotosDir = path.join(env.staticDir, "uploads/products-ai");
fs.mkdirSync(productPhotosDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: productPhotosDir,
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`),
  }),
});

export const productDetectRouter = createRouter("/product-detect", (router) => {
  router.post("/", upload.single("photo"), detectProduct);
});
