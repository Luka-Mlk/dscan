import fs from "fs";
import path from "path";
import DependencyGraph from "../graph/dependency.js";
import { ImportResolver } from "../resolver/import.js";

export class ProjectScanner {
  constructor(private resolver: ImportResolver) {}

  buildGraph(entryFiles: string[]): DependencyGraph {
    const graph = new DependencyGraph();
    const seen = new Set<string>();

    const visit = (file: string) => {
      if (seen.has(file)) return;
      seen.add(file);

      graph.addFile(file);
      const deps = this.resolver.extract(file);
      for (const dep of deps) {
        graph.addDependency(file, dep);
        visit(dep);
      }
    };

    for (const file of entryFiles) {
      visit(file);
    }

    return graph;
  }

  // Optional helper to scan all files in a directory recursively
  scanDirectory(dir: string, exts = [".ts", ".tsx", ".js", ".jsx"]): string[] {
    const results: string[] = [];
    const walk = (d: string) => {
      for (const f of fs.readdirSync(d)) {
        const full = path.join(d, f);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) walk(full);
        else if (exts.includes(path.extname(f))) results.push(full);
      }
    };
    walk(dir);
    return results;
  }
}
