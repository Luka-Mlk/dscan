import path from "path";
import { FileScanner } from "../scanner/fileScanner.js";
import { Outputter } from "../formatter/outputter.js";

type CLIOptions = {
  json?: boolean;
  verbose?: boolean;
  reverse?: boolean;
  root?: string;
  tsconfig?: string;
  files: string[];
};

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
    let scanRoots: string = this.setRoot();
    scanner.scanProject(scanRoots, this.options.tsconfig);

    const outputter = new Outputter(scanner.graph, this.options);

    let JSONOutput: {
      file: string;
      dependencies: string[];
      dependants: string[];
    }[] = [];
    let stringOutput: string[] = [];

    for (const file of this.options.files) {
      const targetPath = `${scanRoots}/${file}`;

      if (this.options.json) {
        const result = outputter.formatJSON(targetPath);
        if (result) {
          JSONOutput.push(result);
        }
      } else {
        const result = outputter.formatFiles(targetPath);
        if (result) {
          stringOutput.push(...result);
        }
      }
    }
    if (this.options.json) {
      return outputter.printJSON(JSONOutput);
    }

    if (this.options.verbose) {
      return outputter.printVerbose(stringOutput);
    } else {
      return outputter.printRegular(stringOutput);
    }
  }

  /**
   * Set's root depending on
   */
  private setRoot() {
    if (this.options.root) {
      return this.options.root;
    } else {
      // default: scan src/ of current project
      return path.resolve("src");
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
        } else if (key === "tsconfig") {
          i++;
          (options as any)[key] = args[i] as string;
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
