import { connect } from "node:net";
import { rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const shouldClean = process.argv.includes("--clean");
const host = process.env.WEB_DEV_HOST || "localhost";
const port = Number(process.env.WEB_DEV_PORT || 3000);

function assertPortAvailable(portToCheck, hostToCheck) {
  return new Promise((resolveCheck, rejectCheck) => {
    const socket = connect({ host: hostToCheck, port: portToCheck });

    socket.once("connect", () => {
      socket.destroy();
      rejectCheck(
        new Error(
          `Port ${portToCheck} is already in use. Stop the existing web process before running npm run dev:web.`
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

if (process.argv.includes("--help")) {
  console.log("Usage: npm run dev:web [-- --clean]");
  console.log("       npm run dev:web:clean");
  process.exit(0);
}

if (shouldClean) {
  rmSync(resolve(rootDir, "apps/web/.next"), { force: true, recursive: true });
}

const hostsToCheck = host === "localhost" ? ["127.0.0.1", "::1"] : [host];
await Promise.all(hostsToCheck.map((hostToCheck) => assertPortAvailable(port, hostToCheck)));

const child = spawn(
  "npm",
  ["run", "dev", "--workspace=apps/web", "--", "--hostname", host, "--port", String(port)],
  {
    cwd: rootDir,
    env: process.env,
    stdio: "inherit",
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
