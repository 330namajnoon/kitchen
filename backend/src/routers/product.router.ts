import { createRouter } from "sm-express-server";

import {
  addProduct,
  editProduct,
  listProducts,
  removeProduct,
} from "@/controllers/product.controller";

export const productRouter = createRouter("/products", (router) => {
  router.get("/", listProducts);
  router.post("/", addProduct);
  router.put("/:id", editProduct);
  router.delete("/:id", removeProduct);
});
