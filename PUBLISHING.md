# Publishing Guide for mcp-bun

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
npm info mcp-bun

# Test installation
npx mcp-bun --help
```

## Package Details

- **Package Name**: `mcp-bun`
- **Entry Point**: `dist/mcp-bun.js`
- **Binary Command**: `mcp-bun`
- **Runtime**: Node.js (with Bun optimizations)
