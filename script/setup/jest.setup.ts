import fs from "fs";
import { parseEnv } from "util";

/**
 * ENV_FILE is injected by each jest config via `globals` and points to the
 * project-root .env file. setupFiles runs before any test module is imported,
 * so process.env is ready when utils/comm/config.ts is evaluated.
 *
 * Note: process.loadEnvFile() writes through Node's internal binding and is
 * invisible to Jest's copied process.env sandbox, so we parse + assign here.
 * Existing environment variables take precedence; a missing .env is not an error.
 */
declare const ENV_FILE: string;

if (fs.existsSync(ENV_FILE)) {
  const parsed = parseEnv(fs.readFileSync(ENV_FILE, "utf-8"));
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

console.log = jest.requireActual("console").log;
