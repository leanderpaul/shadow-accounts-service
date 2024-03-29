/**
 * Importing npm packages
 */
import { it } from 'bun:test';

/**
 * Importing user defined packages
 */
import { APIRequest, type RestMethod } from './rest.utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class Tests {
  static unauthenicatedAPI(method: RestMethod, url: string): void {
    it('should throw 401 error for unauthenticated request', async () => {
      const response = await new APIRequest(method, url);
      response.expectError('IAM003');
    });
  }

  static unauthenticatedPage(url: string): void {
    it('should redirect to sign in page when unauthenticated', async () => {
      const response = await new APIRequest('GET', url);
      response.expectRedirect(`/auth/signin?redirectUrl=${encodeURIComponent(url)}`);
    });
  }
}
