import { createRouter } from "sm-express-server";

import { addFridgeProduct, listFridgeProducts } from "@/controllers/fridge-product.controller";

export const fridgeProductRouter = createRouter("/fridge-products", (router) => {
  router.get("/", listFridgeProducts);
  router.post("/", addFridgeProduct);
});
