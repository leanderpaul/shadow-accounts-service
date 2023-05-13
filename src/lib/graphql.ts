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

interface GraphQLOptions {
  cookie?: string;
  variables?: Record<string, any>;
}

/**
 * Declaring the constants
 */
const ARCHIVE_GRAPHQL_ENDPOINT: string = import.meta.env.ARCHIVE_GRAPHQL_ENDPOINT || 'https://archive.dev.shadow-apps.com/graphql/accounts';
const APP_NAME: string = import.meta.env.APP_NAME || 'local-accounts-setup';

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

const VERIFY_USER = /* GraphQL */ `
  mutation VerifyEmail($code: String!) {
    verifyEmailAddress(code: $code)
  }
`;

async function graphql(query: string, options: GraphQLOptions = {}) {
  let headers: Record<string, string> = { 'Content-Type': 'application/json', service: APP_NAME };
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

export async function signOut(cookie: string) {
  await graphql('mutation Logout { logout }', { cookie });
}

export async function verifyEmail(code: string) {
  const response = await graphql(VERIFY_USER, { variables: { code } });
  return (response.errors?.[0]?.message as string) || 'Email address verified successfully';
}
