/**
 * Importing npm packages
 */
import { APIContext, MiddlewareNext } from 'astro';

/**
 * Importing user defined packages
 */
import { type User, getUser, signOut } from './lib';

/**
 * Defining types
 */

declare global {
  namespace App {
    export interface Locals {
      user?: User;
    }
  }
}

/**
 * Declaring the constants
 */

export async function onRequest(context: APIContext, next: MiddlewareNext<Response>) {
  /** Handling logout request */
  if (context.url.pathname === '/auth/signout') {
    const cookie = context.request.headers.get('cookie');
    if (cookie) await signOut(cookie);
    return context.redirect('/auth/signin');
  }

  const allowUnauthenticated = context.url.pathname.startsWith('/auth/');
  const signinUrl = `/auth/signin?redirectUrl=${context.url.pathname}`;

  const cookie = context.request.headers.get('cookie');
  if (!cookie) return allowUnauthenticated ? next() : context.redirect(signinUrl);
  const user = await getUser(cookie);
  if (!user) return allowUnauthenticated ? next() : context.redirect(signinUrl);
  context.locals.user = user;
  return next();
}
