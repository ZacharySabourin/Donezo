/**
 * A custom error object used when an error is received from the server. Captures a message and the error status code.
 */
export class ApiError extends Error {
  /** The HTTP status code returned by the server. */
  public readonly statusCode: number;
  /** Human-readable description of what failed. */
  public readonly message: string;

  /**
   * @param message A human-readable description of the failure.
   * @param statusCode The HTTP status code returned by the server.
   */
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;

    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
