/**
 * A custom error object used when an error is received from the server. Captures a message and the error status code.
 */
export default class ApiError extends Error {
  public readonly statusCode: number;
  public readonly message: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;

    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
