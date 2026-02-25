import pg from "pg";
import {
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
} from "./config.js";

const DB_MODE_LOCAL = "local";
const DB_MODE_PRODUCTION = "production";

const normalizeDbMode = (value) => {
  if (!value) return null;

  const normalized = String(value).trim().toLowerCase();
  if (["local", "localhost", "dev"].includes(normalized)) return DB_MODE_LOCAL;
  if (["production", "prod", "remote"].includes(normalized)) {
    return DB_MODE_PRODUCTION;
  }

  return null;
};

const getCliDbMode = () => {
  const dbArg = process.argv.find((arg) => arg.startsWith("--db="));
  if (dbArg) return dbArg.split("=")[1];

  const dbArgIndex = process.argv.findIndex((arg) => arg === "--db");
  if (dbArgIndex >= 0) return process.argv[dbArgIndex + 1];

  return null;
};

const rawCliMode = getCliDbMode();
const cliDbMode = normalizeDbMode(rawCliMode);
const rawEnvDbMode = process.env.DB_MODE;
const envDbMode = normalizeDbMode(rawEnvDbMode);
const legacyDbMode =
  String(process.env.USE_LOCAL_DB).toLowerCase() === "true"
    ? DB_MODE_LOCAL
    : DB_MODE_PRODUCTION;

if (rawCliMode && !cliDbMode) {
  console.warn(
    `[DB] Valor invalido en --db="${rawCliMode}". Usando DB_MODE o USE_LOCAL_DB.`
  );
}

if (rawEnvDbMode && !envDbMode) {
  console.warn(
    `[DB] Valor invalido en DB_MODE="${rawEnvDbMode}". Usando USE_LOCAL_DB.`
  );
}

export const ACTIVE_DB_MODE = cliDbMode || envDbMode || legacyDbMode;
export const DB_MODE_SOURCE = cliDbMode
  ? "CLI --db"
  : envDbMode
  ? "DB_MODE"
  : "USE_LOCAL_DB";

const isLocal = ACTIVE_DB_MODE === DB_MODE_LOCAL;

const localPoolConfig = {
  user: DB_USER,
  host: DB_HOST,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: Number(DB_PORT),
};

const remoteConnectionString = process.env.DATABASE_URL;
if (!isLocal && !remoteConnectionString) {
  throw new Error(
    "[DB] DATABASE_URL no esta definida para conexion de produccion."
  );
}

const remotePoolConfig = {
  connectionString: remoteConnectionString,
  ssl: { rejectUnauthorized: false },
};

const poolConfig = isLocal ? localPoolConfig : remotePoolConfig;

export const pool = new pg.Pool(poolConfig);

pool.on("error", (error) => {
  console.error("[DB] Error inesperado en el pool:", error.message);
});
