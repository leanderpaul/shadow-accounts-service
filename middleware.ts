/**
 * Importing npm packages
 */
import { rewrite } from '@vercel/edge';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const SHADOW_ARCHIVE_HOSTNAME = process.env.SHADOW_ARCHIVE_HOSTNAME || 'archive.dev.shadow-apps.com';

export const config = {
  matcher: '/graphql',
};

export default async function middleware(request: Request) {
  if (request.method === 'POST') {
    console.log(process.env);
    const headers = new Headers(request.headers);
    headers.set('x-shadow-server', 'accounts');
    return rewrite(`https://${SHADOW_ARCHIVE_HOSTNAME}/graphql/accounts`, { request: { headers } });
  }

  return;
}
