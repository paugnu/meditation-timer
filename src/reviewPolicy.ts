export const REVIEW_THRESHOLD = 5;
export type ReviewDependencies = {
  available: () => Promise<boolean>;
  readAttempt: () => Promise<string | null>;
  markAttempt: () => Promise<void>;
  request: () => Promise<void>;
};
/** The stores do not report whether their dialog was shown. Attempt at most once. */
export function createReviewRequester(deps: ReviewDependencies) {
  let busy = false;
  return async (completedCount: number, enabled: boolean, canPresent: () => boolean = () => true) => {
    if (!enabled || completedCount < REVIEW_THRESHOLD || busy || !canPresent()) return;
    busy = true;
    try {
      if (await deps.readAttempt() || !(await deps.available()) || !canPresent()) return;
      // Fail closed if persistence fails: never prompt without recording the attempt.
      await deps.markAttempt();
      if (canPresent()) await deps.request();
    } catch { /* Rating must never interrupt meditation. */ }
    finally { busy = false; }
  };
}
