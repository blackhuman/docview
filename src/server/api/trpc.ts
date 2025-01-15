import { initTRPC, TRPCError } from "@trpc/server";
import { createClient } from '@/app/utils/supabase/server';
import superjson from "superjson";
import { ZodError } from "zod";
import { type User } from '@supabase/supabase-js';

interface CreateContextOptions {
  user: User | null;
}

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    user: opts.user,
  };
};

export const createTRPCContext = async () => {
  const supabase = await createClient();
  const response = await supabase?.auth.getUser();
  const user = response?.data.user ?? null;

  return createInnerTRPCContext({
    user,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
