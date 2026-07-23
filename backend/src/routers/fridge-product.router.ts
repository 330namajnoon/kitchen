import { createRouter } from "sm-express-server";

import {
  addFridgeProduct,
  editFridgeProduct,
  listFridgeProducts,
  removeFridgeProduct,
} from "@/controllers/fridge-product.controller";

export const fridgeProductRouter = createRouter("/fridge-products", (router) => {
  router.get("/", listFridgeProducts);
  router.post("/", addFridgeProduct);
  router.put("/:id", editFridgeProduct);
  router.delete("/:id", removeFridgeProduct);
});
