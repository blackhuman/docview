import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getBus } from '@/app/utils/entry-observable';
import { getPrisma } from '@/app/utils/prisma';
import { Entry } from '@prisma/client';
import * as Bacon from 'baconjs';

const prisma = await getPrisma()
// prisma.entry.toEventStream()
//   .onValue(v => console.log('globalEntryBus value2', v))

export const entryRouter = createTRPCRouter({
  list: protectedProcedure
    .subscription(async function* ({ input, ctx }) {
      const userId = ctx.user.id
      // const bus = getBus(userId)
      const prisma = await getPrisma()
      const eventStream = prisma.entry.toEventStream()
      const entryEventStream = eventStream
        .filter(v => {
          console.log('filter', v)
          return v !== null && v.changeType === 'update' && v.db === 'entry' && v.data.authorId === userId
        })
      console.log('subscription entry', userId)
      try {
        while (true) {
          yield await entryEventStream.firstToPromise().then(v => {console.log('entryEventStream', v); return v})
        }
      } catch (e) {
        console.error('entries error', e)
      } finally {
        console.info('entries done')
      }
    }),
});
