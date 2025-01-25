import { NextRequestHandler } from '@zenstackhq/server/next';
import { getPrisma } from '@/app/utils/prisma';
import { NextRequest } from 'next/server';

const handler = NextRequestHandler({ getPrisma, useAppDir: true });
async function GET(req: NextRequest, context: any) {
 const response = await handler(req, context); 
//  console.log('handler response:', await response.text());
 return response;
}

export {
  GET as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};