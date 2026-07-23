import { createRouter } from "sm-express-server";

import {
  addGenericProduct,
  editGenericProduct,
  listGenericProducts,
  removeGenericProduct,
} from "@/controllers/generic-product.controller";

export const genericProductRouter = createRouter("/generic-products", (router) => {
  router.get("/", listGenericProducts);
  router.post("/", addGenericProduct);
  router.put("/:id", editGenericProduct);
  router.delete("/:id", removeGenericProduct);
});
