# Publishing Guide for mcp-bun-server

## Prerequisites

1. **NPM Account**: You need an NPM account. Create one at [npmjs.com](https://www.npmjs.com)
2. **NPM CLI**: Make sure you have npm installed
3. **Authentication**: Login to NPM

## Step-by-Step Publishing Process

### 1. Login to NPM

```bash
npm login
```

Enter your NPM username, password, and email when prompted.

### 2. Verify Your Identity

```bash
npm whoami
```

This should display your NPM username.

### 3. Build the Package

```bash
npm run build:node
```

### 4. Test the Package Locally (Optional but Recommended)

```bash
# Test what will be published
npm pack --dry-run

# Or create a tarball to inspect
npm pack
```

### 5. Publish to NPM

#### For the First Release:

```bash
npm publish
```

#### For Subsequent Releases:

```bash
# Update version first (choose one)
npm version patch   # 1.0.0 -> 1.0.1 (bug fixes)
npm version minor   # 1.0.0 -> 1.1.0 (new features)
npm version major   # 1.0.0 -> 2.0.0 (breaking changes)

# Then publish
npm publish
```

### 6. Verify Publication

After publishing, verify it's available:

```bash
# Check if package is available
npm info mcp-bun-server

# Test installation
npx mcp-bun-server --help
```

## Package Details

- **Package Name**: `mcp-bun-server`
- **Entry Point**: `dist/mcp-bun.js`
- **Binary Command**: `mcp-bun`
- **Runtime**: Node.js (with Bun optimizations)

## Usage After Publication

Users can then use your package in several ways:

### Global Installation
```bash
npm install -g mcp-bun-server
mcp-bun  # Direct command
```

### npx Usage (No Installation)
```bash
npx mcp-bun-server
```

### MCP Configuration for Users

Users can add this to their MCP client configuration:

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

Or if installed globally:
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

## Important Notes

1. **Package Name**: I changed the name to `mcp-bun-server` (with hyphen) as `mcp-bun` might be taken
2. **Version**: Started at 1.0.0 to indicate it's production-ready
3. **Build**: The `prepublishOnly` script ensures the package is built before publishing
4. **Files**: Only necessary files are included (dist/, README.md, LICENSE)

## Troubleshooting

### If Package Name is Taken
If `mcp-bun-server` is already taken, consider these alternatives:
- `@carlosedp/mcp-bun`
- `mcp-bun-runtime`
- `bun-mcp-server`
- `mcp-bun-tools`

### Testing Before Publishing
```bash
# Install locally to test
npm install -g .

# Test the command
mcp-bun

# Uninstall after testing
npm uninstall -g mcp-bun-server
```
