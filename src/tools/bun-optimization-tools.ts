import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as path from "path";
import * as fs from "fs/promises";
import {
  execAsync,
  askPermission,
  getSelectedBunVersion,
  setSelectedBunVersion,
} from "../utils/helpers.js";
import { ExecOptionsWithInput } from "../types/index.js";

export function registerBunOptimizationTools(server: McpServer): void {
  // Tool to analyze project performance with Bun
  server.tool(
    "analyze-bun-performance",
    "Analyze project performance characteristics with Bun",
    {
      projectDir: z
        .string()
        .describe("Directory containing the project to analyze"),
      entryPoint: z
        .string()
        .optional()
        .describe("Entry point to analyze (defaults to package.json main)"),
      options: z
        .object({
          bundle: z.boolean().optional().describe("Analyze bundle size"),
          dependencies: z.boolean().optional().describe("Analyze dependencies"),
          runtime: z
            .boolean()
            .optional()
            .describe("Analyze runtime performance"),
        })
        .optional()
        .describe("Analysis options"),
    },
    async ({ projectDir, entryPoint, options = {} }) => {
      try {
        const absProjectDir = path.resolve(projectDir);
        const packageJsonPath = path.join(absProjectDir, "package.json");

        // Check if package.json exists
        try {
          await fs.access(packageJsonPath);
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: `Error: package.json not found at ${packageJsonPath}`,
              },
            ],
          };
        }

        // Read package.json to get entry point if not provided
        let actualEntryPoint: string = entryPoint || "index.js";
        if (!entryPoint) {
          try {
            const packageContent = await fs.readFile(packageJsonPath, "utf-8");
            const packageJson = JSON.parse(packageContent);
            actualEntryPoint = packageJson.main || "index.js";
          } catch (error) {
            actualEntryPoint = "index.js";
          }
        }

        const entryPath = path.resolve(absProjectDir, actualEntryPoint);

        // Ask for permission
        const permissionMessage = `Analyze project performance: ${absProjectDir}`;
        const permitted = await askPermission(permissionMessage);

        if (!permitted) {
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: "Permission denied by user",
              },
            ],
          };
        }

        let analysisResult = `Performance Analysis for: ${absProjectDir}\n`;
        analysisResult += `Entry Point: ${actualEntryPoint}\n\n`;

        // Bundle size analysis
        if (options.bundle) {
          try {
            const bundleCommand = `bun build ${entryPath} --outdir /tmp/bun-analysis --target bun`;
            await execAsync(bundleCommand, { cwd: absProjectDir });

            // Get bundle info
            const bundlePath = `/tmp/bun-analysis/${path.basename(
              actualEntryPoint
            )}`;
            try {
              const stats = await fs.stat(bundlePath);
              analysisResult += `Bundle Size: ${(stats.size / 1024).toFixed(
                2
              )} KB\n`;
            } catch {
              analysisResult += `Bundle Size: Could not determine\n`;
            }
          } catch (error) {
            analysisResult += `Bundle Analysis: Failed - ${
              error instanceof Error ? error.message : String(error)
            }\n`;
          }
        }

        // Dependencies analysis
        if (options.dependencies) {
          try {
            const packageContent = await fs.readFile(packageJsonPath, "utf-8");
            const packageJson = JSON.parse(packageContent);

            const depCount = Object.keys(packageJson.dependencies || {}).length;
            const devDepCount = Object.keys(
              packageJson.devDependencies || {}
            ).length;

            analysisResult += `Dependencies: ${depCount} production, ${devDepCount} development\n`;

            // Check for heavy dependencies
            const heavyDeps = Object.keys(
              packageJson.dependencies || {}
            ).filter((dep) =>
              [
                "webpack",
                "babel",
                "typescript",
                "react",
                "vue",
                "angular",
              ].some((heavy) => dep.includes(heavy))
            );

            if (heavyDeps.length > 0) {
              analysisResult += `Heavy Dependencies: ${heavyDeps.join(", ")}\n`;
              analysisResult += `Recommendation: Consider using Bun's built-in features to replace some of these\n`;
            }
          } catch (error) {
            analysisResult += `Dependency Analysis: Failed - ${
              error instanceof Error ? error.message : String(error)
            }\n`;
          }
        }

        // Runtime performance analysis
        if (options.runtime) {
          try {
            // Check if entry point exists
            await fs.access(entryPath);

            const perfCommand = `time bun ${entryPath}`;
            const { stdout, stderr } = await execAsync(perfCommand, {
              cwd: absProjectDir,
              timeout: 30000,
            });

            analysisResult += `Runtime Test Output:\n${stdout}\n`;
            if (
              stderr.includes("real") ||
              stderr.includes("user") ||
              stderr.includes("sys")
            ) {
              analysisResult += `Timing Information:\n${stderr}\n`;
            }
          } catch (error) {
            analysisResult += `Runtime Analysis: Could not execute entry point\n`;
          }
        }

        // Bun-specific optimizations suggestions
        analysisResult += `\nBun Optimization Suggestions:\n`;
        analysisResult += `- Use 'bun --smol' for memory-constrained environments\n`;
        analysisResult += `- Use 'bun --hot' for development hot reloading\n`;
        analysisResult += `- Consider 'bun build' with --minify for production\n`;
        analysisResult += `- Use Bun's built-in test runner: 'bun test'\n`;
        analysisResult += `- Consider using Bun.serve() for HTTP servers\n`;

        return {
          content: [
            {
              type: "text" as const,
              text: analysisResult,
            },
          ],
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Error analyzing project: ${errorMessage}`,
            },
          ],
        };
      }
    }
  );

  // Tool to get available Bun versions (if using a version manager)
  server.tool(
    "list-bun-versions",
    "Get available Bun versions if using a version manager",
    {},
    async () => {
      try {
        // Try to get system Bun version
        const { stdout: systemVersion } = await execAsync("bun --version");

        let versionInfo = `System Bun Version: ${systemVersion.trim()}\n\n`;

        // Try to check for other Bun installations
        try {
          const { stdout } = await execAsync("which -a bun");
          const bunPaths = stdout.trim().split("\n");

          versionInfo += `Bun Installations Found:\n`;
          for (const bunPath of bunPaths) {
            try {
              const { stdout: version } = await execAsync(
                `${bunPath} --version`
              );
              versionInfo += `${bunPath}: ${version.trim()}\n`;
            } catch {
              versionInfo += `${bunPath}: Version unknown\n`;
            }
          }
        } catch {
          versionInfo += `Single Bun installation detected\n`;
        }

        // Check for version manager hints
        versionInfo += `\nNote: To manage multiple Bun versions, consider using:\n`;
        versionInfo += `- bvm (Bun Version Manager)\n`;
        versionInfo += `- Or install different versions manually\n`;

        return {
          content: [
            {
              type: "text" as const,
              text: versionInfo,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Error listing Bun versions: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  // Tool to benchmark script performance
  server.tool(
    "benchmark-bun-script",
    "Benchmark a script's performance with different Bun optimization flags",
    {
      scriptPath: z.string().describe("Path to the script to benchmark"),
      iterations: z
        .number()
        .optional()
        .describe("Number of iterations to run (default: 5)"),
      warmup: z
        .number()
        .optional()
        .describe("Number of warmup runs (default: 1)"),
    },
    async ({ scriptPath, iterations = 5, warmup = 1 }) => {
      try {
        const absPath = path.resolve(scriptPath);

        // Check if script exists
        try {
          await fs.access(absPath);
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: `Error: Script not found at ${absPath}`,
              },
            ],
          };
        }

        // Ask for permission
        const permissionMessage = `Benchmark script: ${absPath} (${iterations} iterations)`;
        const permitted = await askPermission(permissionMessage);

        if (!permitted) {
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: "Permission denied by user",
              },
            ],
          };
        }

        let benchmarkResult = `Benchmark Results for: ${absPath}\n`;
        benchmarkResult += `Iterations: ${iterations}, Warmup: ${warmup}\n\n`;

        // Test configurations
        const configs = [
          { name: "Default", args: [] },
          { name: "Smol Mode", args: ["--smol"] },
          { name: "JIT Optimized", args: [] }, // Bun uses JIT by default
        ];

        for (const config of configs) {
          benchmarkResult += `${config.name}:\n`;

          const times: number[] = [];

          // Warmup runs
          for (let i = 0; i < warmup; i++) {
            try {
              const command = `bun ${config.args.join(" ")} ${absPath}`.trim();
              await execAsync(command, { timeout: 30000 });
            } catch {
              // Ignore warmup errors
            }
          }

          // Actual benchmark runs
          for (let i = 0; i < iterations; i++) {
            try {
              const startTime = Date.now();
              const command = `bun ${config.args.join(" ")} ${absPath}`.trim();
              await execAsync(command, { timeout: 30000 });
              const endTime = Date.now();
              times.push(endTime - startTime);
            } catch (error) {
              benchmarkResult += `  Run ${i + 1}: Failed\n`;
            }
          }

          if (times.length > 0) {
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            const min = Math.min(...times);
            const max = Math.max(...times);

            benchmarkResult += `  Average: ${avg.toFixed(2)}ms\n`;
            benchmarkResult += `  Min: ${min}ms, Max: ${max}ms\n`;
            benchmarkResult += `  Successful runs: ${times.length}/${iterations}\n`;
          } else {
            benchmarkResult += `  All runs failed\n`;
          }

          benchmarkResult += `\n`;
        }

        benchmarkResult += `Recommendation: Use the configuration with the best average time for your use case.\n`;

        return {
          content: [
            {
              type: "text" as const,
              text: benchmarkResult,
            },
          ],
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Error benchmarking script: ${errorMessage}`,
            },
          ],
        };
      }
    }
  );

  // Tool to select Bun version (placeholder for future version management)
  server.tool(
    "select-bun-version",
    "Select a specific Bun version to use for subsequent script executions",
    {
      version: z
        .string()
        .describe(
          "Bun version to use (e.g., 'latest', 'system', or specific version)"
        ),
    },
    async ({ version }) => {
      try {
        // For now, we'll just store the preference
        // In a full implementation, this would work with a Bun version manager

        if (version === "system") {
          setSelectedBunVersion(null);
          return {
            content: [
              {
                type: "text" as const,
                text: "Using system Bun version for subsequent executions.",
              },
            ],
          };
        }

        // Validate the version exists (basic check)
        try {
          const { stdout } = await execAsync("bun --version");
          const currentVersion = stdout.trim();

          if (version === "latest" || version === currentVersion) {
            setSelectedBunVersion(version);
            return {
              content: [
                {
                  type: "text" as const,
                  text: `Selected Bun version: ${version} (current: ${currentVersion})`,
                },
              ],
            };
          } else {
            return {
              isError: true,
              content: [
                {
                  type: "text" as const,
                  text: `Version ${version} not found. Current version: ${currentVersion}. Consider using a Bun version manager for multiple versions.`,
                },
              ],
            };
          }
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: `Error checking Bun version: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              },
            ],
          };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Error selecting Bun version: ${errorMessage}`,
            },
          ],
        };
      }
    }
  );
}
