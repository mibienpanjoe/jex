# Installation

## Requirements

- Node.js 18 or later (for the npm wrapper)
- A Jex account — [create one free](/register) or [self-host](/docs/self-hosting)

## Install the CLI

The `jex` CLI is distributed as a compiled Go binary wrapped in an npm package.

```bash
npm install -g @jex/cli
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

## Self-hosted API

If you're running your own Jex API, pass the `--api-url` flag to all commands:

```bash
jex login --api-url https://jex.yourcompany.com
```

Or set the URL once in `.envault` using `jex init`.

## Next step

→ [Quick Start](/docs/getting-started/quick-start)
