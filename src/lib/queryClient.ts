import axios from "axios";
import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { removeOldestQuery } from "@tanstack/react-query-persist-client";

const HOUR = 60 * 60 * 1000;

// Bump when a cached response shape changes, so old caches are discarded.
export const CACHE_BUSTER = "1";
export const CACHE_MAX_AGE = 12 * HOUR;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      gcTime: CACHE_MAX_AGE,
    },
  },
});

// localStorage also holds offline data (store products, selected store), so
// the cache must never crowd it out: if a write hits the quota, the oldest
// cached queries are dropped until it fits.
export const queryPersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "pplQueryCache",
  retry: removeOldestQuery,
});

// Only queries marked { meta: { persist: true } } survive a page reload.
export const shouldPersistQuery = (query: {
  meta?: Record<string, unknown>;
  state: { status: string };
}) => query.meta?.persist === true && query.state.status === "success";

// Report data counts as fresh for an hour, then refetches on next use.
export const REPORT_STALE_TIME = 60 * 60 * 1000;

export const clearQueryCache = () => {
  queryClient.clear();
  queryPersister.removeClient();
};

// Writes that change what the cached reports show. Matched on the request
// path, so PPL posted live and PPL synced later from the offline queue both
// count, without touching the queue itself.
const AFFECTED_QUERIES: Array<{ path: string; queryKeys: string[] }> = [
  {
    path: "/api/facings/",
    queryKeys: ["ppl-report", "analytics", "day-overview"],
  },
  { path: "/api/photos/", queryKeys: ["analytics", "day-overview"] },
];

const WRITE_METHODS = new Set(["post", "put", "patch", "delete"]);

export const setupCacheInvalidation = () => {
  axios.interceptors.response.use((response) => {
    try {
      const method = (response.config.method || "").toLowerCase();
      const url = response.config.url || "";
      if (WRITE_METHODS.has(method)) {
        AFFECTED_QUERIES.filter(({ path }) => url.includes(path)).forEach(
          ({ queryKeys }) =>
            queryKeys.forEach((key) =>
              queryClient.invalidateQueries({ queryKey: [key] }),
            ),
        );
      }
    } catch {
      // Cache bookkeeping must never fail the request that triggered it.
    }
    return response;
  });
};
