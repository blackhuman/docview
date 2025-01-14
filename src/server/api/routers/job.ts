import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { processEpubFile } from "@/app/actions/process-epub";
import { getJobs, Job, updateJob } from "@/app/utils/job";
import { observable } from "@trpc/server/observable";

export const jobRouter = createTRPCRouter({
  list: protectedProcedure
    .subscription(async function* ({ input, ctx }): AsyncGenerator<Map<string, Job>, void, any> {
      const jobsBus = getJobs()
      const timeout = setInterval(() => {
        updateJob({ entryId: 'xx', stage: 'PRE_PROCESSING' })
      }, 5000)
      try {
        while (true) {
          yield await jobsBus.firstToPromise()
        }
      } catch (e) {
        console.error('jobs error', e)
      } finally {
        console.info('jobs done')
        clearInterval(timeout)
      }
    }),
});
