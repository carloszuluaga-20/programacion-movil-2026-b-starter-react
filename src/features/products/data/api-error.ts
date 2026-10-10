/**
 * Error used by the product API client.
 *
 * Connection failures have a null status.
 * Unsuccessful HTTP responses preserve the status and server details.
 */
export class ApiError extends Error {
  readonly status: number | null;
  readonly details: string[];
  readonly isNetworkError: boolean;

  constructor(message: string, status: number | null, details: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.isNetworkError = status === null;
  }
}

/** Returns a user-friendly message for an API or unexpected error. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isNetworkError) {
      return 'Unable to connect to the server. Check that the API is running.';
    }

    if (error.status === 404) {
      return 'We could not find that product.';
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}