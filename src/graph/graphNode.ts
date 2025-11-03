export type ImportType = "import" | "require";

export class GraphNode {
  filePath: string;
  dependencies: Map<string, ImportType>; // edges from this file → imported files
  dependants: Set<string>; // files importing this file

  constructor(filePath: string) {
    this.filePath = filePath;
    this.dependencies = new Map();
    this.dependants = new Set();
  }

  addDependency(file: string, type: ImportType) {
    this.dependencies.set(file, type);
  }

  addDependant(file: string) {
    this.dependants.add(file);
  }
}
