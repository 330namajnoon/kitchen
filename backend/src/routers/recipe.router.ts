import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { createRouter } from "sm-express-server";

import { addRecipe, editRecipe, listRecipes, removeRecipe, uploadRecipePhoto } from "@/controllers/recipe.controller";
import { env } from "@/config/env";

const recipePhotosDir = path.join(env.staticDir, "uploads/recipes");
fs.mkdirSync(recipePhotosDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: recipePhotosDir,
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`),
  }),
});

export const recipeRouter = createRouter("/recipes", (router) => {
  router.get("/", listRecipes);
  router.post("/", addRecipe);
  router.put("/:id", editRecipe);
  router.delete("/:id", removeRecipe);
  router.post("/photo", upload.single("photo"), uploadRecipePhoto);
});
