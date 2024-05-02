import { updateApiKeyUsage } from 'models/apiKey';
import { extractApiKeyUsage } from './utils/validation';
import { API_RESPONSE_MESSAGES } from './constants';
const { INSUFFICIENT_TOKENS_LEFT, CLAIM_SUCCESSFUL } = API_RESPONSE_MESSAGES;
export const claimUsage = async (headers, parsedBody) => {
  const {
    apiKey,
    apiKeyUsage: { availableTokens, name },
  } = await extractApiKeyUsage(headers);

  const { quantity } = parsedBody;

  // TODO: see why availableTokens is possibly null!
  if (!availableTokens || availableTokens < quantity) {
    throw new Error(INSUFFICIENT_TOKENS_LEFT);
  }
  // TODO: fire lago events here
  await updateApiKeyUsage({ apiKey, availableTokens: availableTokens - quantity });
  return {
    data: { availableTokens, name },
    success: true,
    message: CLAIM_SUCCESSFUL,
    meta: {},
  };
};
