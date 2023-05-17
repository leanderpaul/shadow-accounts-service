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
  id: number;
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

interface GraphQLOptions {
  cookie?: string;
  variables?: Record<string, any>;
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
        id
        browser
        os
        device
        accessedAt
        currentSession
      }
    }
  }
`;

const VERIFY_USER = /* GraphQL */ `
  mutation VerifyEmail($code: String!) {
    verifyEmailAddress(code: $code)
  }
`;

async function graphql(query: string, options: GraphQLOptions = {}) {
  let headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.cookie) headers.cookie = options.cookie;
  const body = JSON.stringify({ query, variables: options.variables });
  const response = await fetch(ARCHIVE_GRAPHQL_ENDPOINT, { method: 'post', body, headers });
  return await response.json();
}

export async function getUser(cookie: string) {
  const response = await graphql(GET_USER, { cookie });
  if (response.errors) return null;
  return response.data.viewer as User;
}

export async function signOut(cookie: string, clearAllSessions = false) {
  const variables = { sessionId: clearAllSessions ? -1 : null };
  await graphql('mutation Logout($sessionId: String) { logout(sessionId: $sessionId) }', { cookie, variables });
}

export async function verifyEmail(code: string) {
  const response = await graphql(VERIFY_USER, { variables: { code } });
  return (response.errors?.[0]?.message as string) || 'Email address verified successfully';
}
