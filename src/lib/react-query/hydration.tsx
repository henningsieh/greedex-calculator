import {
  dehydrate,
  HydrationBoundary,
  type QueryClient,
} from "@tanstack/react-query";
import { connection } from "next/server";
import { cache } from "react";
import { createQueryClient } from "@/lib/react-query/client";

export const getQueryClient = cache(createQueryClient);

export async function HydrateClient(props: {
  children: React.ReactNode;
  client: QueryClient;
}) {
  // Await connection() to ensure this component defers to request time
  // This is required for PPR when using dehydrate() which internally uses Date.now()
  // See: https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering
  await connection();
  
  return (
    <HydrationBoundary state={dehydrate(props.client)}>
      {props.children}
    </HydrationBoundary>
  );
}
