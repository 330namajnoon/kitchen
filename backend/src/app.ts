import { Server } from "sm-express-server";

import { env } from "@/config/env";
import { routers } from "@/routers/index.router";

export const createApp = () => new Server(env.port, env.staticDir, [], routers, []);
