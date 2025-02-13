import * as ts from "typescript";

export interface CodeChunk {
  text: string;
  start: number;
  end: number;
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
      const chunkText = code.substring(node.getStart(), node.getEnd());
      chunks.push({
        text: chunkText,
        start: node.getStart(),
        end: node.getEnd(),
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return chunks;
}
