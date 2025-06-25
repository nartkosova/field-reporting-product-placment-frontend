import { openDB } from "idb";
import {
  CompetitorFacingInput,
  PodravkaFacingInput,
} from "../types/podravkaFacingInterface";
import podravkaFacingsService from "../services/podravkaFacingsService";
import { BrandCategory } from "../types/productInterface";
import competitorFacingsService from "../services/competitorFacingsService";
import photoService from "../services/photoService";
import competitorServices from "../services/competitorServices";

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
    await store.put(item); // item must include a 'category' key (your keyPath)
  }

  await tx.done;
};

const CACHE_KEY = "competitorCategoriesLastUpdated";
const CACHE_DURATION = 72 * 60 * 60 * 1000; // 24 hours in milliseconds

export const fetchAndCacheCompetitorCategories = async () => {
  const lastUpdatedStr = localStorage.getItem(CACHE_KEY);
  const lastUpdated = lastUpdatedStr ? Number(lastUpdatedStr) : 0;
  const now = Date.now();

  if (now - lastUpdated < CACHE_DURATION) {
    console.log("✅ Competitor categories cache still valid.");
    return;
  }

  try {
    const categories =
      await competitorServices.getAllCompetitorsWithCategories();
    await cacheCompetitorCategories(categories);
    localStorage.setItem(CACHE_KEY, String(now));
    console.log("✅ Competitor categories updated.");
  } catch (err) {
    console.error("❌ Failed to fetch competitor categories", err);
  }
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

export const syncAllIfNeeded = async () => {
  const [queuedFacings, queuedCompetitorFacings, queuedPhotos] =
    await Promise.all([
      getAllQueuedFacings(),
      getAllQueuedCompetitorFacings(),
      getDB().then((db) => db.getAll("pendingPhotos")),
    ]);

  const shouldSync =
    queuedFacings.length > 0 ||
    queuedCompetitorFacings.length > 0 ||
    queuedPhotos.length > 0;

  if (!shouldSync) {
    console.log("✅ Nothing to sync.");
    return;
  }

  console.log("🔁 Syncing all pending data...");
  await syncQueuedFacings();
  await syncQueuedCompetitorFacings();
  await syncQueuedPhotos();
};
