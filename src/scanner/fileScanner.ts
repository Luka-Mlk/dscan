import ts from "typescript";
import path from "path";
import fs from "fs";
import { DependencyGraph } from "../graph/DependencyGraph.js";
import type { ImportType } from "../graph/graphNode.js";

export class FileScanner {
  graph: DependencyGraph;
  private visitedFiles: Set<string>;

  // TypeScript configuration for module resolution
  private compilerOptions!: ts.CompilerOptions;
  private moduleResolutionHost!: ts.ModuleResolutionHost;

  constructor() {
    this.graph = new DependencyGraph();
    this.visitedFiles = new Set();
  }

  /**
   * Loads the tsconfig.json and initializes the necessary compiler components
   * to correctly resolve module paths and aliases.
   */
  loadConfig(rootDir: string, tsconfigPath: string = "tsconfig.json") {
    // 1. Find config
    const configPath = ts.findConfigFile(
      rootDir,
      ts.sys.fileExists,
      tsconfigPath,
    );

    if (!configPath) {
      console.warn(
        `[FileScanner] Warning: tsconfig file ${tsconfigPath} not found at or above ${rootDir}. Aliases will not be resolved.`,
      );
      this.compilerOptions = ts.getDefaultCompilerOptions();
      this.moduleResolutionHost = ts.sys;
      return;
    }

    // 2. Read and parse config
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsedConfig = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(configPath),
    );

    // 3. Store options and create host for resolution
    this.compilerOptions = parsedConfig.options;
    this.moduleResolutionHost = ts.createCompilerHost(
      this.compilerOptions,
      true,
    );
  }

  // Scan whole project
  scanProject(rootDir: string, tsconfigPath: string = "tsconfig.json") {
    // Load config before scan for alias resolution
    this.loadConfig(rootDir, tsconfigPath);

    this.walkDir(rootDir).forEach((file) => this.scanFile(file));
  }

  private walkDir(dir: string): string[] {
    const results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // skip noise
        if (entry.name === "node_modules" || entry.name === "dist") {
          continue;
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
    // Recurse to scan the newly discovered file
    this.scanFile(resolvedPath);
  }

  /**
   * Resolves an import path using the TypeScript compiler's logic,
   * which correctly handles aliases, relative paths, and extensions.
   */
  private resolveImport(fromFile: string, importedPath: string): string | null {
    // 1. Use the TypeScript API for resolution
    const resolved = ts.resolveModuleName(
      importedPath,
      fromFile,
      this.compilerOptions,
      this.moduleResolutionHost,
    );

    if (resolved.resolvedModule && resolved.resolvedModule.resolvedFileName) {
      let finalPath = resolved.resolvedModule.resolvedFileName;

      // 2. Filter out external node_modules
      if (finalPath.includes("node_modules")) {
        return null;
      }

      // 3. Normalize the path and ensure it points to a source file
      // TypeScript resolution often points to .js or .d.ts files, but we want the original .ts
      if (finalPath.endsWith(".d.ts")) {
        finalPath = finalPath.replace(/\.d\.ts$/, ".ts");
      }

      // Final sanity check and normalization
      if (fs.existsSync(finalPath) && /\.(ts|tsx|js|jsx)$/.test(finalPath)) {
        return path.resolve(finalPath);
      }
    }

    return null;
  }
}
