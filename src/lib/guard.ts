/**
 * Importing npm packages
 */
import { type AstroGlobal } from 'astro';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export type RequestCondition = 'authenticated' | 'unauthenticated' | 'verified';

export type GuardResult = { canAccess: true } | { canAccess: false; redirect: () => Response };

/**
 * Declaring the constants
 */

export class Guard {
  static checkAccess(condition: RequestCondition, context: AstroGlobal, redirectTo?: string): GuardResult {
    const { user } = context.locals;

    /** User present in unauthenticated route */
    if (condition === 'unauthenticated' && user) {
      const rawRedirectUrl = context.url.searchParams.get('redirectUrl');
      const redirectUrl = rawRedirectUrl ? decodeURIComponent(rawRedirectUrl) : '/home';
      const url = user.verified ? redirectUrl : `/verify`;
      return { canAccess: false, redirect: () => context.redirect(url) };
    }

    /** User not present in authenticated route */
    if (condition === 'authenticated' && !user) {
      const url = '/auth/signin?redirectUrl=' + encodeURIComponent(redirectTo || context.url.pathname);
      return { canAccess: false, redirect: () => context.redirect(url) };
    }

    /** User not present or verified in verified user route */
    if (condition === 'verified' && !user?.verified) {
      const query = '?redirectUrl=' + encodeURIComponent(redirectTo || context.url.pathname);
      const url = user ? '/verify' : '/auth/signin';
      return { canAccess: false, redirect: () => context.redirect(url + query) };
    }

    return { canAccess: true };
  }
}
