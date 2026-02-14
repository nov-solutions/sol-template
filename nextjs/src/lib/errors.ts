export function extractApiError(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { error?: string } } };
  return err?.response?.data?.error || fallback;
}
