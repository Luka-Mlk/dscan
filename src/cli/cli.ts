import path from "path";
import { FileScanner } from "../scanner/fileScanner.js";
import { Outputter } from "../formatter/outputter.js";

interface CLIOptions {
  json?: boolean;
  verbose?: boolean;
  reverse?: boolean;
  root?: string;
  files: string[];
}

export class CLI {
  private options: CLIOptions;

  constructor(args: string[]) {
    this.options = this.parseArgs(args);
  }

  runScanner() {
    if (!this.options.files.length) {
      console.error("No files provided.");
      process.exit(1);
    }

    const scanner = new FileScanner();

    // Get root
    let scanRoots: string;
    if (this.options.root) {
      scanRoots = this.options.root;
    } else {
      // default: scan src/ of current project
      scanRoots = path.resolve("src");
    }

    scanner.scanProject(scanRoots);

    const outputter = new Outputter(scanner.graph, this.options);
    for (const file of this.options.files) {
      outputter.print(`${scanRoots}/` + file);
    }
  }

  private parseArgs(args: string[]): CLIOptions {
    const options: CLIOptions = { files: [] };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg!.startsWith("--")) {
        const key = arg!.slice(2);
        if (["json", "verbose", "reverse"].includes(key)) {
          (options as any)[key] = true;
        } else if (key === "root") {
          i++;
          if (!args[i]) {
            console.error("--root requires a path");
            process.exit(1);
          }
          options.root = path.resolve(args[i] as string);
        } else {
          console.error("Unknown option:", arg);
          process.exit(1);
        }
      } else {
        options.files.push(arg as string);
      }
    }
    return options;
  }
}
