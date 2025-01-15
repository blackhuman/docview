import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getBus } from '@/app/utils/entry-observable';

export const entryRouter = createTRPCRouter({
  list: protectedProcedure
    .subscription(async function* ({ input, ctx }) {
      const userId = ctx.user.id
      const bus = getBus(userId)
      try {
        while (true) {
          yield await bus.firstToPromise().then(v => {console.log('bus', v); return v})
        }
      } catch (e) {
        console.error('entries error', e)
      } finally {
        console.info('entries done')
      }
    }),
});
