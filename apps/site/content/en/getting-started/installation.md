# Installation

## Requirements

- Node.js 18 or later (for the npm wrapper)
- A running self-hosted Jex instance
- A Jex account created on your team's own dashboard

Jex does not provide a hosted cloud vault. Before installing the CLI for daily use, deploy the API, dashboard, and database for your team. See [Self-Host First](/en/docs/getting-started/self-host-first) and [Self-Hosting](/en/docs/self-hosting).

## Install the CLI

The `jex` CLI is distributed as a compiled Go binary wrapped in an npm package.

```bash
npm install -g jex-secrets
```

This installs the `jex` binary on your PATH. The postinstall script downloads
the correct binary for your platform (linux/darwin × amd64/arm64).

Verify the installation:

```bash
jex version
# jex v0.1.0
```

## Alternative: install from source

If you have Go 1.23+ installed:

```bash
git clone https://github.com/mibienpanjoe/jex.git
cd jex/cli
go build -o jex .
# Move the binary to somewhere on your PATH
sudo mv jex /usr/local/bin/jex
```

## Connect to your team's API

Pass the `--api-url` flag when logging in:

```bash
jex login --api-url https://jex.yourcompany.com
```

Or set the URL once in `.envault` using `jex init`. The `.envault` file stores project metadata and the API URL only. It must not contain secrets.

## Next step

→ [Quick Start](/en/docs/getting-started/quick-start)
