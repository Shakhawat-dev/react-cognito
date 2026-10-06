export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  return 'Something went wrong. Please try again.'
}
