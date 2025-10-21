export abstract class BaseError extends Error {
  constructor(
    public override readonly message: string,
    public readonly statusCode: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, () => this.constructor.name);
  }
}
