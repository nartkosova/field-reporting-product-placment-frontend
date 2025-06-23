import { openDB } from "idb";
import {
  CompetitorFacingInput,
  PodravkaFacingInput,
} from "../types/podravkaFacingInterface";
import podravkaFacingsService from "../services/podravkaFacingsService";
import { BrandCategory } from "../types/productInterface";
import competitorFacingsService from "../services/competitorFacingsService";
import photoService from "../services/photoService";

export const getDB = () => {
  return openDB("p-app", 4, {
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
      if (!db.objectStoreNames.contains("pendingPhotos")) {
        db.createObjectStore("pendingPhotos", { autoIncrement: true });
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

export const queuePhoto = async (formData: FormData) => {
  const db = await getDB();
  const file = formData.get("photo") as File;
  if (!file) return;

  const buffer = await file.arrayBuffer();

  const payload = {
    photo: buffer,
    photo_name: file.name,
    photo_type: formData.get("photo_type"),
    category: formData.get("category"),
    company: formData.get("company"),
    user_id: formData.get("user_id"),
    store_id: formData.get("store_id"),
    photo_description: formData.get("photo_description"),
  };

  await db.add("pendingPhotos", payload);
  console.log("✅ Photo saved to IndexedDB queue");
};

export const syncQueuedPhotos = async () => {
  const db = await getDB();
  const all = await db.getAll("pendingPhotos");

  for (const item of all) {
    const blob = new Blob([item.photo]);
    const formData = new FormData();

    formData.append("photo", blob, item.photo_name);
    formData.append("photo_type", item.photo_type);
    formData.append("category", item.category);
    formData.append("company", item.company);
    formData.append("user_id", item.user_id);
    formData.append("store_id", item.store_id);
    formData.append("photo_description", item.photo_description);

    try {
      await photoService.createPhoto(formData);
    } catch (err) {
      console.error("❌ Failed to sync photo:", err);
      return;
    }
  }

  await db.clear("pendingPhotos");
  console.log("✅ Synced all queued photos");
};
