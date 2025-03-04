import * as ts from "typescript";

export interface CodeChunk {
  text: string;
  start: number;
  end: number;
  startLine: number;
  endLine: number;
  type?: string; // Type of the chunk (function, class, method, etc.)
  name?: string; // Name of the declaration if available
}

/**
 * Parses the provided source code using the TypeScript compiler API,
 * traverses the AST, and extracts file-specific code chunks for meaningful constructs.
 * Extracts functions, methods, classes, interfaces, enums, and arrow functions.
 *
 * @param code - The source code as a string.
 * @param filePath - Optional path to the file being processed (for reference).
 * @returns An array of CodeChunk objects, each containing the chunk's text and metadata.
 */
export function chunkCodeByAST(
  code: string,
  filePath: string = "temp.ts"
): CodeChunk[] {
  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.Latest,
    true
  );

  const chunks: CodeChunk[] = [];

  // Recursive function to visit AST nodes.
  function visit(node: ts.Node) {
    let type: string | undefined;
    let name: string | undefined;

    // Function Declaration
    if (ts.isFunctionDeclaration(node)) {
      type = "function";
      name = node.name?.getText(sourceFile);
    }
    // Method Declaration
    else if (ts.isMethodDeclaration(node)) {
      type = "method";
      name = node.name.getText(sourceFile);
    }
    // Class Declaration
    else if (ts.isClassDeclaration(node)) {
      type = "class";
      name = node.name?.getText(sourceFile);
    }
    // Interface Declaration
    else if (ts.isInterfaceDeclaration(node)) {
      type = "interface";
      name = node.name.getText(sourceFile);
    }
    // Enum Declaration
    else if (ts.isEnumDeclaration(node)) {
      type = "enum";
      name = node.name.getText(sourceFile);
    }
    // Arrow Function assigned to a variable
    else if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      ts.isArrowFunction(node.initializer)
    ) {
      type = "arrow_function";
      name = node.name.getText(sourceFile);
    }

    // If this is a chunk we want to capture
    if (type) {
      const start = node.getStart(sourceFile);
      const end = node.getEnd();
      const startLine =
        ts.getLineAndCharacterOfPosition(sourceFile, start).line + 1;
      const endLine =
        ts.getLineAndCharacterOfPosition(sourceFile, end).line + 1;
      const chunkText = code.substring(start, end);

      chunks.push({
        text: chunkText,
        start,
        end,
        startLine,
        endLine,
        type,
        name,
      });
    }

    // Continue traversing
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return chunks;
}

/**
 * Process a specific file and extract code chunks.
 *
 * @param filePath - Path to the TypeScript file to process.
 * @returns Array of CodeChunk objects extracted from the file.
 */
export function chunkFile(filePath: string): CodeChunk[] {
  try {
    const fs = require("fs");
    const code = fs.readFileSync(filePath, "utf8");
    return chunkCodeByAST(code, filePath);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return [];
  }
}

/**
 * Process a directory of TypeScript files and extract code chunks.
 *
 * @param directoryPath - Path to the directory containing TypeScript files.
 * @param recursive - Whether to recursively traverse subdirectories.
 * @returns Object mapping file paths to arrays of CodeChunk objects.
 */
export function chunkDirectory(
  directoryPath: string,
  recursive: boolean = true
): Record<string, CodeChunk[]> {
  const fs = require("fs");
  const path = require("path");
  const result: Record<string, CodeChunk[]> = {};

  function processDirectory(dirPath: string) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory() && recursive) {
        processDirectory(fullPath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".ts") ||
          entry.name.endsWith(".tsx") ||
          entry.name.endsWith(".js") ||
          entry.name.endsWith(".jsx"))
      ) {
        result[fullPath] = chunkFile(fullPath);
      }
    }
  }

  processDirectory(directoryPath);
  return result;
}
