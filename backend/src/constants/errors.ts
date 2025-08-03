export class MyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MyError";
  }
}

export enum Errors {
  INVALID_SETUP = "Invalid server setup",
  INTERNAL_SERVER_ERROR = "Internal server error",
  UNKNOWN = "Unknown error",
}
