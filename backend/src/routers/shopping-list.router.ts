import { createRouter } from "sm-express-server";

import { addShoppingList, editShoppingList, listShoppingLists, removeShoppingList } from "@/controllers/shopping-list.controller";

export const shoppingListRouter = createRouter("/shopping-lists", (router) => {
  router.get("/", listShoppingLists);
  router.post("/", addShoppingList);
  router.put("/:id", editShoppingList);
  router.delete("/:id", removeShoppingList);
});
