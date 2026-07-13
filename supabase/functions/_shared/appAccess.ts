/** Free-app branch — grant premium on the server without RevenueCat / Stars. */
export function isAppFullyFree(): boolean {
  return Deno.env.get('APP_FULLY_FREE') !== 'false';
}
