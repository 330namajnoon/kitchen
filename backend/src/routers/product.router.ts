import { createRouter } from "sm-express-server";

import { getProduct } from "@/controllers/product.controller";

export const productRouter = createRouter("/products", (router) => {
  router.get("/:barcode", getProduct);
});
