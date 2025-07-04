import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as path from "path";
import * as fs from "fs/promises";
import {
  execAsync,
  askPermission,
  getSelectedNodeVersion,
  getRuntimeCommand,
} from "../utils/helpers.js";
import { ExecOptionsWithInput } from "../types/index.js";

export function registerBunTools(server: McpServer): void {
  // Tool to run an script with bun
  server.tool(
    "run-bun-script",
    "Execute a script from package.json with bun",
    {
      packageDir: z.string().describe("Directory containing package.json"),
      scriptName: z.string().describe("Name of the script to run"),
      args: z
        .array(z.string())
        .optional()
        .describe("Optional arguments to pass to the script"),
      stdin: z
        .string()
        .optional()
        .describe("Optional input to provide to the script's standard input"),
    },
    async ({ packageDir, scriptName, args = [], stdin }) => {
      try {
        // Resolve the absolute path
        const absPath = path.resolve(packageDir);
        const packageJsonPath = path.join(absPath, "package.json");

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

        // Read package.json to verify script exists
        const packageJsonContent = await fs.readFile(packageJsonPath, "utf-8");
        const packageJson = JSON.parse(packageJsonContent);

        if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: `Error: Script '${scriptName}' not found in package.json`,
              },
            ],
          };
        }

        // Format command for permission request
        const argsString = args.length > 0 ? ` -- ${args.join(" ")}` : "";
        const baseCommand = `bun run ${scriptName}${argsString}`;

        // Get the appropriate runtime command
        const command = await getRuntimeCommand(baseCommand);

        // Ask for permission - include stdin info if provided
        let permissionMessage = `${command} (in ${absPath})`;
        if (stdin !== undefined) {
          permissionMessage += ` with provided standard input`;
        }

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

        // Execute the script with the selected Node.js version if one is set
        let execCommand = command;
        let execOptions: ExecOptionsWithInput = {
          cwd: absPath,
          timeout: 60000, // 1 minute timeout
        };

        // If stdin is provided, add it to exec options
        if (stdin !== undefined) {
          execOptions.input = stdin;
        }

        const { stdout, stderr } = await execAsync(execCommand, execOptions);

        return {
          content: [
            {
              type: "text" as const,
              text: stdout || "Script executed successfully with no output",
            },
            ...(stderr
              ? [
                  {
                    type: "text" as const,
                    text: `Standard Error: ${stderr}`,
                  },
                ]
              : []),
          ],
        };
      } catch (error) {
        // Extract stdout and stderr from the error
        const execError = error as any;
        const stdout = execError.stdout || "";
        const stderr = execError.stderr || "";
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Return a successful response but include both stdout, stderr and error information
        return {
          content: [
            {
              type: "text" as const,
              text: stdout || "Script execution returned with error code",
            },
            {
              type: "text" as const,
              text: `Standard Error: ${stderr}\nError: ${errorMessage}`,
            },
          ],
        };
      }
    }
  );

  // Tool to run npm install
  server.tool(
    "run-bun-install",
    "Execute bun install to install all dependencies or a specific package",
    {
      packageDir: z.string().describe("Directory containing package.json"),
      dependency: z
        .string()
        .optional()
        .describe(
          "Optional specific dependency to install (leave empty to install all dependencies from package.json)"
        ),
    },
    async ({ packageDir, dependency }) => {
      try {
        // Resolve the absolute path
        const absPath = path.resolve(packageDir);
        const packageJsonPath = path.join(absPath, "package.json");

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

        // Format command for permission request
        const command = dependency
          ? `bun install ${dependency}`
          : `bun install`;
        const permissionMessage = `${command} (in ${absPath})`;

        // Ask for permission
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

        // Execute bun install
        let execCommand = command;
        let execOptions: ExecOptionsWithInput = {
          cwd: absPath,
          timeout: 300000, // 5 minute timeout for potentially long installs
        };

        const { stdout, stderr } = await execAsync(execCommand, execOptions);

        return {
          content: [
            {
              type: "text" as const,
              text:
                stdout || "bun install executed successfully with no output",
            },
            ...(stderr
              ? [
                  {
                    type: "text" as const,
                    text: `Standard Error: ${stderr}`,
                  },
                ]
              : []),
          ],
        };
      } catch (error) {
        // Extract stdout and stderr from the error
        const execError = error as any;
        const stdout = execError.stdout || "";
        const stderr = execError.stderr || "";
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Return a response with both stdout, stderr and error information
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: stdout || "bun install execution failed",
            },
            {
              type: "text" as const,
              text: `Standard Error: ${stderr}\nError: ${errorMessage}`,
            },
          ],
        };
      }
    }
  );

  // Tool to get Bun version information
  server.tool(
    "get-bun-version",
    "Get the version of Bun the scripts will be executed with",
    {},
    async () => {
      try {
        const { stdout } = await execAsync("bun --version");
        const version = stdout.trim();

        // Also get revision info if available
        let revisionInfo = "";
        try {
          const { stdout: revStdout } = await execAsync("bun --revision");
          revisionInfo = `\nRevision: ${revStdout.trim()}`;
        } catch {
          // Revision command might not be available in all versions
        }

        return {
          content: [
            {
              type: "text" as const,
              text: `Bun version: ${version}${revisionInfo}`,
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Error getting Bun version: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  // Tool to execute JavaScript/TypeScript code directly with Bun
  server.tool(
    "run-bun-eval",
    "Execute JavaScript/TypeScript code directly with Bun eval with optimizations",
    {
      code: z.string().describe("JavaScript/TypeScript code to execute"),
      evalDirectory: z
        .string()
        .optional()
        .describe("Directory to execute the code in"),
      stdin: z
        .string()
        .optional()
        .describe("Optional input to provide to the script's standard input"),
      timeout: z
        .number()
        .optional()
        .describe("Timeout in milliseconds after which the process is killed"),
      bunArgs: z
        .array(z.string())
        .optional()
        .describe(
          "Optional arguments to pass to Bun (e.g., --smol for memory optimization)"
        ),
    },
    async ({ code, evalDirectory, stdin, timeout, bunArgs = [] }) => {
      try {
        // Build the command with optional optimizations
        const argsString = bunArgs.length > 0 ? bunArgs.join(" ") + " " : "";
        const command = `bun ${argsString}-e "${code.replace(/"/g, '\\"')}"`;

        // Get working directory
        const workingDir = evalDirectory
          ? path.resolve(evalDirectory)
          : process.cwd();

        // Ask for permission
        let permissionMessage = `Execute Bun code: ${code.substring(0, 100)}${
          code.length > 100 ? "..." : ""
        } (in ${workingDir})`;
        if (stdin) {
          permissionMessage += " with provided standard input";
        }

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

        // Execute the code
        const execOptions: ExecOptionsWithInput = {
          cwd: workingDir,
          timeout: timeout || 30000, // 30 second default timeout
        };

        if (stdin) {
          execOptions.input = stdin;
        }

        const { stdout, stderr } = await execAsync(command, execOptions);

        return {
          content: [
            {
              type: "text" as const,
              text: stdout || "Code executed successfully with no output",
            },
            ...(stderr
              ? [
                  {
                    type: "text" as const,
                    text: `Standard Error: ${stderr}`,
                  },
                ]
              : []),
          ],
        };
      } catch (error) {
        const execError = error as any;
        const stdout = execError.stdout || "";
        const stderr = execError.stderr || "";
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        return {
          content: [
            {
              type: "text" as const,
              text: stdout || "Code execution returned with error code",
            },
            {
              type: "text" as const,
              text: `Standard Error: ${stderr}\nError: ${errorMessage}`,
            },
          ],
        };
      }
    }
  );

  // Tool to run Bun build for optimization
  server.tool(
    "run-bun-build",
    "Build and optimize JavaScript/TypeScript projects with Bun",
    {
      entryPoint: z.string().describe("Entry point file to build"),
      outDir: z
        .string()
        .optional()
        .describe("Output directory for built files"),
      target: z
        .enum(["browser", "bun", "node"])
        .optional()
        .describe("Build target"),
      minify: z.boolean().optional().describe("Enable minification"),
      sourcemap: z.boolean().optional().describe("Generate source maps"),
      splitting: z.boolean().optional().describe("Enable code splitting"),
    },
    async ({ entryPoint, outDir, target, minify, sourcemap, splitting }) => {
      try {
        const absEntryPoint = path.resolve(entryPoint);

        // Check if entry point exists
        try {
          await fs.access(absEntryPoint);
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: `Error: Entry point not found at ${absEntryPoint}`,
              },
            ],
          };
        }

        // Build the command
        let baseCommand = `bun build ${absEntryPoint}`;

        if (outDir) {
          baseCommand += ` --outdir ${outDir}`;
        }
        if (target) {
          baseCommand += ` --target ${target}`;
        }
        if (minify) {
          baseCommand += " --minify";
        }
        if (sourcemap) {
          baseCommand += " --sourcemap";
        }
        if (splitting) {
          baseCommand += " --splitting";
        }

        // Get the appropriate runtime command
        const command = await getRuntimeCommand(baseCommand);

        // Ask for permission
        const permissionMessage = `Build project: ${command}`;
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

        const { stdout, stderr } = await execAsync(command, {
          timeout: 120000, // 2 minute timeout for builds
        });

        return {
          content: [
            {
              type: "text" as const,
              text: stdout || "Build completed successfully",
            },
            ...(stderr
              ? [
                  {
                    type: "text" as const,
                    text: `Build warnings/info: ${stderr}`,
                  },
                ]
              : []),
          ],
        };
      } catch (error) {
        const execError = error as any;
        const stdout = execError.stdout || "";
        const stderr = execError.stderr || "";
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: stdout || "Build failed",
            },
            {
              type: "text" as const,
              text: `Build Error: ${stderr}\nError: ${errorMessage}`,
            },
          ],
        };
      }
    }
  );

  // Tool to run Bun test with optimizations
  server.tool(
    "run-bun-test",
    "Execute tests with Bun's fast test runner",
    {
      testPath: z
        .string()
        .optional()
        .describe("Specific test file or directory to run"),
      coverage: z.boolean().optional().describe("Enable code coverage"),
      watch: z.boolean().optional().describe("Enable watch mode"),
      bail: z.number().optional().describe("Stop after N failures"),
      timeout: z.number().optional().describe("Test timeout in milliseconds"),
    },
    async ({ testPath, coverage, watch, bail, timeout }) => {
      try {
        // Build the command
        let command = "bun test";

        if (testPath) {
          command += ` ${testPath}`;
        }
        if (coverage) {
          command += " --coverage";
        }
        if (watch) {
          command += " --watch";
        }
        if (bail) {
          command += ` --bail ${bail}`;
        }
        if (timeout) {
          command += ` --timeout ${timeout}`;
        }

        // Ask for permission
        const permissionMessage = `Run tests: ${command}`;
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

        const { stdout, stderr } = await execAsync(command, {
          timeout: timeout ? timeout + 10000 : 60000, // Add 10s buffer or default 60s
        });

        return {
          content: [
            {
              type: "text" as const,
              text: stdout || "Tests completed",
            },
            ...(stderr
              ? [
                  {
                    type: "text" as const,
                    text: `Test output: ${stderr}`,
                  },
                ]
              : []),
          ],
        };
      } catch (error) {
        const execError = error as any;
        const stdout = execError.stdout || "";
        const stderr = execError.stderr || "";
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        return {
          content: [
            {
              type: "text" as const,
              text: stdout || "Tests failed or completed with issues",
            },
            {
              type: "text" as const,
              text: `Test Error: ${stderr}\nError: ${errorMessage}`,
            },
          ],
        };
      }
    }
  );
}
