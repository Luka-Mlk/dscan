import ts from "typescript";
import path from "path";
import fs from "fs";

export class ImportResolver {
  constructor(
    private compilerOptions: ts.CompilerOptions = {
      allowJs: true,
      jsx: ts.JsxEmit.React,
      moduleResolution: ts.ModuleResolutionKind.Node10,
      target: ts.ScriptTarget.ESNext,
    },
  ) {}

  /**
   * Extract relative and aliased imports from a given file
   */
  extract(filePath: string): string[] {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const program = ts.createProgram([filePath], this.compilerOptions);
    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) return [];

    const imports: string[] = [];

    const visit = (node: ts.Node) => {
      // import ... from "..."
      if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
        this.addIfRelative(filePath, node.moduleSpecifier, imports);
      }

      // export ... from "..."
      if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
        this.addIfRelative(filePath, node.moduleSpecifier, imports);
      }

      // require("...") anywhere
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "require" &&
        node.arguments.length === 1
      ) {
        const arg = node.arguments[0];
        if (ts.isStringLiteral(arg as ts.Expression)) {
          this.addIfRelative(filePath, arg as ts.Expression, imports);
        }
      }

      // dynamic import("...") anywhere
      if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.length === 1
      ) {
        const arg = node.arguments[0];
        if (ts.isStringLiteral(arg as ts.Expression)) {
          this.addIfRelative(filePath, arg as ts.Expression, imports);
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return imports;
  }

  /**
   * Add a module specifier if it's relative or aliased
   */
  private addIfRelative(
    filePath: string,
    specifier: ts.Expression,
    imports: string[],
  ) {
    if (!ts.isStringLiteral(specifier)) return;

    const raw = specifier.text;

    if (raw.startsWith(".") || raw.startsWith("/")) {
      const base = path.resolve(path.dirname(filePath), raw);
      const resolved = this.tryResolve(base);
      if (resolved) {
        imports.push(resolved);
      }
    } else {
      // non-relative: keep raw (aliased or package import)
      imports.push(raw);
    }
  }

  /**
   * Try to resolve a module path with extension replacement, extensions and index files.
   *
   * - If the specifier already had an extension (e.g. .js), try replacing it with .ts/.tsx/etc.
   * - If the specifier had no extension, try adding extensions.
   * - If the specifier points to a directory, try index.* inside it.
   */
  private tryResolve(base: string): string | null {
    const exts = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

    try {
      // Exact file (maybe the specifier already included the correct filename)
      if (fs.existsSync(base) && fs.statSync(base).isFile()) {
        return fs.realpathSync(base);
      }

      const baseExt = path.extname(base);
      // If the base already had an extension (e.g. ./foo/bar.js), try replacing it with other extensions
      if (baseExt) {
        const baseNoExt = base.slice(0, -baseExt.length);
        for (const ext of exts) {
          const candidate = baseNoExt + ext;
          if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            return fs.realpathSync(candidate);
          }
        }
      }

      // Try base + known extensions (handles import "./foo/bar" -> foo.ts/js etc.)
      for (const ext of exts) {
        const candidate = base + ext;
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return fs.realpathSync(candidate);
        }
      }

      // If base is a directory, try index.* inside it
      if (fs.existsSync(base) && fs.statSync(base).isDirectory()) {
        for (const ext of exts) {
          const candidate = path.join(base, "index" + ext);
          if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            return fs.realpathSync(candidate);
          }
        }
      }
    } catch (err) {
      // Ignore filesystem errors and treat as unresolved
      return null;
    }

    return null;
  }
}
