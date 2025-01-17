import { Entry, PrismaClient, User } from '@prisma/client';
import { createClient, getUserId } from '../supabase/server';
import { enhance } from '@zenstackhq/runtime';
import { Bus, EventStream } from 'baconjs';
import { globalEntryBus, globalRandom, initBus } from '../singleton';

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

const prisma = new PrismaClient();
const xprisma = prisma.$extends({
  name: 'zenstack',
  model: {
    entry: {
      toEventStream(userId: string): EventStream<PrismaChanges> {
        console.log('toEventStream random', globalRandom)
        initBus(userId)
        return globalEntryBus.get(userId)!.toEventStream()
      },
    },
  },
  query: {
    entry: {
      async create({ model, operation, args, query }) {
        // console.log('create extends, model', model)
        // console.log('create extends, args', args)
        const result = await query(args)
        const userId = await getUserId()
        console.log('create extends, operation', operation, result)
        initBus(userId!)
        // @ts-ignore
        globalEntryBus.get(userId!)!.push({
          changeType: 'create',
          db: 'entry',
          data: result
        })
        return result
      },
      async update({ model, operation, args, query }) {
        // console.log('update extends, model', model)
        // console.log('update extends, args', args)
        const result = await query(args)
        const userId = await getUserId()
        console.log('update extends, operation', operation, result)
        initBus(userId!)
        // @ts-ignore
        globalEntryBus.get(userId!)!.push({
          changeType: 'update',
          db: 'entry',
          data: result
        })
        return result
      },
    },
  }
})

// create an enhanced Prisma client with user context
export async function getPrisma() {
  const userId = await getUserId()
  console.log('getPrisma, user:', userId)
  return enhance(xprisma, { user: {id: userId ?? ''} });
}