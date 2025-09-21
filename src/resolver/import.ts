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
   * Extract relative imports from a given file
   */
  extract(filePath: string): string[] {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const program = ts.createProgram([filePath], this.compilerOptions);
    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) return [];

    const imports: string[] = [];

    ts.forEachChild(sourceFile, (node) => {
      // import ... from "..."
      if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
        this.addIfRelative(filePath, node.moduleSpecifier, imports);
      }

      // export ... from "..."
      if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
        this.addIfRelative(filePath, node.moduleSpecifier, imports);
      }

      // require("...")
      if (
        ts.isCallExpression(node) &&
        node.expression.getText() === "require" &&
        node.arguments.length === 1
      ) {
        const arg = node.arguments[0];
        if (ts.isStringLiteral(arg as ts.Expression)) {
          this.addIfRelative(filePath, arg as ts.Expression, imports);
        }
      }
    });

    return imports;
  }

  /**
   * Add a module specifier if it's a relative path
   */
  private addIfRelative(
    filePath: string,
    specifier: ts.Expression,
    imports: string[],
  ) {
    if (ts.isStringLiteral(specifier)) {
      const raw = specifier.text;
      if (raw.startsWith(".") || raw.startsWith("/")) {
        const resolved = path.resolve(path.dirname(filePath), raw);
        imports.push(resolved);
      }
    }
  }
}
