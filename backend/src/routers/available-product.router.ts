import { createRouter } from "sm-express-server";

import {
  addAvailableProducts,
  consumeAvailableProducts,
  editAvailableProduct,
  getAvailableProduct,
  listAvailableProducts,
  removeAvailableProduct,
} from "@/controllers/available-product.controller";

export const availableProductRouter = createRouter("/available-products", (router) => {
  router.get("/", listAvailableProducts);
  router.get("/:id", getAvailableProduct);
  router.post("/", addAvailableProducts);
  router.post("/consume", consumeAvailableProducts);
  router.put("/:id", editAvailableProduct);
  router.delete("/:id", removeAvailableProduct);
});
