import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import { env } from "@/config/env";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: env.mariadb.port,
  database: env.mariadb.database,
  user: env.mariadb.user,
  password: env.mariadb.password,
});

export const prisma = new PrismaClient({ adapter });
