import express from "express";
import { Server } from "sm-express-server";

import { env } from "@/config/env";
import { requireAuth } from "@/middlewares/require-auth.middleware";
import { spaFallback } from "@/middlewares/spa-fallback.middleware";
import { routers } from "@/routers/index.router";

export const createApp = () =>
  new Server(env.port, env.staticDir, [express.json(), spaFallback, requireAuth], routers, []);
