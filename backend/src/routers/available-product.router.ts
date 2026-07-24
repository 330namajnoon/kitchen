import { createRouter } from "sm-express-server";

import {
  addAvailableProducts,
  editAvailableProductPercentage,
  getAvailableProduct,
  listAvailableProducts,
  removeAvailableProduct,
} from "@/controllers/available-product.controller";

export const availableProductRouter = createRouter("/available-products", (router) => {
  router.get("/", listAvailableProducts);
  router.get("/:id", getAvailableProduct);
  router.post("/", addAvailableProducts);
  router.put("/:id", editAvailableProductPercentage);
  router.delete("/:id", removeAvailableProduct);
});
