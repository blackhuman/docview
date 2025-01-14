import { createTRPCRouter } from "@/server/api/trpc";
import { entryRouter } from "./routers/entry";
import { protectedProcedure } from "./trpc";
import { getJobs, Job, SSEJob, updateJob } from '@/app/utils/job';
import { SSEType } from '@/app/utils/sse-type';
import { Bus } from 'baconjs';
import { jobRouter } from './routers/job';

export const appRouter = createTRPCRouter({
  job: jobRouter,
  entry: entryRouter,
});

export type AppRouter = typeof appRouter;

