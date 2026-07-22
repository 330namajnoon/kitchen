import { createRouter } from "sm-express-server";

import { getHealth } from "@/controllers/health.controller";

export const healthRouter = createRouter("/health", (router) => {
  router.get("/", getHealth);
});
