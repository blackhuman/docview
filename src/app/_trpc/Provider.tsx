'use client';

import { defaultShouldDehydrateQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink, splitLink, unstable_httpSubscriptionLink } from "@trpc/client";
import React, { useState } from "react";
import { trpc } from "./client";
import superjson from "superjson";

export function getClient() {
  return trpc.createClient({
    links: [
      loggerLink(),
      splitLink({
        // uses the httpSubscriptionLink for subscriptions
        condition: (op) => {
          return op.type === 'subscription'
        },
        true: unstable_httpSubscriptionLink({
          url: `/api/trpc`,
          transformer: {
            serialize(object) {
              const result = superjson.serialize(object)
              return result
            },
            deserialize(object) {
              const result = superjson.deserialize(object)
              return result
            },
          },
        }),
        false: httpBatchLink({
          url: `/api/trpc`,
          transformer: superjson,
        }),
      }),
    ],
  });
}

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        // serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
      hydrate: {
        // deserializeData: superjson.deserialize,
      },
    },
  });
}

let clientQueryClientSingleton: QueryClient;
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= makeQueryClient());
}


export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() => getClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
