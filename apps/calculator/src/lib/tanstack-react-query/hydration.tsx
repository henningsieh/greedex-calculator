import {
  dehydrate,
  HydrationBoundary,
  type QueryClient,
} from "@tanstack/react-query";
import { cache } from "react";

import { env } from "@/env";
import { createQueryClient } from "@/lib/tanstack-react-query/client";

export const getQueryClient = cache(createQueryClient);

export function swallowPrefetchError(error: unknown) {
  if (env.NODE_ENV !== "production") {
    console.error("[prefetch] swallowed error:", error);
  }
}

export function HydrateClient(props: {
  children: React.ReactNode;
  client: QueryClient;
}) {
  return (
    <HydrationBoundary state={dehydrate(props.client)}>
      {props.children}
    </HydrationBoundary>
  );
}
