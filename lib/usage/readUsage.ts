import { extractApiKeyUsage } from './utils/validation';

export const readUsage = async (headers) => {
  const { apiKeyUsage } = await extractApiKeyUsage(headers);
  const { availableTokens, name } = apiKeyUsage;
  return {
    success: true,
    message: '',
    data: { availableTokens, name },
    meta: {},
  };
};
