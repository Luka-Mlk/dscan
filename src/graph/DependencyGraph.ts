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

  getAllDependantsRecursively(filePath: string): string[] {
    const allDependants = new Set<string>();
    const queue: string[] = [];

    const node = this.nodes.get(filePath);
    if (!node) return [];

    // Start with direct dependants
    node.dependants.forEach((dependantPath) => {
      if (!allDependants.has(dependantPath)) {
        allDependants.add(dependantPath);
        queue.push(dependantPath);
      }
    });
    while (queue.length > 0) {
      const currentDependantPath = queue.shift()!;
      const dependantNode = this.nodes.get(currentDependantPath);

      if (dependantNode) {
        dependantNode.dependants.forEach((nextDependantPath) => {
          if (!allDependants.has(nextDependantPath)) {
            allDependants.add(nextDependantPath);
            queue.push(nextDependantPath);
          }
        });
      }
    }
    allDependants.delete(filePath);
    return Array.from(allDependants);
  }

  getDependants(filePath: string): string[] {
    return Array.from(this.nodes.get(filePath)?.dependants || []);
  }

  getAllDependenciesRecursively(filePath: string): string[] {
    const allDependencies = new Set<string>();
    const queue: string[] = [];

    const node = this.nodes.get(filePath);
    if (!node) return [];

    // Start with direct dependencies
    node.dependencies.keys().forEach((dependencyPath) => {
      if (!allDependencies.has(dependencyPath)) {
        allDependencies.add(dependencyPath);
        queue.push(dependencyPath);
      }
    });

    // BFS to find indirect dependencies
    while (queue.length > 0) {
      const currentDependencyPath = queue.shift()!;
      const dependencyNode = this.nodes.get(currentDependencyPath);

      if (dependencyNode) {
        dependencyNode.dependencies.keys().forEach((nextDependencyPath) => {
          if (!allDependencies.has(nextDependencyPath)) {
            allDependencies.add(nextDependencyPath);
            queue.push(nextDependencyPath);
          }
        });
      }
    }

    return Array.from(allDependencies);
  }

  getDependencies(filePath: string): string[] {
    return Array.from(this.nodes.get(filePath)?.dependencies.keys() || []);
  }

  // Simple cycle detection DFS
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
