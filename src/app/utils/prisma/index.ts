import { PrismaClient } from '@prisma/client';
import { createClient } from '../supabase/server';
import { enhance } from '@zenstackhq/runtime';

const prisma = new PrismaClient();

// create an enhanced Prisma client with user context
export async function getPrisma() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  console.log('getPrisma, user:', user?.id)
  return enhance(prisma, { user: {id: user?.id ?? ''} });
}