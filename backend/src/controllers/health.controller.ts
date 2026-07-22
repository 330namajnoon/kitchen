import { createController } from "sm-express-server";

import { getHealthStatus } from "@/services/health.service";

export const getHealth = createController((_req, res) => {
  res.json(getHealthStatus());
});
