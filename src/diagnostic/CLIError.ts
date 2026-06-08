export abstract class CLIError extends Error {
  abstract exitCode: number;
  message: string;

  constructor(message: string) {
    super(message);
    this.message = message + "\n";
  }
}
