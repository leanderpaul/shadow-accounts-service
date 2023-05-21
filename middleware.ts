/**
 * Importing npm packages
 */
import { next } from '@vercel/edge';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
export const config = {
  matcher: '/graphql',
};

export default async function middleware(request: Request) {
  const service = request.headers.get('x-shadow-service');
  if (service) return next({ headers: { 'x-shadow-service': 'user-defined-' + service } });
  return request.method === 'post' ? next({ headers: { 'x-shadow-service': 'accounts' } }) : next();
}
