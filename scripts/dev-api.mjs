import { connect } from "node:net";
import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const envPath = resolve(rootDir, "apps/api/.env");

function parseEnvFile(path) {
  if (!existsSync(path)) {
    throw new Error(`Missing ${path}. Copy apps/api/.env.example and fill the required values.`);
  }

  const env = {};
  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function assertPortAvailable(port, host) {
  return new Promise((resolveCheck, rejectCheck) => {
    const socket = connect({ host, port });

    socket.once("connect", () => {
      socket.destroy();
      rejectCheck(
        new Error(
          `Port ${port} is already in use. Stop the existing API process before running npm run dev:api.`
        )
      );
    });

    socket.once("error", (error) => {
      if (["ECONNREFUSED", "EHOSTUNREACH", "ENETUNREACH"].includes(error.code)) {
        resolveCheck();
        return;
      }

      rejectCheck(error);
    });
  });
}

const apiEnv = parseEnvFile(envPath);
const port = Number(apiEnv.PORT || process.env.PORT || 3001);

if (process.argv.includes("--help")) {
  console.log("Usage: npm run dev:api");
  process.exit(0);
}

await assertPortAvailable(port, "127.0.0.1");

const child = spawn("npm", ["run", "dev", "--workspace=apps/api"], {
  cwd: rootDir,
  env: { ...process.env, ...apiEnv },
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
