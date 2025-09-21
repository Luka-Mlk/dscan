// src/formatter/Outputter.ts
import { DependencyGraph } from "../graph/DependencyGraph.js";

interface OutputOptions {
  json?: boolean;
  verbose?: boolean;
  reverse?: boolean;
}

export class Outputter {
  private graph: DependencyGraph;
  private options: OutputOptions;

  constructor(graph: DependencyGraph, options: OutputOptions) {
    this.graph = graph;
    this.options = options;
  }

  print(targetFile: string) {
    const node = this.graph.getNode(targetFile);
    if (!node) {
      console.error("File not found in graph:", targetFile);
      return;
    }

    if (this.options.json) {
      const output = {
        file: node.filePath,
        dependencies: Array.from(node.dependencies.keys()),
        dependants: Array.from(node.dependants),
      };
      console.log(JSON.stringify(output, null, 2));
      return;
    }

    let filesToShow: string[];
    if (this.options.reverse) {
      filesToShow = this.graph.getDependants(targetFile);
    } else {
      filesToShow = this.graph.getDependencies(targetFile);
    }

    if (this.options.verbose) {
      console.log(`Target file: ${targetFile}`);
      console.log(this.options.reverse ? "Dependants:" : "Dependencies:");
      for (const f of filesToShow) {
        console.log(`- ${f}`);
      }
    } else {
      filesToShow.forEach((f) => console.log(f));
    }
  }
}
