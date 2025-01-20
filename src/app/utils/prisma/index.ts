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
  const userId = await getUserId()
  console.log('getPrisma, user:', userId)
  const zprisma = enhance(globalPrisma, { user: {id: userId ?? ''} });

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

  return xprisma
}