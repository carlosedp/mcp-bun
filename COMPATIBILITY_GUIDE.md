# MCP Bun Server - Compatibility Guide

## Runtime Detection and Fallbacks

The MCP Bun Server is designed to work seamlessly across different JavaScript runtimes with automatic detection and graceful fallbacks.

### Runtime Priority

1. **Bun** (if available) - Provides optimal performance and all features
2. **Node.js** (fallback) - Ensures compatibility when Bun is not installed

### Automatic Command Translation

The server automatically translates Bun-specific commands to their Node.js/npm equivalents:

| Bun Command        | Node.js Fallback     |
| ------------------ | -------------------- |
| `bun run <script>` | `npm run <script>`   |
| `bun build <file>` | `npx esbuild <file>` |
| `bun <file>`       | `node <file>`        |

### VS Code MCP Configuration

For maximum compatibility, use the npx-based configuration in your VS Code settings:

```json
{
  "mcp.mcpServers": {
    "bun-runner": {
      "command": "npx",
      "args": ["mcp-bun-server@latest"]
    }
  }
}
```

This configuration:
- Always uses Node.js as the runtime
- Automatically downloads the latest version
- Works regardless of whether Bun is installed locally
- Provides the most reliable experience across different environments

### Local Development

For local development, you can also use:

```json
{
  "mcp.mcpServers": {
    "bun-runner": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-bun/dist/mcp-bun.js"]
    }
  }
}
```

### Features Available in Each Runtime

#### With Bun Available
- All features work optimally
- Fastest execution times
- Native TypeScript support
- Bun-specific optimizations

#### With Node.js Only
- All core features work
- Commands automatically translated to npm equivalents
- Slightly slower execution (but still fast)
- Standard Node.js performance characteristics

### Environment Detection

The server automatically:
1. Detects if Bun is available on startup
2. Caches the detection result for performance
3. Translates commands on-the-fly based on available runtime
4. Provides clear feedback about which runtime is being used

### Troubleshooting

If you encounter issues:

1. **Check runtime availability**: The server will automatically detect and use the best available runtime
2. **Use npx configuration**: This is the most reliable option for VS Code integration
3. **Verify Node.js version**: Ensure Node.js v18.0.0 or later is installed
4. **Check PATH**: Ensure npm/npx are available in your system PATH

### Performance Considerations

- **Bun runtime**: ~2-3x faster startup and execution
- **Node.js runtime**: Standard performance, broader compatibility
- **npx**: Slight overhead on first run for package download, then cached

The server is optimized to provide the best experience regardless of the underlying runtime.
