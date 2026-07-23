import { createRouter } from "sm-express-server";

import { getProduct } from "@/controllers/product-lookup.controller";

export const productLookupRouter = createRouter("/product-lookup", (router) => {
  router.get("/:barcode", getProduct);
});
