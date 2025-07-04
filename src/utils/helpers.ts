import { exec } from "child_process";
import { promisify } from "util";
import notifier from "node-notifier";
import { ServerInfo } from "../types/index.js";

// Promisify exec
export const execAsync = promisify(exec);

// Map to store running servers
export const runningServers = new Map<string, ServerInfo>();

// Variable to store the currently selected Node.js version (private)
let _selectedNodeVersion: string | null = null;

// Variable to store the currently selected Bun version (private)
let _selectedBunVersion: string | null = null;

// Cache for runtime detection
let _bunAvailable: boolean | null = null;

// Function to detect if Bun is available
export async function isBunAvailable(): Promise<boolean> {
  if (_bunAvailable !== null) {
    return _bunAvailable;
  }

  try {
    await execAsync("bun --version");
    _bunAvailable = true;
    return true;
  } catch (error) {
    _bunAvailable = false;
    return false;
  }
}

// Function to get the appropriate runtime command (bun or npm)
export async function getRuntimeCommand(command: string): Promise<string> {
  const bunAvailable = await isBunAvailable();

  if (bunAvailable) {
    return command; // Use Bun command as-is
  }

  // Fallback to npm equivalents
  if (command.startsWith("bun run ")) {
    return command.replace("bun run ", "npm run ");
  }
  if (command.startsWith("bun build ")) {
    // For build commands, we might need different handling
    return command.replace("bun build ", "npx esbuild ");
  }
  if (command.startsWith("bun ")) {
    return command.replace("bun ", "node ");
  }

  return command;
}

// Function to get the currently selected Node.js version
export function getSelectedNodeVersion(): string | null {
  return _selectedNodeVersion;
}

// Function to set the selected Node.js version
export function setSelectedNodeVersion(version: string | null): void {
  _selectedNodeVersion = version;
}

// Function to get the currently selected Bun version
export function getSelectedBunVersion(): string | null {
  return _selectedBunVersion;
}

// Function to set the selected Bun version
export function setSelectedBunVersion(version: string | null): void {
  _selectedBunVersion = version;
}

// Generate a unique ID for servers
export function generateServerId(): string {
  return `server-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Helper function to ask for permission using node-notifier
 */
export async function askPermission(action: string): Promise<boolean> {
  // Skip notification if DISABLE_NOTIFICATIONS is set
  if (process.env.DISABLE_NOTIFICATIONS === "true") {
    console.log(`Auto-allowing action (notifications disabled): ${action}`);
    return true;
  }

  return new Promise((resolve) => {
    notifier.notify(
      {
        title: "BunRunner Permission Request",
        message: `${action}`,
        wait: true,
        timeout: 60,
        actions: "Allow",
        closeLabel: "Deny",
      },
      (err, response, metadata) => {
        if (err) {
          console.error("Error showing notification:", err);
          resolve(false);
          return;
        }

        const buttonPressed = metadata?.activationValue || response;
        resolve(buttonPressed !== "Deny");
      }
    );
  });
}
