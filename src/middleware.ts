/**
 * Importing npm packages
 */
import { APIContext, MiddlewareNext } from 'astro';

/**
 * Importing user defined packages
 */
import { type User, GraphQL } from './lib';

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
  const cookie = context.request.headers.get('cookie');
  const user = cookie ? await GraphQL.getUser(cookie) : null;
  if (user) context.locals.user = user;
  return next();
}
