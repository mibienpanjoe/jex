#!/usr/bin/env node
"use strict";

/**
 * postinstall.js — downloads the correct jex binary for the current platform
 * from the GitHub releases page and places it in packages/npm-wrapper/binaries/.
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const VERSION = process.env.JEX_VERSION || "v0.1.0";
const GITHUB_REPO = "jex-app/jex";

const platform = process.platform;
const arch = process.arch;

const platformMap = { linux: "linux", darwin: "darwin", win32: "windows" };
const archMap = { x64: "amd64", arm64: "arm64" };

const goPlatform = platformMap[platform];
const goArch = archMap[arch];

if (!goPlatform || !goArch) {
  console.error(`Unsupported platform: ${platform}/${arch}. Skipping binary download.`);
  process.exit(0);
}

const ext = platform === "win32" ? ".exe" : "";
const binaryName = `jex-${goPlatform}-${goArch}${ext}`;
const downloadURL = `https://github.com/${GITHUB_REPO}/releases/download/${VERSION}/${binaryName}`;

const binDir = path.join(__dirname, "..", "binaries");
const destPath = path.join(binDir, binaryName);

if (fs.existsSync(destPath)) {
  console.log(`jex binary already present: ${binaryName}`);
  process.exit(0);
}

fs.mkdirSync(binDir, { recursive: true });

console.log(`Downloading ${downloadURL} ...`);

function download(url, dest, redirects = 0) {
  if (redirects > 5) {
    console.error("Too many redirects");
    process.exit(1);
  }
  https.get(url, (res) => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      download(res.headers.location, dest, redirects + 1);
      return;
    }
    if (res.statusCode !== 200) {
      console.error(`Download failed: HTTP ${res.statusCode} from ${url}`);
      console.error("You can manually place the binary at: " + dest);
      process.exit(0); // Non-fatal so npm install completes.
    }
    const file = fs.createWriteStream(dest, { mode: 0o755 });
    res.pipe(file);
    file.on("finish", () => {
      file.close();
      console.log(`Downloaded jex to ${dest}`);
    });
  }).on("error", (err) => {
    fs.unlink(dest, () => {});
    console.error(`Download error: ${err.message}`);
    console.error("You can manually place the binary at: " + dest);
    process.exit(0); // Non-fatal.
  });
}

download(downloadURL, destPath);
