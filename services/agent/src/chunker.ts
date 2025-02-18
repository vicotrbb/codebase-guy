import * as ts from "typescript";

export interface CodeChunk {
  text: string;
  start: number;
  end: number;
  startLine: number;
  endLine: number;
}

/**
 * Parses the provided source code using the TypeScript compiler API,
 * traverses the AST, and extracts file-specific code chunks for meaningful constructs.
 * Currently extracts functions, methods, classes, interfaces, and enums.
 *
 * @param code - The source code as a string.
 * @returns An array of CodeChunk objects, each containing the chunk's text and its start/end positions.
 */
export function chunkCodeByAST(code: string): CodeChunk[] {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    code,
    ts.ScriptTarget.Latest,
    true
  );

  const chunks: CodeChunk[] = [];

  // Recursive function to visit AST nodes.
  function visit(node: ts.Node) {
    // Check if the node is one of the desired constructs.
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isClassDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isEnumDeclaration(node)
    ) {
      const start = node.getStart();
      const end = node.getEnd();
      const startLine =
        ts.getLineAndCharacterOfPosition(sourceFile, start).line + 1; // +1 for 1-indexed line numbers
      const endLine =
        ts.getLineAndCharacterOfPosition(sourceFile, end).line + 1;
      const chunkText = code.substring(start, end);

      chunks.push({
        text: chunkText,
        start: node.getStart(),
        end: node.getEnd(),
        startLine,
        endLine,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return chunks;
}
