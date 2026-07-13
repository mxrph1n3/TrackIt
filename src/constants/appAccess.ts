/**
 * Free-app branch: all Pro features unlocked, no IAP / Stars / paywalls.
 * Set to false on main when billing is enabled again.
 */
export const APP_IS_FULLY_FREE = true;

export function isAppFullyFree(): boolean {
  return APP_IS_FULLY_FREE;
}
