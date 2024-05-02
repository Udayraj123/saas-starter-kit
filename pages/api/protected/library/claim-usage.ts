// Note: these apis follow a protection logic:
// 1. Decrypt the request payload with a fixed secret with the client
// 2. Validate the request payload with an otp in the same payload
// 3. Perform the action to get a response
// 4. Encrypt the response and return it back
// As usual, any db access would be through functions defined in `models/`

import type { NextApiRequest, NextApiResponse } from 'next';
import { updateProtectedApiUsageSchema, validateWithSchema } from '@/lib/zod';
import { claimUsage } from '@/lib/usage/claimUsage';
import { encryptBody, decryptBody } from '@/lib/usage/utils/crypto';
import { ApiKeyUsageError } from '@/lib/usage/utils/validation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    switch (req.method) {
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'POST');
        res.status(405).json({
          error: { message: `Method ${req.method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Update usage
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {

  let responseBody: any = null;
  try {
    const decryptedBody = decryptBody(req.body);
    const parsedBody = validateWithSchema(
      updateProtectedApiUsageSchema,
      decryptedBody
    );
    responseBody = await claimUsage(req.headers, parsedBody);
  } catch (error: any) {
    if (error instanceof ApiKeyUsageError) {
      responseBody = {
        success: false,
        message: error.message,
        data: {},
        meta: {},
      };
    }

    throw error;
  }

  // sendAudit({
  //   action: 'usage.update',
  //   crud: 'u',
  //   user,
  //   usage: user.usage,
  // });
  // TODO update `lastUsedAt` too in case of claimUsage

  // recordMetric('usage.updated');

  const encryptedBody = encryptBody(responseBody);
  res.status(200).json(encryptedBody);
};
