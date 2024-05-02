import { getApiKeyUsage } from 'models/apiKey';
import { X_OMR_LICENSE_KEY_HEADER, API_RESPONSE_MESSAGES } from '../constants';
export class ApiKeyUsageError extends Error {}

const { NO_API_KEY, INVALID_API_KEY } = API_RESPONSE_MESSAGES;

export const extractApiKeyUsage = async (headers) => {
  const apiKey = headers[X_OMR_LICENSE_KEY_HEADER];
  if (!apiKey || String(apiKey) === 'undefined') {
    throw new ApiKeyUsageError(NO_API_KEY);
  }

  // Access DB
  const apiKeyUsage = await getApiKeyUsage(apiKey);

  if (!apiKeyUsage) {
    throw new ApiKeyUsageError(INVALID_API_KEY);
  }

  // TODO: uncomment once expiresAt is non-nullable
  // if (apiKeyUsage.expiresAt <= Date.now()) {
  //   throw new ApiKeyUsageError(LICENSE_EXPIRED);
  // }

  return { apiKey, apiKeyUsage };
};
