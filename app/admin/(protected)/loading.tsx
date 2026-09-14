/**
 * Shown inside the admin shell while a data-backed page loads, so a click on a
 * heavy page (leads, dashboard) shows a spinner instead of freezing on the
 * previous page. The global top progress bar covers the rest.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-[3px] border-line2 border-t-acc"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
