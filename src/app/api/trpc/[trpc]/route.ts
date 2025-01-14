import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/api/root";
import { NextRequest } from "next/server";
import { createClient } from '@/app/utils/supabase/server';

const handler = async (req: NextRequest) => {
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      return { user };
    },
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

  // Add CORS headers for development
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Request-Method', '*');
    response.headers.set('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    response.headers.set('Access-Control-Allow-Headers', '*');
  }

  return response;
};

export { handler as GET, handler as POST };
