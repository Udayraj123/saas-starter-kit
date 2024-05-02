import { prisma } from '@/lib/prisma';
import { generateUniqueApiKey } from './utils/hash';
interface CreateApiKeyParams {
  name: string;
  teamId: string;
}
interface UpdateApiKeyParams {
  apiKey: string;
  availableTokens: number;
}

export const createApiKey = async (params: CreateApiKeyParams) => {
  const { name, teamId } = params;

  const [hashedKey, apiKey] = generateUniqueApiKey();

  await prisma.apiKey.create({
    data: {
      name,
      hashedKey: hashedKey,
      availableTokens: 0,
      // type: "IMAGE_TOKENS",
      team: { connect: { id: teamId } },
    },
  });

  return apiKey;
};

export const fetchApiKeys = async (teamId: string) => {
  return prisma.apiKey.findMany({
    where: {
      teamId,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });
};

export const deleteApiKey = async (id: string) => {
  return await prisma.apiKey.delete({
    where: {
      id,
    },
  });
};

export const getApiKey = async (apiKey: string) => {
  // Note: access validations for user's teamId or admin role are done at handleGET level
  return prisma.apiKey.findUnique({
    where: {
      hashedKey: hashApiKey(apiKey),
    },
    select: {
      id: true,
      teamId: true,
      // availableTokens: true,
    },
  });
};

export const getApiKeyUsage = async (apiKey: string) => {
  return prisma.apiKey.findUnique({
    where: {
      hashedKey: hashApiKey(apiKey),
    },
    select: {
      id: true,
      teamId: true,
      availableTokens: true,
      type: true,
      expiresAt: true,
    },
  });
};

// TODO: support for regenerateApiKey (with same usage/id)

export const updateApiKeyUsage = async (params: UpdateApiKeyParams) => {
  const { apiKey, availableTokens } = params;

  return await prisma.apiKey.update({
    where: {
      hashedKey: hashApiKey(apiKey),
    },
    data: {
      availableTokens,
    },
  });
};
