export default class Cli {
  constructor() {}

  /**
   * Returns the arguments (files)
   */
  getArguments(): string[] {
    const args: string[] = [];
    for (let arg of process.argv.slice(2)) {
      if (!arg.startsWith("--")) {
        args.push(arg);
      }
    }
    return args;
  }

  /**
   * Returns all options that start with -- (options)
   */
  getOptions(): string[] {
    const options: string[] = [];
    for (let opt of process.argv.slice(2)) {
      if (opt.startsWith("--")) {
        options.push(opt);
      }
    }
    return options;
  }

  validInputs(): boolean {
    if (this.getArguments().length < 1) {
      console.error(
        "Usage: my-cli [--depth N] [--json] [--verbose] <files...> ",
      );
      return false;
    }
    return true;
  }

  parseInput(): {
    files: string[];
    verbose: boolean;
    depth: number;
    outputJson: boolean;
  } {
    console.log("a");
    const opts: string[] = this.getOptions();
    const files: string[] = this.getArguments();
    // Default options
    let depth = Infinity;
    let outputJson: boolean = false;
    let verbose: boolean = false;
    // Parse args
    console.log("b");
    for (let i = 0; i < opts.length; i++) {
      if (opts[i] === "--depth" && opts[i + 1]) {
        depth = Number(opts[i + 1]);
        i++;
      } else if (opts[i] === "--json") {
        outputJson = true;
      } else if (opts[i] === "--verbose") {
        verbose = true;
      } else {
        files.push(opts[i] as string);
      }
    }
    console.log("c");
    return { files, verbose, depth, outputJson };
  }
}
