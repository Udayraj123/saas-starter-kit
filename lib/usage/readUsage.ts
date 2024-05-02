import { extractApiKeyUsage } from './utils/validation';

export const readUsage = async (headers) => {
  const { apiKeyUsage } = await extractApiKeyUsage(headers);
  const { availableTokens } = apiKeyUsage;
  return {
    success: true,
    message: '',
    data: { availableTokens },
    meta: {},
  };
};
