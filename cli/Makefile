BINARY_NAME := jex
VERSION     := $(shell git describe --tags --always --dirty 2>/dev/null || echo "v0.1.0")
LDFLAGS     := -ldflags "-X main.version=$(VERSION)"
OUT_DIR     := ../packages/npm-wrapper/binaries

.PHONY: build build-all clean

build:
	go build $(LDFLAGS) -o $(BINARY_NAME) .

build-all: clean
	GOOS=linux   GOARCH=amd64  go build $(LDFLAGS) -o $(OUT_DIR)/jex-linux-amd64   .
	GOOS=linux   GOARCH=arm64  go build $(LDFLAGS) -o $(OUT_DIR)/jex-linux-arm64   .
	GOOS=darwin  GOARCH=amd64  go build $(LDFLAGS) -o $(OUT_DIR)/jex-darwin-amd64  .
	GOOS=darwin  GOARCH=arm64  go build $(LDFLAGS) -o $(OUT_DIR)/jex-darwin-arm64  .
	GOOS=windows GOARCH=amd64  go build $(LDFLAGS) -o $(OUT_DIR)/jex-windows-amd64.exe .

clean:
	rm -f $(BINARY_NAME)
	rm -f $(OUT_DIR)/jex-*
