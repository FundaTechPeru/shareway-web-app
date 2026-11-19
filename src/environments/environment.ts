/** Production environment: calls go straight to the ShareWay API Gateway. */
export const environment = {
  production: true,
  apiBaseUrl: 'https://shareway-api-gateway.onrender.com/api/v1',
};
