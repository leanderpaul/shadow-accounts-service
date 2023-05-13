/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */
export interface UserSession {
  browser?: string | null;
  os?: string | null;
  device?: string | null;
  accessedAt: string;
  currentSession: boolean;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  verified: boolean;
  imageUrl?: string | null;
  csrfToken: string;
  sessions: UserSession[];
}

/**
 * Declaring the constants
 */
const ARCHIVE_GRAPHQL_ENDPOINT: string = import.meta.env.ARCHIVE_GRAPHQL_ENDPOINT || 'https://archive.dev.shadow-apps.com/graphql/accounts';

const GET_USER = /* GraphQL */ `
  query GetCurrentUser {
    viewer {
      uid
      email
      name
      verified
      imageUrl
      csrfToken
      sessions {
        browser
        os
        device
        accessedAt
        currentSession
      }
    }
  }
`;

export async function getUser(cookie: string) {
  const body = JSON.stringify({ query: GET_USER });
  const headers = { cookie, 'Content-Type': 'application/json' };
  const response = await fetch(ARCHIVE_GRAPHQL_ENDPOINT, { method: 'post', body, headers });
  const resBody = await response.json();
  if (resBody.errors) return null;
  return resBody.data.viewer as User;
}

export async function signOut(cookie: string) {
  const body = JSON.stringify({ query: 'mutation Logout { logout }' });
  const headers = { cookie, 'Content-Type': 'application/json' };
  await fetch(ARCHIVE_GRAPHQL_ENDPOINT, { method: 'post', body, headers });
}
