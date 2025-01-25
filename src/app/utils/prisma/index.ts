import { Entry, PrismaClient, User } from '@prisma/client';
import { createClient, getUserId } from '../supabase/server';
import { enhance } from '@zenstackhq/runtime';
import { Bus, EventStream } from 'baconjs';
import { globalEntryBus, globalPrisma } from '../singleton';
import { onEntryCreated, onEntryUpdated } from './callback';

type PrismaChanges = {
  changeType: 'create' | 'update' | 'delete';
} & (
  {
    db: 'entry';
    data: Entry;
  } | {
    db: 'user';
    data: User;
  }
)

// create an enhanced Prisma client with user context
export async function getPrisma() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL)
  const userId = await getUserId()
  console.log('getPrisma, userId:', userId)
  // if (!userId) throw new Error('getPrisma, user not found')
  const user = userId ? {id: userId} : undefined
  console.log('getPrisma, user:', user)
  const zprisma = enhance(globalPrisma, { user }, { logPrismaQuery: true });

  const xprisma = zprisma.$extends({
    name: 'zenstack',
    model: {
      entry: {
        toEventStream(): EventStream<PrismaChanges> {
          return globalEntryBus.toEventStream()
        },
      },
    },
    query: {
      entry: {
        async create({ model, operation, args, query }) {
          const result = await query(args)
          onEntryCreated(xprisma as unknown as PrismaClient, result as Entry)
          return result
        },
        async update({ model, operation, args, query }) {
          // console.log('update extends, model', model)
          // console.log('update extends, args', args)
          const result = await query(args)
          console.log('update extends, operation', operation, result)
          onEntryUpdated(xprisma as unknown as PrismaClient, result as Entry)
          return result
        },
      },
    }
  })

  return zprisma
}