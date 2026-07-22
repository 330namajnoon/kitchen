import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV ?? "development",
  staticDir: process.env.STATIC_DIR ?? "./public",
  mariadb: {
    port: Number(process.env.MARIADB_PORT) || 3306,
    database: process.env.MARIADB_DATABASE ?? "kitchen",
    user: process.env.MARIADB_USER ?? "kitchen",
    password: process.env.MARIADB_PASSWORD ?? "kitchen",
    rootPassword: process.env.MARIADB_ROOT_PASSWORD ?? "root",
  },
};
