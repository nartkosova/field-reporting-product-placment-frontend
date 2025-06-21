import { openDB } from "idb";
import { PodravkaFacingInput } from "../types/podravkaFacingInterface";
import podravkaFacingsService from "../services/podravkaFacingsService";

export const getDB = () => {
  return openDB("p-app", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("pendingFacings")) {
        db.createObjectStore("pendingFacings", { autoIncrement: true });
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
