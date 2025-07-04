#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import all tool and resource registrations
import { registerScriptTools } from "./tools/run-scripts.js";
import { registerBunTools } from "./tools/bun-tools.js";
import { registerBunOptimizationTools } from "./tools/bun-optimization-tools.js";
import { registerServerTools } from "./tools/server-tools.js";
import { registerBunScriptsResource } from "./resources/npm-scripts.js";

// Create an MCP server
const server = new McpServer({
  name: "BunRunner",
  version: "1.0.0",
});

// Register all tools and resources
registerScriptTools(server);
registerBunTools(server);
registerBunOptimizationTools(server);
registerServerTools(server);
registerBunScriptsResource(server);

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Bun Runner MCP Server running...");
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main();
