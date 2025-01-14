import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { processEpubFile } from "@/app/actions/process-epub";
import { Job } from "@/app/utils/job";
import { observable } from "@trpc/server/observable";

export const entryRouter = createTRPCRouter({
  list: protectedProcedure
    .subscription(async function* ({ input, ctx }) {
      yield { entryId: "xx", progress: 0, stage: 'PRE_PROCESSING' } as Job
    }),
});
