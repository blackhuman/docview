import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getJobs, Job, updateJob } from "@/app/utils/job";

export const jobRouter = createTRPCRouter({
  list: protectedProcedure
    .subscription(async function* ({ input, ctx }): AsyncGenerator<Map<string, Job>, void, any> {
      const userId = ctx.user.id
      const jobsBus = getJobs(userId)
      try {
        while (true) {
          yield await jobsBus.firstToPromise()
        }
      } catch (e) {
        console.error('jobs error', e)
      } finally {
        console.info('jobs done')
      }
    }),
});
