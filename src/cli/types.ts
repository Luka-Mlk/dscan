export namespace CLITypes {
  export type CLIOptions = {
    json?: boolean;
    verbose?: boolean;
    reverse?: boolean;
    root?: string;
    tsconfig?: string;
    files: string[];
  };
}
