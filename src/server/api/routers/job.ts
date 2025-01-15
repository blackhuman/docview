import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getJobs, Job, updateJob } from "@/app/utils/job";

export const jobRouter = createTRPCRouter({
  list: protectedProcedure
    .subscription(async function* ({ input, ctx }): AsyncGenerator<Map<string, Job>, void, any> {
      const userId = ctx.user.id
      console.log('userId', userId)
      const jobsBus = getJobs(userId)
      try {
        while (true) {
          yield await jobsBus.firstToPromise().then(v => {console.log('jobs', v); return v})
        }
      } catch (e) {
        console.error('jobs error', e)
      } finally {
        console.info('jobs done')
      }
    }),
});
