class DependencyGraph {
  private graph: Map<string, Set<string>>;

  constructor() {
    this.graph = new Map();
  }

  addFile(file: string): void {
    if (!this.graph.has(file)) {
      this.graph.set(file, new Set());
    }
  }

  addDependency(file: string, dependency: string): void {
    this.addFile(file);
    this.addFile(dependency);
    this.graph.get(file)!.add(dependency);
  }

  getDependencies(file: string): string[] {
    return Array.from(this.graph.get(file) ?? []);
  }

  getAllDependencies(
    file: string,
    visited: Set<string> = new Set(),
    depth: number = Infinity,
  ): string[] {
    if (visited.has(file) || depth < 1) return [];
    visited.add(file);

    const directDeps = this.getDependencies(file);
    for (const dep of directDeps) {
      this.getAllDependencies(dep, visited, depth - 1);
    }

    return Array.from(visited).filter((f) => f !== file);
  }

  hasCycle(): boolean {
    const visited = new Set<string>();
    const stack = new Set<string>();

    const dfs = (node: string): boolean => {
      if (stack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      stack.add(node);

      for (const neighbor of this.getDependencies(node)) {
        if (dfs(neighbor)) return true;
      }

      stack.delete(node);
      return false;
    };

    for (const node of this.graph.keys()) {
      if (dfs(node)) return true;
    }

    return false;
  }
}

export default DependencyGraph;
