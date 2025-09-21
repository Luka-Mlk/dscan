// src/graph/DependencyGraph.ts
import { GraphNode } from "./graphNode.js";
import type { ImportType } from "./graphNode.js";

export class DependencyGraph {
  private nodes: Map<string, GraphNode>;

  constructor() {
    this.nodes = new Map();
  }

  addNode(filePath: string) {
    if (!this.nodes.has(filePath)) {
      this.nodes.set(filePath, new GraphNode(filePath));
    }
  }

  addEdge(from: string, to: string, type: ImportType) {
    this.addNode(from);
    this.addNode(to);

    const fromNode = this.nodes.get(from)!;
    const toNode = this.nodes.get(to)!;

    fromNode.addDependency(to, type);
    toNode.addDependant(from);
  }

  getNode(filePath: string): GraphNode | undefined {
    return this.nodes.get(filePath);
  }

  getDependants(filePath: string): string[] {
    return Array.from(this.nodes.get(filePath)?.dependants || []);
  }

  getDependencies(filePath: string): string[] {
    return Array.from(this.nodes.get(filePath)?.dependencies.keys() || []);
  }

  // Simple cycle detection using DFS
  detectCycles(): string[][] {
    const visited = new Set<string>();
    const stack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (nodePath: string, path: string[]) => {
      if (stack.has(nodePath)) {
        const cycleStart = path.indexOf(nodePath);
        cycles.push(path.slice(cycleStart));
        return;
      }

      if (visited.has(nodePath)) return;

      visited.add(nodePath);
      stack.add(nodePath);

      const node = this.nodes.get(nodePath);
      if (node) {
        for (const dep of node.dependencies.keys()) {
          dfs(dep, [...path, dep]);
        }
      }

      stack.delete(nodePath);
    };

    for (const filePath of this.nodes.keys()) {
      dfs(filePath, [filePath]);
    }

    return cycles;
  }

  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }
}
