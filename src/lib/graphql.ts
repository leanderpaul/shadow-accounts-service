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
  email: string;
  name: string;
  verified: boolean;
  imageUrl?: string | null;
  sessions: UserSession[];
}

interface GraphQLOptions {
  cookie?: string;
  variables?: Record<string, any>;
}

export interface GraphQLError {
  message: string;
}

export interface GraphQLSuccessResponse<T> {
  success: true;
  data: T;
}

export interface GraphQLErrorResponse {
  success: false;
  errors: GraphQLError[];
  error: GraphQLError;
}

export type GraphQLResponse<T = any> = GraphQLSuccessResponse<T> | GraphQLErrorResponse;

/**
 * Declaring the constants
 */
const SHADOW_ARCHIVE_DOMAIN: string = import.meta.env.SHADOW_ARCHIVE_DOMAIN || 'https://archive.dev.shadow-apps.com';

export class GraphQL {
  private static rawQuery(query: string, options: GraphQLOptions = {}): Promise<Response> {
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (options.cookie) headers.cookie = options.cookie;
    const body = JSON.stringify({ query, variables: options.variables });
    return fetch(SHADOW_ARCHIVE_DOMAIN + '/graphql/accounts', { method: 'post', body, headers });
  }

  private static async query<T = any>(query: string, options: GraphQLOptions = {}): Promise<GraphQLResponse<T>> {
    const response = await GraphQL.rawQuery(query, options);
    const resBody = await response.json();
    if (resBody.data) return { success: true, data: resBody.data };
    return { success: false, error: resBody.errors[0], errors: resBody.errors };
  }

  static async getUser(cookie: string): Promise<User | null> {
    const query = 'query { viewer { email name verified imageUrl sessions { id browser os device accessedAt currentSession } } }';
    const response = await GraphQL.query<{ viewer: User }>(query, { cookie });
    return response.success ? response.data.viewer : null;
  }

  static async signOut(cookie: string, clearAllSessions = false): Promise<Response> {
    const query = 'mutation Logout($sessionId: Int) { logout(sessionId: $sessionId) }';
    const variables = { sessionId: clearAllSessions ? -1 : null };
    return await GraphQL.rawQuery(query, { cookie, variables });
  }

  static async verifyEmail(code: string | null): Promise<{ success: boolean; message: string }> {
    if (!code) return { success: false, message: 'Invalid email verification code' };
    const query = 'mutation VerifyEmail($code: String!) { verifyEmailAddress(code: $code) }';
    const response = await GraphQL.query(query, { variables: { code } });
    if (response.success) return { success: true, message: 'Email address verified successfully' };
    return { success: false, message: response.error.message };
  }

  static async verifyResetPasswordToken(code: string): Promise<boolean> {
    const query = 'mutation VerifyResetPasswordToken($code: String!) { resetPassword(code: $code, newPassword: "") }';
    const response = await GraphQL.query(query, { variables: { code } });
    return response.success;
  }
}
