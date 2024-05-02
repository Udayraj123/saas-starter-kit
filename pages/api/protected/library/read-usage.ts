import type { NextApiRequest, NextApiResponse } from 'next';
import { getProtectedApiUsageSchema, validateWithSchema } from '@/lib/zod';
import { readUsage } from '@/lib/usage/readUsage';
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
    validateWithSchema(getProtectedApiUsageSchema, decryptedBody);
    console.log({ decryptedBody });
    responseBody = await readUsage(req.headers);
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

  const encryptedBody = encryptBody(responseBody);
  res.status(200).json(encryptedBody);
};
