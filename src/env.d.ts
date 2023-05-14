/// <reference types="@astrojs/image/client" />

export interface GrapQLError {
  message: string;
}

export type GraphQLResponse<T> = { success: true; data: T } | { success: false; error: GrapQLError; errors: GrapQLError[] };

declare global {
  export interface Window {
    graphql<T = any>(query: string, variables?: Record<string, any>): Promise<GraphQLResponse<T>>;
  }
}
