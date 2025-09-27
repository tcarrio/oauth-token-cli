# OAuth Token CLI

[![built with nix](https://img.shields.io/static/v1?logo=nixos&logoColor=white&label=&message=Built%20with%20Nix&color=41439a)](https://builtwithnix.org)
[![CI](https://github.com/tcarrio/oauth-token-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/tcarrio/oauth-token-cli/actions/workflows/ci.yml)
[![FlakeHub](https://img.shields.io/endpoint?url=https://flakehub.com/f/tcarrio/oauth-token-cli/badge)](https://flakehub.com/f/tcarrio/oauth-token-cli)
[![License](https://img.shields.io/github/license/tcarrio/oauth-token-cli)](LICENSE)
[![Nix Flake](https://img.shields.io/badge/nix-flake-blue?logo=nixos)](https://nixos.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)](https://bun.sh)

A modern OAuth/OIDC CLI tool for obtaining access tokens from OAuth providers. Built with Nix for reproducible development and deployment.

## 🎯 Features

- **Multiple OAuth flows**: Authorization Code with PKCE, Device Code Flow, Client Credentials
- **Flexible output**: Console output or direct clipboard integration
- **Configuration support**: JSON config files, environment variables, and CLI arguments
- **Cross-platform**: Works on macOS, Linux, and Windows
- **Compiled binary**: Single executable with no runtime dependencies

## 🚀 Quick Start

### Prerequisites

This is a **Nix-first project**. You'll need:

- **[Nix](https://nixos.org/download.html)** - Package manager and build system
- **[direnv](https://direnv.net/)** *(recommended)* - Automatic environment management

### Option 1: Run directly (no installation)

```bash
# Run the latest version from FlakeHub
nix run github:tcarrio/oauth-token-cli -- --help
```

### Option 2: Install and use

```bash
# Install the CLI
nix profile install github:tcarrio/oauth-token-cli

# Use it
oauth-token-cli --help
```

### Option 3: Build from source

```bash
# Clone the repository
git clone https://github.com/tcarrio/oauth-token-cli.git
cd oauth-token-cli

# If you have direnv installed, the development environment will activate automatically
# Otherwise, enter the development shell manually:
nix develop

# Build the binary
nix build

# Run the compiled binary
./result/bin/oauth-token-cli --help
```

## 🛠️ Development

This project uses a modern Nix-based development workflow with comprehensive tooling:

### Development Environment

```bash
# Enter the development shell (or use direnv for automatic activation)
nix develop

# The shell provides:
# - Bun runtime and package manager
# - All formatting and linting tools
# - Pre-commit hooks
# - CI/CD commands
```

### Available Commands

#### Formatting & Linting
```bash
# Format all files (TypeScript, Nix, YAML, JSON)
treefmt

# Check formatting without changes
treefmt --fail-on-change

# Run TypeScript/JavaScript linting
bun run lint

# Auto-fix linting issues
bun run lint:fix
```

#### CI/CD Commands
```bash
# Run comprehensive CI checks (same as GitHub Actions)
nix run .#ci-check

# Individual CI commands
nix run .#ci-install     # Check dependencies
nix run .#ci-format      # Check formatting
nix run .#ci-lint        # Run linting
nix run .#ci-build       # Test build
nix run .#ci-test        # Test functionality
```

#### Development Workflow
```bash
# Install pre-commit hooks (done automatically in dev shell)
pre-commit install

# Run pre-commit hooks manually
pre-commit run --all-files

# All commits automatically:
# 1. Format all files
# 2. Fix linting issues
# 3. Stage changes
# 4. Validate everything passes
# 5. Block commit if unfixable errors remain
```

### Tools & Technologies

- **🏗️ Build System**: Nix flakes with bun2nix for dependency management
- **📝 Language**: TypeScript with strict typing and Bun runtime
- **🎨 Formatting**: 
  - [Biome](https://biomejs.dev/) for TypeScript/JavaScript/JSON
  - [yamlfmt](https://github.com/google/yamlfmt) for YAML files
  - [Alejandra](https://github.com/kamadorueda/alejandra) for Nix files
- **🔍 Linting**: 
  - [Biome](https://biomejs.dev/) for TypeScript/JavaScript
  - [deadnix](https://github.com/astro/deadnix) for dead Nix code detection
  - [statix](https://github.com/nerdypepper/statix) for Nix static analysis
- **🔗 Git Hooks**: Pre-commit hooks with automatic formatting and validation
- **📦 Dependencies**: Schema validation with [Zod](https://zod.dev/)
- **🌐 HTTP**: [Ky](https://github.com/sindresorhus/ky) for HTTP requests
- **📋 Clipboard**: [clipboardy](https://github.com/sindresorhus/clipboardy) for clipboard integration

## 📖 Usage

### Basic Usage

```bash
# Get help
oauth-token-cli --help

# Authorization Code Flow with PKCE
oauth-token-cli \
  --flow authorization-code \
  --client-id "your-client-id" \
  --base-url "https://your-oauth-provider.com" \
  --audience "https://your-api.com" \
  --scopes "read write" \
  --copy  # Copy token to clipboard

# Device Code Flow
oauth-token-cli \
  --flow device-code \
  --client-id "your-client-id" \
  --base-url "https://your-oauth-provider.com" \
  --audience "https://your-api.com" \
  --scopes "read write"

# Client Credentials Flow
oauth-token-cli \
  --flow client-credentials \
  --client-id "your-client-id" \
  --client-secret "your-client-secret" \
  --base-url "https://your-oauth-provider.com" \
  --audience "https://your-api.com"
```

### Configuration

You can use a configuration file to set default values:

```json
{
  "oauth": {
    "clientId": "your-default-client-id",
    "baseUrl": "https://your-oauth-provider.com",
    "audience": "https://your-api.com",
    "scopes": "read write",
    "flow": "device-code"
  },
  "logLevel": "Info",
  "output": {
    "target": "clipboard"
  }
}
```

Place this file at:
- `~/.config/oauth-device-code-cli/config.json` (Linux/macOS)
- `$XDG_CONFIG_HOME/oauth-device-code-cli/config.json` (if XDG_CONFIG_HOME is set)

### Environment Variables

All CLI options can be set via environment variables:

```bash
export OAUTH_CLIENT_ID="your-client-id"
export OAUTH_BASE_URL="https://your-oauth-provider.com"
export OAUTH_AUDIENCE="https://your-api.com"
export OAUTH_SCOPES="read write"
export OAUTH_FLOW="device-code"
export LOG_LEVEL="Info"
export OUTPUT_TARGET="clipboard"

oauth-token-cli
```

## 🚦 GitHub Actions

The project includes comprehensive CI/CD workflows:

- **🔄 CI Pipeline**: Runs formatting, linting, building, and testing on every push/PR
- **❄️ Flake Lock Updates**: Automatically updates Nix dependencies twice weekly
- **📦 FlakeHub Publishing**: Publishes releases to FlakeHub for easy consumption
- **🔍 Security**: All checks must pass before merging
- **⚡ Performance**: Nix caching eliminates redundant builds

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** (pre-commit hooks will format and validate automatically)
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

All contributions are automatically checked for:
- Code formatting consistency
- Linting compliance
- Build success
- Test passing
- Nix flake validity

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Nix](https://nixos.org/) for reproducible builds
- Powered by [Bun](https://bun.sh) for fast TypeScript execution
- Formatted with [Biome](https://biomejs.dev/) for consistent code style
- Inspired by modern OAuth best practices
