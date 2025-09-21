// src/scanner/FileScanner.ts
import ts from "typescript";
import path from "path";
import fs from "fs";
import { DependencyGraph } from "../graph/DependencyGraph.js";
import type { ImportType } from "../graph/graphNode.js";

export class FileScanner {
  private graph: DependencyGraph;
  private visitedFiles: Set<string>;

  constructor(graph: DependencyGraph) {
    this.graph = graph;
    this.visitedFiles = new Set();
  }

  // 🚀 Scan the whole project (starting from a directory, e.g. "src")
  scanProject(rootDir: string) {
    this.walkDir(rootDir).forEach((file) => this.scanFile(file));
  }

  private walkDir(dir: string): string[] {
    const results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === "dist") {
          continue; // 🚫 skip noise
        }
        results.push(...this.walkDir(fullPath));
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        results.push(path.resolve(fullPath));
      }
    }

    return results;
  }

  scanFile(filePath: string) {
    const normalizedPath = path.resolve(filePath);
    if (this.visitedFiles.has(normalizedPath)) return;
    if (!fs.existsSync(normalizedPath)) return;

    this.visitedFiles.add(normalizedPath);
    this.graph.addNode(normalizedPath);

    const sourceFile = ts.createSourceFile(
      normalizedPath,
      fs.readFileSync(normalizedPath, "utf8"),
      ts.ScriptTarget.Latest,
      true,
    );

    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
        const importedPath = (node.moduleSpecifier as ts.StringLiteral).text;
        this.handleImport(normalizedPath, importedPath, "import");
      } else if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "require" &&
        node.arguments.length === 1 &&
        ts.isStringLiteral(node.arguments[0] as ts.Expression)
      ) {
        const importedPath = (node.arguments[0] as ts.StringLiteral).text;
        this.handleImport(normalizedPath, importedPath, "require");
      }

      ts.forEachChild(node, visit);
    };

    ts.forEachChild(sourceFile, visit);
  }

  private handleImport(
    fromFile: string,
    importedPath: string,
    type: ImportType,
  ) {
    const resolvedPath = this.resolveImport(fromFile, importedPath);
    if (!resolvedPath) return;

    this.graph.addEdge(fromFile, resolvedPath, type);
  }

  private resolveImport(fromFile: string, importedPath: string): string | null {
    if (importedPath.startsWith(".") || importedPath.startsWith("/")) {
      const basePath = path.resolve(path.dirname(fromFile), importedPath);

      const candidates = [];

      if (importedPath.endsWith(".js")) {
        // try .ts alternative first
        candidates.push(basePath.replace(/\.js$/, ".ts"));
        candidates.push(basePath.replace(/\.js$/, ".tsx"));
      }

      candidates.push(basePath); // exact path
      candidates.push(
        basePath + ".ts",
        basePath + ".tsx",
        basePath + ".js",
        basePath + ".jsx",
      );
      candidates.push(
        basePath + "/index.ts",
        basePath + "/index.tsx",
        basePath + "/index.js",
        basePath + "/index.jsx",
      );

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) return path.resolve(candidate);
      }

      return null;
    } else {
      return null; // external module
    }
  }
}
