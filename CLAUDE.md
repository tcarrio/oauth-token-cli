# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an OAuth/OIDC CLI tool for obtaining access tokens from OAuth providers. It supports two OAuth flows: Authorization Code with PKCE and Device Code Flow. The CLI can output tokens to the console or copy them directly to the clipboard.

## Development Commands

- `bun install` - Install dependencies
- `bun oauth` - Run the CLI (equivalent to `bun ./app/index.ts`)
- `bun run format` - Format code
- `bun run lint` - Lint and auto-fix code

## Architecture

The codebase is organized into several key layers:

### CLI Layer (`/app`)
- `index.ts` - Main entry point that orchestrates OAuth flows
- `cli.ts` - Command-line argument parsing using Node.js `parseArgs`
- `config.ts` - Configuration file support for default values
- `authorization-code.ts` & `device-code.ts` - Flow-specific runners
- `types.ts` - Shared types for CLI operations

### Core Library (`/src`)
- **OAuth Flows** (`/src/oauth/`) - Modular OAuth flow implementations
  - `authorization-code/` - Authorization Code with PKCE flow
  - `device-code/` - Device Code flow
  - `common/` - Shared OAuth utilities and types
- **HTTP Layer** (`/src/http/`) - HTTP client abstraction using Ky
- **Logging** (`/src/logger/`) - Configurable logging with multiple implementations
- **Base64** (`/src/base64/`) - Cross-runtime base64 encoding utilities
- **Utilities** - `random.ts`, `time.ts`, `enum.ts`

### Configuration
- Supports JSON config files (`docs/config.example.json` as template)
- Environment variable fallbacks for all CLI options
- Configuration hierarchy: CLI args > environment vars > config file > defaults

### Flow Architecture
Each OAuth flow follows a consistent pattern:
1. **Config** - Flow-specific configuration validation
2. **Client** - Low-level protocol implementation
3. **Agent** - High-level orchestration logic
4. **Runner** - CLI integration wrapper

The main entry point determines which flow to use and delegates to the appropriate runner with shared logger and CLI arguments.

## Key Technologies
- **Bun** runtime and package manager
- **Biome** for formatting and linting
- **Zod** for schema validation
- **Ky** for HTTP requests
- **TypeScript** with strict typing
