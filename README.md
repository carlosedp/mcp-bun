# MCP Bun Server

[![Bun Version](https://img.shields.io/badge/bun-%3E%3D1.0.0-orange.svg)](https://bun.sh/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

A comprehensive Model Context Protocol (MCP) server implementation optimized for the Bun JavaScript runtime. This server provides AI assistants with powerful tools to execute, optimize, and manage JavaScript/TypeScript projects using Bun's high-performance runtime.

**🔄 Runtime Compatibility**: The server automatically detects available runtimes and gracefully falls back to Node.js/npm when Bun is not available, ensuring maximum compatibility across different environments.

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

### Installation

#### Option 1: Install Globally (Recommended)

```bash
npm install -g mcp-bun-server
```

#### Option 2: Use with npx (No Installation Required)

```bash
npx mcp-bun-server
```

#### Option 3: Install from Source

1. Clone the repository:

```bash
git clone https://github.com/carlosedp/mcp-bun.git
cd mcp-bun
```

1. Install dependencies:

```bash
bun install
```

1. Build the project:

```bash
bun run build
```

### Configuration

#### For Global Installation

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "bun-runner": {
      "command": "mcp-bun",
      "env": {
        "DISABLE_NOTIFICATIONS": "true"
      }
    }
  }
}
```

#### For npx Usage

```json
{
  "mcpServers": {
    "bun-runner": {
      "command": "npx",
      "args": ["mcp-bun-server"],
      "env": {
        "DISABLE_NOTIFICATIONS": "true"
      }
    }
  }
}
```

#### For Development/Local Installation

```json
{
  "mcpServers": {
    "bun-runner": {
      "command": "bun",
      "args": ["path/to/mcp-bun/dist/mcp-bun.js"],
      "env": {
        "DISABLE_NOTIFICATIONS": "true"
      }
    }
  }
}
```

For Node.js compatibility:

```json
{
  "mcpServers": {
    "bun-runner": {
      "command": "node",
      "args": ["path/to/mcp-bun/dist/mcp-bun.js"]
    }
  }
}
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

**Example:**

```javascript
run-bun-script-file({
  scriptPath: "/path/to/app.ts",
  bunArgs: ["--smol"],
  args: ["--port", "3000"],
  cwd: "/path/to/project"
});
```

#### `run-bun-eval`

Execute JavaScript/TypeScript code directly with Bun eval.

**Parameters:**

- `code`: Code to execute
- `evalDirectory`: Execution directory
- `bunArgs`: Bun optimization flags
- `stdin`: Standard input
- `timeout`: Execution timeout

**Example:**

```javascript
run-bun-eval({
  code: "console.log('Hello from Bun!'); console.log(Bun.version);",
  bunArgs: ["--smol"]
});
```

### Package Management

#### `run-bun-install`

Install dependencies using Bun's fast package manager.

**Parameters:**

- `packageDir`: Directory containing package.json
- `dependency`: Specific package to install (optional)

**Example:**

```javascript
run-bun-install({
  packageDir: "/path/to/project",
  dependency: "express"
});
```

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

**Example:**

```javascript
run-bun-build({
  entryPoint: "src/index.ts",
  outDir: "dist",
  target: "bun",
  minify: true,
  sourcemap: true
});
```

#### `run-bun-test`

Execute tests with Bun's fast test runner.

**Parameters:**

- `testPath`: Test file or directory
- `coverage`: Enable code coverage
- `watch`: Enable watch mode
- `bail`: Stop after N failures
- `timeout`: Test timeout

**Example:**

```javascript
run-bun-test({
  testPath: "tests/",
  coverage: true,
  timeout: 30000
});
```

### Performance Analysis

#### `analyze-bun-performance`

Comprehensive project performance analysis.

**Parameters:**

- `projectDir`: Project directory
- `entryPoint`: Entry point to analyze
- `options`: Analysis options (bundle, dependencies, runtime)

**Example:**

```javascript
analyze-bun-performance({
  projectDir: "/path/to/project",
  entryPoint: "src/index.ts",
  options: {
    bundle: true,
    dependencies: true,
    runtime: true
  }
});
```

#### `benchmark-bun-script`

Benchmark script performance with different optimization flags.

**Parameters:**

- `scriptPath`: Script to benchmark
- `iterations`: Number of test runs
- `warmup`: Warmup runs

**Example:**

```javascript
benchmark-bun-script({
  scriptPath: "/path/to/script.js",
  iterations: 10,
  warmup: 2
});
```

### Server Management

#### `start-bun-server`

Start optimized Bun servers with hot reloading and watch capabilities.

**Parameters:**

- `scriptPath`: Server script path
- `cwd`: Working directory
- `bunArgs`: Bun flags
- `optimizations`: Hot reload, watch, smol mode options

**Example:**

```javascript
start-bun-server({
  scriptPath: "/path/to/server.ts",
  cwd: "/path/to/project",
  optimizations: {
    hot: true,
    watch: true,
    smol: false
  }
});
```

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

### Development Workflow

Enable hot reloading for development:

```bash
bun --hot --watch your-server.js
```

### Production Builds

Optimize for production with minification:

```bash
bun build src/index.ts --outdir dist --minify --target bun
```

### Testing Performance

Run tests with coverage:

```bash
bun test --coverage
```

## Advanced Examples

### Server with Hot Reloading

```javascript
start-bun-server({
  scriptPath: "src/server.ts",
  cwd: "/path/to/project",
  optimizations: {
    hot: true,
    watch: true
  }
});
```

### Performance Analysis Workflow

```javascript
// 1. Analyze project performance
analyze-bun-performance({
  projectDir: "/path/to/project",
  options: { bundle: true, dependencies: true, runtime: true }
});

// 2. Benchmark critical scripts
benchmark-bun-script({
  scriptPath: "src/critical-function.js",
  iterations: 100
});

// 3. Build optimized version
run-bun-build({
  entryPoint: "src/index.ts",
  target: "bun",
  minify: true
});
```

### Development to Production Pipeline

```javascript
// 1. Install dependencies
run-bun-install({ packageDir: "/path/to/project" });

// 2. Run tests
run-bun-test({ coverage: true });

// 3. Build for production
run-bun-build({
  entryPoint: "src/index.ts",
  outDir: "dist",
  target: "bun",
  minify: true,
  splitting: true
});

// 4. Start production server
start-bun-server({
  scriptPath: "dist/index.js",
  optimizations: { smol: true }
});
```

## Resources

### bun-scripts

Lists all available scripts in a package.json file.

URI template: `bun-scripts://{directory}`

Example usage: Ask "Show me the available scripts in this project"

## Environment Variables

### DISABLE_NOTIFICATIONS

Set to `"true"` to automatically approve all permission requests:

```bash
DISABLE_NOTIFICATIONS=true bun dist/mcp-bun.js
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
- Compatible with Node.js for broader compatibility
