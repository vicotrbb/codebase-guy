import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as chokidar from "chokidar";
import * as fs from "fs/promises";
import * as path from "path";
import { performance } from "perf_hooks";
import crypto from "node:crypto";
import { chunkCodeByAST } from "./chunker";

export const DEFAULT_IGNORE_PATTERNS = [
  "node_modules/",
  ".venv/",
  "dist/",
  ".git/",
  ".next/",
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.test",
  ".env.test.local",
  ".vscode/",
];

export const SUPPORTED_FILE_EXTENSIONS = ["js", "ts", "jsx", "tsx"];

interface Args {
  folder: string;
  project: string;
  baseUrl: string;
  heartbeatInterval: number;
}

const argv = yargs(hideBin(process.argv))
  .option("folder", {
    alias: "f",
    type: "string",
    description: "Path of the project folder to scan",
    demandOption: true,
    default: ".",
  })
  .option("project", {
    alias: "p",
    type: "string",
    description: "Project name",
    demandOption: true,
    default: "Unknown",
  })
  .option("baseUrl", {
    alias: "r",
    type: "string",
    description: "Base URL for agent actions with codebase guy server.",
    demandOption: true,
    default: "http://localhost:3000",
  })
  .option("heartbeatInterval", {
    alias: "i",
    type: "number",
    description: "Heartbeat interval in seconds.",
    demandOption: false,
    default: 30,
  })
  .help();

const args = argv.parseSync() as Args;

const projectFolder = args.folder;
const projectName = args.project;
const baseUrl = args.baseUrl;
const heartbeatInterval = args.heartbeatInterval;

// Generate a unique agent ID with the project name abbreviation and the first 8 characters of a hash from the project name
const agentId = `${projectName.slice(0, 6).toUpperCase()}-${crypto
  .createHash("sha256")
  .update(projectName)
  .digest("hex")
  .substring(0, 8)}`;

let ignorePatterns: string[] = [];

// Add these variables at the top level with other global variables
let totalFilesToProcess = 0;
let filesProcessed = 0;

/**
 * Loads ignore patterns from .agentignore file
 */
async function loadIgnorePatterns(): Promise<string[]> {
  try {
    const ignoreFile = await fs.readFile(
      path.join(projectFolder, ".agentignore"),
      "utf-8"
    );
    return ignoreFile
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
  } catch (error) {
    console.log("No .agentignore file found, using default ignores");
    return DEFAULT_IGNORE_PATTERNS;
  }
}

/**
 * Checks if a path should be ignored based on ignore patterns
 */
function shouldIgnore(filePath: string, patterns: string[]): boolean {
  const relativePath = path.relative(projectFolder, filePath);
  return patterns.some((pattern) => {
    // Remove trailing slash for directory patterns
    const cleanPattern = pattern.replace(/\/$/, "");
    return relativePath.startsWith(cleanPattern);
  });
}

/**
 * Registers the agent by sending a POST request to `${baseRegisterUrl}/agents/register`.
 */
async function registerAgent(): Promise<void> {
  const url = `${baseUrl}/api/agents/register`;
  const payload = { project: projectName, agentId };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Failed to register agent: ${response.statusText}`);
    } else {
      console.log(`Agent registered successfully with ID ${agentId}`);
    }
  } catch (error) {
    console.error("Error registering agent:", error);
  }
}

/**
 * Sends a heartbeat to `${baseRegisterUrl}/agents/${agentId}/heartbeat`.
 */
async function sendHeartbeat(): Promise<void> {
  const url = `${baseUrl}/api/agents/${agentId}/heartbeat`;
  const payload = {
    project: projectName,
    agentId,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Heartbeat failed: ${response.statusText}`);
    } else {
      console.log(`Heartbeat sent at ${new Date().toISOString()}`);
    }
  } catch (error) {
    console.error("Error sending heartbeat:", error);
  }
}

/**
 * Notifies that the agent is going down by sending a POST request to
 * `${baseRegisterUrl}/agents/${agentId}/down`.
 */
async function sendTermination(): Promise<void> {
  const url = `${baseUrl}/api/agents/${agentId}/down`;
  const payload = {
    project: projectName,
    agentId,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Termination notification failed: ${response.statusText}`);
    } else {
      console.log(`Termination notification sent for agent ${agentId}`);
    }
  } catch (error) {
    console.error("Error sending termination notification:", error);
  }
}

/**
 * Recursively retrieves all files in a directory filtering by extension.
 */
async function getFiles(dir: string): Promise<string[]> {
  if (!ignorePatterns.length) {
    ignorePatterns = await loadIgnorePatterns();
  }

  let results: string[] = [];
  const list = await fs.readdir(dir);

  for (const file of list) {
    const filePath = path.join(dir, file);
    if (shouldIgnore(filePath, ignorePatterns)) {
      continue;
    }

    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      results = results.concat(await getFiles(filePath));
    } else if (
      SUPPORTED_FILE_EXTENSIONS.some((ext) => file.endsWith(`.${ext}`))
    ) {
      results.push(filePath);
    }
  }

  return results;
}

/**
 * Processes a single file:
 * - Reads the file content.
 * - Extracts file-specific chunks via AST parsing.
 * - Generates embeddings for each chunk.
 * - Sends the embedding data to the server.
 */
async function processFile(filePath: string): Promise<void> {
  try {
    const url = `${baseUrl}/api/agents/${agentId}/process-chunk`;
    const content = await fs.readFile(filePath, "utf-8");
    const chunks = chunkCodeByAST(content);

    console.log(`Processing file ${filePath} with ${chunks.length} chunks`);

    for (const chunk of chunks) {
      const payload = {
        projectName,
        fileName: path.basename(filePath),
        filePath,
        absolutePath: filePath,
        chunkText: chunk.text,
        chunkStart: chunk.start,
        chunkEnd: chunk.end,
        chunkStartLine: chunk.startLine,
        chunkEndLine: chunk.endLine,
        progress: {
          totalFiles: totalFilesToProcess,
          processedFiles: filesProcessed,
          percentComplete: Math.round(
            (filesProcessed / totalFilesToProcess) * 100
          ),
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(`Failed to process chunk: ${response.statusText}`);
      }

      setTimeout(() => null, 200);
    }

    filesProcessed++;
    console.log(
      `Processed ${filePath} successfully (${filesProcessed}/${totalFilesToProcess})`
    );
  } catch (err) {
    console.error(`Error processing file ${filePath}:`, err);
  }
}

/**
 * Deletes a folder from the server.
 */
async function deleteFolder(filePath: string): Promise<void> {
  try {
    const url = `${baseUrl}/api/agents/${agentId}/delete-folder`;
    const payload = { projectName, filePath };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Failed to delete folder: ${response.statusText}`);
    } else {
      console.log(`Folder deleted successfully: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting folder ${filePath}:`, error);
  }
}

/**
 * Performs an initial scan of the project folder.
 */
async function initialScan(folder: string): Promise<void> {
  const files = await getFiles(folder);
  totalFilesToProcess = files.length;
  filesProcessed = 0;

  console.log(
    `Found ${files.length} files in ${folder}. Starting initial processing...`
  );

  for (const file of files) {
    await processFile(file);
  }

  console.log(`Initial scan completed for ${folder}`);
}

/**
 * Sets up a file watcher using chokidar to monitor the folder for changes.
 */
function watchFolder(folder: string): void {
  const watcher = chokidar.watch(folder, {
    ignored: [
      /(^|[\/\\])\./, // ignore dotfiles (keep this default)
      ...ignorePatterns.map((pattern) => {
        // Convert relative patterns to absolute patterns for chokidar
        return path.join(projectFolder, pattern);
      }),
    ],
    persistent: true,
    ignoreInitial: true,
    usePolling: false, // minimal system impact
  });

  watcher
    .on("add", async (filePath) => {
      if (/\.(js|ts|py)$/.test(filePath)) {
        totalFilesToProcess++;
        console.log(`File added: ${filePath}`);
        await processFile(filePath);
      }
    })
    .on("change", (filePath) => {
      if (/\.(js|ts|py)$/.test(filePath)) {
        console.log(`File changed: ${filePath}`);
        processFile(filePath);
      }
    })
    .on("unlink", async (filePath) => {
      if (/\.(js|ts|py)$/.test(filePath)) {
        totalFilesToProcess--;
        filesProcessed = Math.max(0, filesProcessed - 1);
        console.log(`File removed: ${filePath}`);
        await deleteFolder(filePath);
      }
    });
}

// Register termination events to send termination notification.
function setupTerminationHandlers() {
  const terminationHandler = async () => {
    console.log(
      "Termination signal received. Sending termination notification..."
    );

    await sendTermination();
    process.exit(0);
  };

  const unhandledErrorHandler = async (error: Error) => {
    console.error("Unhandled error occurred:", error);
    await sendTermination();
    process.exit(1);
  };

  // Handle SIGINT and SIGTERM signals
  process.on("SIGINT", terminationHandler);
  process.on("SIGTERM", terminationHandler);

  // Handle unhandled errors and promise rejections
  process.on("uncaughtException", unhandledErrorHandler);
  process.on("unhandledRejection", unhandledErrorHandler);
}

/**
 * Main function:
 * - Registers the agent.
 * - Sets up termination handlers.
 * - Performs an initial scan.
 * - Sends periodic heartbeats.
 * - Watches the folder for changes.
 */
(async () => {
  console.log(
    `Starting CodeBase Chat agent for project "${projectName}" at folder "${projectFolder}"`
  );

  await registerAgent();
  setupTerminationHandlers();

  // Start periodic heartbeat (every 30 seconds)
  setInterval(sendHeartbeat, heartbeatInterval * 1000);

  const start = performance.now();
  await initialScan(projectFolder);
  const duration = ((performance.now() - start) / 1000).toFixed(2);
  console.log(`Initial scan completed in ${duration} seconds.`);
  watchFolder(projectFolder);
})();
