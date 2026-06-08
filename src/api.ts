import { FileScanner } from "./scanner/fileScanner.js";
import { DependencyGraph } from "./graph/DependencyGraph.js";
import { GraphNode } from "./graph/graphNode.js";
import type { ImportType } from "./graph/graphNode.js";

export type { ImportType };
export { GraphNode, DependencyGraph };

export interface ScanOptions {
  rootDir: string;
  tsconfig?: string;
}

export interface ScanResult {
  getDependencies(file: string): string[];
  getAllDependencies(file: string): string[];
  getDependants(file: string): string[];
  getAllDependants(file: string): string[];
  getNode(file: string): GraphNode | undefined;
  detectCycles(): string[][];
  getAllFiles(): string[];
  getGraph(): DependencyGraph;
}

export function scanProject(options: ScanOptions): ScanResult {
  const scanner = new FileScanner();
  scanner.scanProject(options.rootDir, options.tsconfig ?? "tsconfig.json");
  const graph = scanner.graph;

  return {
    getDependencies(file: string) {
      return graph.getDependencies(file);
    },
    getAllDependencies(file: string) {
      return graph.getAllDependenciesRecursively(file);
    },
    getDependants(file: string) {
      return graph.getDependants(file);
    },
    getAllDependants(file: string) {
      return graph.getAllDependantsRecursively(file);
    },
    getNode(file: string) {
      return graph.getNode(file);
    },
    detectCycles() {
      return graph.detectCycles();
    },
    getAllFiles() {
      return graph.getAllNodes().map((n) => n.filePath);
    },
    getGraph() {
      return graph;
    },
  };
}
