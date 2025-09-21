// src/cli/CLI.ts
import path from "path";
import { FileScanner } from "../scanner/fileScanner.js";
import { DependencyGraph } from "../graph/DependencyGraph.js";
import { Outputter } from "../formatter/outputter.js";

interface CLIOptions {
  json?: boolean;
  verbose?: boolean;
  reverse?: boolean;
  files: string[];
}

export class CLI {
  private options: CLIOptions;
  private graph: DependencyGraph;

  constructor(args: string[]) {
    this.options = this.parseArgs(args);
    this.graph = new DependencyGraph();
  }

  run() {
    if (!this.options.files.length) {
      console.error("No files provided.");
      process.exit(1);
    }

    const scanner = new FileScanner(this.graph);

    // 🚀 Project-wide scan
    scanner.scanProject(path.resolve("src"));

    const absFiles = this.options.files.map((f) => path.resolve(f));
    const outputter = new Outputter(this.graph, this.options);

    for (const file of absFiles) {
      outputter.print(file);
    }
  }

  private parseArgs(args: string[]): CLIOptions {
    const options: CLIOptions = { files: [] };
    for (const arg of args) {
      if (arg.startsWith("--")) {
        const key = arg.slice(2);
        if (["json", "verbose", "reverse"].includes(key)) {
          (options as any)[key] = true;
        } else {
          console.error("Unknown option:", arg);
          process.exit(1);
        }
      } else {
        options.files.push(arg);
      }
    }
    return options;
  }
}
