#!/usr/bin/env node
"use strict";

const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const platform = process.platform; // "linux", "darwin", "win32"
const arch = process.arch;         // "x64", "arm64"

const platformMap = {
  linux: "linux",
  darwin: "darwin",
  win32: "windows",
};

const archMap = {
  x64: "amd64",
  arm64: "arm64",
};

const goPlatform = platformMap[platform];
const goArch = archMap[arch];

if (!goPlatform || !goArch) {
  console.error(`Unsupported platform: ${platform}/${arch}`);
  process.exit(1);
}

const ext = platform === "win32" ? ".exe" : "";
const binaryName = `jex-${goPlatform}-${goArch}${ext}`;
const binaryPath = path.join(__dirname, "..", "binaries", binaryName);

if (!fs.existsSync(binaryPath)) {
  console.error(
    `jex binary not found for ${goPlatform}/${goArch}.\n` +
    `Expected: ${binaryPath}\n` +
    `Run 'npm install' to trigger the postinstall script.`
  );
  process.exit(1);
}

try {
  execFileSync(binaryPath, process.argv.slice(2), { stdio: "inherit" });
} catch (err) {
  process.exit(err.status ?? 1);
}
