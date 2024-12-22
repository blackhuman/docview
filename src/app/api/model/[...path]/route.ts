import { NextRequestHandler } from '@zenstackhq/server/next';
import { getPrisma } from '@/app/utils/prisma';

const handler = NextRequestHandler({ getPrisma, useAppDir: true });

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};