/** Uniform return shape for server actions consumed by the admin UI. */
export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function ok<T>(data: T = null as T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}
