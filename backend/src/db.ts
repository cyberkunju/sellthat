import postgres from "postgres";

import { config } from "./config";

export const sql = postgres(config.databaseUrl, {
  connect_timeout: 8,
  idle_timeout: 20,
  max: 10,
});

export type DatabaseClient = typeof sql;

export default sql;
