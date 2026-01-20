import path from "path";
import { FileScanner } from "../scanner/fileScanner.js";
import { Outputter } from "../formatter/outputter.js";

// --- Types & Configuration ---

type CLIOptions = {
  json?: boolean;
  verbose?: boolean;
  reverse?: boolean;
  root?: string;
  tsconfig?: string;
  files: string[];
};

type ParserState = "IDLE" | "CAPTURE_VALUE";

interface FlagDef {
  key: keyof CLIOptions;
  type: "boolean" | "value";
}

const FLAG_MAP: Record<string, FlagDef> = {
  "--json": { key: "json", type: "boolean" },
  "-j": { key: "json", type: "boolean" },
  "--verbose": { key: "verbose", type: "boolean" },
  "-v": { key: "verbose", type: "boolean" },
  "--reverse": { key: "reverse", type: "boolean" },
  "--root": { key: "root", type: "value" },
  "--tsconfig": { key: "tsconfig", type: "value" },
};

// --- CLI Class Implementation ---

export class CLI {
  private options: CLIOptions = { files: [] };

  // State tracking for debugging/testing
  private currentState: ParserState = "IDLE";
  private activeFlag: FlagDef | null = null;

  constructor(args: string[]) {
    this.parseArgs(args);
  }

  /**
   * Main entry point for the scanner logic
   */
  public runScanner() {
    if (!this.options.files.length) {
      console.error("No files provided.");
      process.exit(1);
    }

    const scanner = new FileScanner();
    const scanRoots = this.setRoot();

    scanner.scanProject(scanRoots, this.options.tsconfig);

    const outputter = new Outputter(scanner.graph, this.options);

    let JSONOutput: any[] = [];
    let stringOutput: string[] = [];

    for (const file of this.options.files) {
      const targetPath = path.resolve(scanRoots, file);

      if (this.options.json) {
        const result = outputter.formatJSON(targetPath);
        if (result) JSONOutput.push(result);
      } else {
        const result = outputter.formatFiles(targetPath);
        if (result) stringOutput.push(...result);
      }
    }

    if (this.options.json) {
      return outputter.printJSON(JSONOutput);
    }

    return this.options.verbose
      ? outputter.printVerbose(stringOutput)
      : outputter.printRegular(stringOutput);
  }

  /**
   * State Machine Parser
   */
  private parseArgs(args: string[]): void {
    this.reset();

    for (const token of args) {
      this.transition(token);
    }

    // Final Validation: Ensure we aren't hanging in a capture state
    if (this.currentState === "CAPTURE_VALUE") {
      this.handleError(`Missing value for flag: --${this.activeFlag?.key}`);
    }
  }

  /**
   * Handles the transition logic between tokens.
   */
  public transition(token: string): void {
    if (this.currentState === "IDLE") {
      const def = FLAG_MAP[token];

      if (def) {
        if (def.type === "boolean") {
          (this.options[def.key] as boolean) = true;
        } else {
          this.activeFlag = def;
          this.currentState = "CAPTURE_VALUE";
        }
      } else if (token.startsWith("--") || token.startsWith("-")) {
        this.handleError(`Unknown option: ${token}`);
      } else {
        this.options.files.push(token);
      }
    } else if (this.currentState === "CAPTURE_VALUE") {
      if (token.startsWith("--") || token.startsWith("-")) {
        this.handleError(
          `Expected value for --${this.activeFlag?.key}, but got flag "${token}"`,
        );
      }

      this.applyValue(this.activeFlag!.key, token);

      // Return to IDLE
      this.currentState = "IDLE";
      this.activeFlag = null;
    }
  }

  /**
   * Applies a captured value to the options object with specific logic per key.
   */
  private applyValue(key: keyof CLIOptions, value: string) {
    if (key === "root") {
      this.options.root = path.resolve(value);
    } else if (key === "files") {
      this.options.files.push(value);
    } else {
      (this.options[key] as string) = value;
    }
  }

  private setRoot(): string {
    return this.options.root ? this.options.root : path.resolve("src");
  }

  private reset() {
    this.options = { files: [] };
    this.currentState = "IDLE";
    this.activeFlag = null;
  }

  private handleError(message: string): never {
    console.error(message);
    process.exit(1);
  }

  // Getter for testing/debugging
  public getParsedOptions(): CLIOptions {
    return { ...this.options };
  }
}
