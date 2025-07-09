#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Import all tool and resource registrations
import { registerScriptTools } from "./tools/run-scripts.js";
import { registerBunTools } from "./tools/bun-tools.js";
import { registerBunOptimizationTools } from "./tools/bun-optimization-tools.js";
import { registerServerTools } from "./tools/server-tools.js";
import { registerBunScriptsResource } from "./resources/npm-scripts.js";

// Read package.json at runtime
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf-8")
);

// Create an MCP server
const server = new McpServer({
  name: "Bun",
  version: packageJson.version || "0.0.0-SNAPSHOT",
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
    console.error(
      `Bun MCP Server version ${
        packageJson.version || "0.0.0-SNAPSHOT"
      } running...`
    );
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main();
