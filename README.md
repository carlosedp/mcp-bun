# MCP Bun Server

[![Bun Version](https://img.shields.io/badge/bun-%3E%3D1.0.0-orange.svg)](https://bun.sh/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![NPM Version](https://img.shields.io/npm/v/mcp-bun)](https://www.npmjs.com/package/mcp-bun)


A comprehensive Model Context Protocol (MCP) server implementation optimized for the Bun JavaScript runtime. This server provides AI assistants with powerful tools to execute, optimize, and manage JavaScript/TypeScript projects using Bun's high-performance runtime.

**🔄 Runtime Compatibility**: The server requires nodejs to be installed for the mcp server and bun to be installed so the commands can be executed.

## Features

### 🚀 Bun-Optimized Execution

- **Fast Script Execution**: Run JavaScript/TypeScript files with Bun's optimized runtime
- **Built-in TypeScript Support**: Execute TypeScript directly without compilation
- **Memory Optimization**: Use `--smol` flag for memory-constrained environments
- **Hot Reloading**: Development server with `--hot` flag support

### 🔧 Development Tools

- **Package Management**: Install dependencies with `bun install`
- **Script Runner**: Execute package.json scripts with `bun run`
- **Build System**: Optimize projects with `bun build` including minification and bundling
- **Test Runner**: Fast testing with `bun test` and coverage reporting

### 📊 Performance Analytics

- **Project Analysis**: Analyze bundle sizes, dependencies, and runtime performance
- **Benchmarking**: Compare script performance with different optimization flags
- **Optimization Suggestions**: Get recommendations for Bun-specific optimizations

### 🖥️ Server Management

- **Background Servers**: Start and manage long-running Bun/Node.js servers
- **Process Monitoring**: Track server status, logs, and performance
- **Hot Reloading Servers**: Development servers with file watching capabilities

### 🔍 Resource Discovery

- **Script Listing**: Browse available npm/package.json scripts
- **Project Structure**: Understand project dependencies and configuration

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) v1.0.0 or later (recommended)
- Node.js v18.0.0 or later (for compatibility)

For MacOS/Linux users, install Bun using the instructions on the [Bun website](https://bun.sh/docs/installation#macos-and-linux).

For Windows, the installation depends if you develope with WSL2 or not:

- For native Windows development, install Bun using the [Windows installer](https://bun.sh/docs/installation#windows).
- If you develop with WSL2, install Bun in your WSL2 environment using the [Linux installation instructions](https://bun.sh/docs/installation#macos-and-linux).

### Configuration

#### On VSCode MCP Client

For quick installation, use one of the one-click install buttons below...

[![Install with UV in VS Code](https://img.shields.io/badge/VS_Code-UV-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=bun&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22mcp-bun@latest%22%5D%7D) [![Install with UV in VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-UV-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=bun&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22mcp-bun@latest%22%5D%7D&quality=insiders)

Or use the configs below.

If using globally, add the following to your MCP client configuration on `settings.json`:

```json
{
  ...
  "mcp": {
    "servers": {
      "bun": {
        "command": "npx",
        "args": ["-y", "mcp-bun@latest"],
        "env": {
          "DISABLE_NOTIFICATIONS": "true"
        }
      }
    }
  }
}
```

On Windows, **this doesn't work properly when using WSL2** if your project lives in the WSL2 filesystem and you run VSCode natively on Windows. This happens because the MCP server runs on Windows and the Bun commands are executed in the WSL2 environment, which can lead to path issues.

In this case, **configure the MCP server in the project workspace configuration** file which makes the MCP server run in the WSL2 environment and execute the Bun commands there.

Create a file named `.vscode/mcp.json` in your project root with the following content:

```json
{
  "servers": {
    "bun": {
      "command": "npx",
      "args": ["-y", "mcp-bun@latest"],
      "env": {
        "DISABLE_NOTIFICATIONS": "true"
      }
    }
```

#### On Claude Desktop

Configure your Claude Desktop MCP client with the following:

```json
{
  "mcpServers": {
    "node-runner": {
      "command": "npx",
      "args": ["-y", "mcp-bun@latest"],
      "env": {
        "DISABLE_NOTIFICATIONS": "true",  // Optional: disable permission prompts
      }
    }
  }
}
```

#### For Development/Local Installation

Clone the repository to your local machine, install dependencies, and build the project:

```bash
git clone https://github.com/carlosedp/mcp-bun.git
cd mcp-bun
bun install
bun run build
```

Then configure your MCP client to use the local build:

```json
{
  "servers": {
    "bun-dev": {
      "command": "node",
      "args": ["/home/user/mcp-bun/dist/mcp-bun.js"],
      "env": {
        "DISABLE_NOTIFICATIONS": "true"
      }
    },
  }
}
```

For testing there's also the MCP Inspector available, which allows you to run the server with Bun and inspect the commands being executed:

```bash
bun run dev
```

## Available Tools

### Core Execution Tools

#### `run-bun-script-file`

Execute JavaScript/TypeScript files with Bun runtime optimizations.

**Parameters:**

- `scriptPath`: Path to the script file
- `bunArgs`: Optional Bun flags (e.g., `--smol`, `--hot`)
- `args`: Arguments to pass to the script
- `stdin`: Optional standard input
- `cwd`: Working directory
- `timeout`: Execution timeout


#### `run-bun-eval`

Execute JavaScript/TypeScript code directly with Bun eval.

**Parameters:**

- `code`: Code to execute
- `evalDirectory`: Execution directory
- `bunArgs`: Bun optimization flags
- `stdin`: Standard input
- `timeout`: Execution timeout

### Package Management

#### `run-bun-install`

Install dependencies using Bun's fast package manager.

**Parameters:**

- `packageDir`: Directory containing package.json
- `dependency`: Specific package to install (optional)

#### `run-bun-script`

Execute npm scripts using Bun.

**Parameters:**

- `packageDir`: Directory containing package.json
- `scriptName`: Script name to run
- `args`: Additional arguments

### Build & Optimization

#### `run-bun-build`

Build and optimize projects with Bun's bundler.

**Parameters:**

- `entryPoint`: Entry file to build
- `outDir`: Output directory
- `target`: Build target (`browser`, `bun`, `node`)
- `minify`: Enable minification
- `sourcemap`: Generate source maps
- `splitting`: Enable code splitting

#### `run-bun-test`

Execute tests with Bun's fast test runner.

**Parameters:**

- `testPath`: Test file or directory
- `coverage`: Enable code coverage
- `watch`: Enable watch mode
- `bail`: Stop after N failures
- `timeout`: Test timeout

### Performance Analysis

#### `analyze-bun-performance`

Comprehensive project performance analysis.

**Parameters:**

- `projectDir`: Project directory
- `entryPoint`: Entry point to analyze
- `options`: Analysis options (bundle, dependencies, runtime)

#### `benchmark-bun-script`

Benchmark script performance with different optimization flags.

**Parameters:**

- `scriptPath`: Script to benchmark
- `iterations`: Number of test runs
- `warmup`: Warmup runs

### Server Management

#### `start-bun-server`

Start optimized Bun servers with hot reloading and watch capabilities.

**Parameters:**

- `scriptPath`: Server script path
- `cwd`: Working directory
- `bunArgs`: Bun flags
- `optimizations`: Hot reload, watch, smol mode options

#### Additional Server Tools

- `start-node-server`: Start Node.js servers for compatibility
- `list-servers`: List all running servers with status and logs
- `stop-server`: Stop running servers gracefully or forcefully
- `get-server-logs`: Retrieve server logs with filtering options

### Version Management

#### `get-bun-version`

Get current Bun version and revision information.

#### `list-bun-versions`

List available Bun installations.

#### `select-bun-version`

Select specific Bun version for execution.

## Performance Optimization Tips

### Memory Optimization

Use the `--smol` flag for memory-constrained environments:

```bash
bun --smol your-script.js
```

## Security Considerations

- The server prompts for permission before executing any command
- Scripts run with the same permissions as the MCP server process
- Use environment variable `DISABLE_NOTIFICATIONS=true` for automation
- Be cautious when running scripts from untrusted sources

## Development

### Building

```bash
bun run build        # Build with Bun
bun run build:node   # Build with Node.js/TypeScript
```

### Development Mode

```bash
bun run dev          # Run with Bun + MCP Inspector
bun run dev:node     # Run with Node.js + MCP Inspector
```

### Linting

```bash
bun run lint         # Check for issues
bun run lint:fix     # Fix auto-fixable issues
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built on the [Model Context Protocol](https://modelcontextprotocol.io/)
- Optimized for [Bun](https://bun.sh/) runtime
- Heavily inspired by the [MCP Node.js server](https://github.com/platformatic/mcp-node)
