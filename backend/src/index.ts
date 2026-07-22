import { createApp } from "@/app";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

const server = createApp();

server.start(() => {
  logger.info(`Server listening on port ${env.port} (${env.nodeEnv})`);
});
