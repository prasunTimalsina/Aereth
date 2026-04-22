export class AuthError extends Error {
  constructor(
    public readonly code:
      | "INVALID_CREDENTIALS"
      | "EMAIL_ALREADY_EXISTS"
      | "VALIDATION_ERROR"
      | "UNAUTHORIZED",
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}
