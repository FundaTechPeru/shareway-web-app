/**
 * Development environment: relative URL served through the dev-server proxy
 * (`proxy.conf.json`), which forwards `/api` to the API Gateway to avoid CORS.
 */
export const environment = {
  production: false,
  apiBaseUrl: '/api/v1',
};
