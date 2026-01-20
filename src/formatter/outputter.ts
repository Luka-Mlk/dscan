import { DependencyGraph } from "../graph/DependencyGraph.js";

type OutputOptions = {
  json?: boolean;
  verbose?: boolean;
  reverse?: boolean;
};

export class Outputter {
  private graph: DependencyGraph;
  private options: OutputOptions;

  constructor(graph: DependencyGraph, options: OutputOptions) {
    this.graph = graph;
    this.options = options;
  }

  formatJSON(
    targetFile: string,
  ):
    | { file: string; dependencies: string[]; dependants: string[] }
    | undefined {
    const node = this.graph.getNode(targetFile);
    if (!node) {
      console.error("File not found in graph:", targetFile);
      return;
    }

    return {
      file: node.filePath,
      dependencies: this.graph.getAllDependenciesRecursively(targetFile),
      dependants: this.graph.getAllDependantsRecursively(targetFile),
    };
  }

  formatFiles(targetFile: string): string[] | undefined {
    const node = this.graph.getNode(targetFile);
    if (!node) {
      console.error("File not found in graph:", targetFile);
      return;
    }

    let filesToShow: string[];
    if (this.options.reverse) {
      filesToShow = this.graph.getAllDependantsRecursively(targetFile);
    } else {
      filesToShow = this.graph.getDependencies(targetFile);
    }

    let outputLines: string[] = [];

    if (this.options.verbose) {
      outputLines.push(`Target file: ${targetFile}`);
      outputLines.push(this.options.reverse ? "Dependants:" : "Dependencies:");
      for (const f of filesToShow) {
        outputLines.push(`- ${f}`);
      }
    } else {
      outputLines.push(...filesToShow);
    }

    return outputLines;
  }

  printJSON(
    JSONOutput: {
      file: string;
      dependencies: string[];
      dependants: string[];
    }[],
  ): string {
    console.log(JSON.stringify(JSONOutput, null, 2));
    return JSON.stringify(JSONOutput, null, 2);
  }

  printVerbose(stringOutput: string[]): string {
    let output = "";
    stringOutput.forEach((line) => {
      output += line + "\n";
    });
    console.log(output);
    return output;
  }

  printRegular(stringOutput: string[]): string {
    let output = "";
    const uniqueFiles = Array.from(new Set(stringOutput));
    uniqueFiles.forEach((f) => {
      output += f + "\n";
    });
    console.log(output);
    return output;
  }
}
