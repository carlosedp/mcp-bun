#!/usr/bin/env bun

// Example TypeScript server demonstrating Bun's capabilities
const server = Bun.serve({
  port: 3000,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response("Hello from Bun! 🔥");
    }

    if (url.pathname === "/performance") {
      const start = performance.now();

      // Simulate some work
      const data = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        timestamp: Date.now(),
      }));

      const end = performance.now();

      return Response.json({
        message: "Performance test complete",
        itemsGenerated: data.length,
        processingTime: `${(end - start).toFixed(2)}ms`,
        bunVersion: Bun.version,
      });
    }

    if (url.pathname === "/info") {
      return Response.json({
        runtime: "Bun",
        version: Bun.version,
        revision: Bun.revision,
        platform: process.platform,
        arch: process.arch,
        memory: {
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
  error(error) {
    console.error("Server error:", error);
    return new Response("Internal Server Error", { status: 500 });
  },
});

console.log(`🚀 Bun server running on http://localhost:${server.port}`);
console.log(
  `📊 Visit http://localhost:${server.port}/performance for performance testing`
);
console.log(
  `ℹ️  Visit http://localhost:${server.port}/info for runtime information`
);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server gracefully...");
  server.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Received SIGTERM, shutting down...");
  server.stop();
  process.exit(0);
});
