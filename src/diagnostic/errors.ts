import { CLIError } from "./CLIError.js";

export class ArgumentError extends CLIError {
  exitCode = 64;
  constructor(arg: string) {
    super(`Invalid argument: ${arg}`);
  }
}

export class MissingArgumentError extends CLIError {
  exitCode = 64;
  constructor(arg: string) {
    super(`Missing value for ${arg}`);
  }
}

export class UnknownOptionError extends CLIError {
  exitCode = 64;
  constructor(arg: string) {
    super(`Unknown option: ${arg}`);
  }
}

export class IncorrectArgumentValue extends CLIError {
  exitCode = 64;
  constructor(arg: string, expected: string) {
    super(`Incorrect value for ${arg}. Expected ${expected}`);
  }
}

export class MissingDirectoryError extends CLIError {
  exitCode = 66;
  constructor(path: string) {
    super(`Directory ${path} could not be found`);
  }
}

export class FileReadError extends CLIError {
  exitCode = 66;
  constructor(path: string) {
    super(`Cannot open file ${path}`);
  }
}

export class UnresolvedDependencyError extends CLIError {
  exitCode = 66;
  constructor(path: string) {
    super(`Dependencies of ${path} have incorrect path aliases`);
  }
}
