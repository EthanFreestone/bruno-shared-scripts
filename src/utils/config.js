import { getTenant } from '../auth';

export const getBaseRequestConfig = () => {
  const tenant = getTenant();
  return {
    headers: {
      "Content-type": "application/json",
      "x-okapi-tenant": tenant
    },
  }
}
