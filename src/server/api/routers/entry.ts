import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getBus } from '@/app/utils/entry-observable';
import { getPrisma } from '@/app/utils/prisma';
import { Entry } from '@prisma/client';
import * as Bacon from 'baconjs';

export const entryRouter = createTRPCRouter({
  list: protectedProcedure
    .subscription(async function* ({ input, ctx }) {
      const userId = ctx.user.id
      // const bus = getBus(userId)
      const prisma = await getPrisma()
      const eventStream = prisma.entry.toEventStream(userId)
      const entryEventStream = eventStream
        .doAction(v => {
          console.log('entryEventStream doAction', v)
        })
        .filter(v => v.db === 'entry')
        .map(v => v.data)
        .flatMap(v => Bacon.fromPromise(
          prisma.entry.findFirst({where: {id: v.id}})
        ))
        .doAction(v => {
          console.log('entryEventStream doAction 2', v)
        })
        .filter(v => v !== null && v.authorId === userId)
      entryEventStream.onValue(v => console.log('entryEventStream value', v))
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
