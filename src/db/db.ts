import { openDB } from "idb";
import {
  CompetitorFacingInput,
  PodravkaFacingInput,
} from "../types/podravkaFacingInterface";
import podravkaFacingsService from "../services/podravkaFacingsService";
import { BrandCategory } from "../types/productInterface";
import competitorFacingsService from "../services/competitorFacingsService";

export const getDB = () => {
  return openDB("p-app", 3, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("pendingFacings")) {
        db.createObjectStore("pendingFacings", { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("competitorCategories")) {
        db.createObjectStore("competitorCategories", { keyPath: "category" });
      }
      if (!db.objectStoreNames.contains("pendingCompetitorFacings")) {
        db.createObjectStore("pendingCompetitorFacings", {
          autoIncrement: true,
        });
      }
    },
  });
};

export const queueFacings = async (payload: PodravkaFacingInput[]) => {
  const db = await getDB();
  await db.add("pendingFacings", payload);
  console.log("✅ Saved to IndexedDB:", payload);
};
export const getAllQueuedFacings = async (): Promise<
  PodravkaFacingInput[][]
> => {
  const db = await getDB();
  return db.getAll("pendingFacings");
};

export const clearQueuedFacings = async () => {
  const db = await getDB();
  await db.clear("pendingFacings");
};

export const syncQueuedFacings = async () => {
  const queued = await getAllQueuedFacings();
  if (queued.length === 0) return;

  for (const batch of queued) {
    try {
      await podravkaFacingsService.batchCreatePodravkaFacings(batch);
    } catch (err) {
      console.error("Error syncing batch:", err);
      return;
    }
  }

  await clearQueuedFacings();
  console.log("Synced all pending facings");
};

export const cacheCompetitorCategories = async (
  categories: BrandCategory[]
) => {
  const db = await getDB();
  const tx = db.transaction("competitorCategories", "readwrite");
  const store = tx.objectStore("competitorCategories");

  for (const item of categories) {
    await store.put(item);
  }

  await tx.done;
};

export const saveCompetitorCategories = async (categories: BrandCategory[]) => {
  const db = await getDB();
  const tx = db.transaction("competitorCategories", "readwrite");
  const store = tx.objectStore("competitorCategories");
  await store.clear();
  for (const c of categories) {
    await store.put(c);
  }
  await tx.done;
};

export const getCachedBrandsByCategory = async (category: string) => {
  const db = await getDB();
  const tx = db.transaction("competitorCategories", "readonly");
  const store = tx.objectStore("competitorCategories");
  const record = await store.get(category);
  return record?.brands || [];
};

export const queueCompetitorFacings = async (
  payload: CompetitorFacingInput[]
) => {
  const db = await getDB();
  await db.add("pendingCompetitorFacings", payload);
  console.log("✅ Competitor facings saved to IndexedDB:", payload);
};

export const getAllQueuedCompetitorFacings = async (): Promise<
  CompetitorFacingInput[][]
> => {
  const db = await getDB();
  return db.getAll("pendingCompetitorFacings");
};

export const clearQueuedCompetitorFacings = async () => {
  const db = await getDB();
  await db.clear("pendingCompetitorFacings");
};

export const syncQueuedCompetitorFacings = async () => {
  const queued = await getAllQueuedCompetitorFacings();
  if (queued.length === 0) return;

  for (const batch of queued) {
    try {
      await competitorFacingsService.batchCreateCompetitorFacings(batch);
    } catch (err) {
      console.error("Error syncing competitor batch:", err);
      return;
    }
  }

  await clearQueuedCompetitorFacings();
};
