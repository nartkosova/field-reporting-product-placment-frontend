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
import workDayService from "../services/workDayService";
import { WorkLogDay, WorkLogDayInput } from "../types/workDayInterface";

type QueuedPodravkaBatchPayload =
  | PodravkaFacingInput[]
  | {
      facings: PodravkaFacingInput[];
      work_log_day_id?: number;
      work_date?: string;
    };

type QueuedCompetitorBatchPayload =
  | CompetitorFacingInput[]
  | {
      facings: CompetitorFacingInput[];
      work_log_day_id?: number;
      work_date?: string;
    };

export const getDB = () => {
  return openDB("p-app", 5, {
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
      if (!db.objectStoreNames.contains("pendingWorkDays")) {
        db.createObjectStore("pendingWorkDays", { keyPath: "work_date" });
      }
    },
  });
};

export const queueWorkDay = async (payload: WorkLogDayInput) => {
  const db = await getDB();
  await db.put("pendingWorkDays", payload);
  console.log("✅ Work day saved to IndexedDB queue:", payload.work_date);
};

export const getQueuedWorkDayByDate = async (
  workDate: string
): Promise<WorkLogDayInput | null> => {
  const db = await getDB();
  return (await db.get("pendingWorkDays", workDate)) ?? null;
};

export const getAllQueuedWorkDays = async (): Promise<WorkLogDayInput[]> => {
  const db = await getDB();
  return db.getAll("pendingWorkDays");
};

export const clearQueuedWorkDay = async (workDate: string) => {
  const db = await getDB();
  await db.delete("pendingWorkDays", workDate);
};

export const syncQueuedWorkDays = async () => {
  const queued = await getAllQueuedWorkDays();
  if (queued.length === 0) return;

  for (const payload of queued) {
    try {
      const existingDays = await workDayService.listWorkDays({
        start_date: payload.work_date,
        end_date: payload.work_date,
      });

      let syncedDay: WorkLogDay;
      if (existingDays[0]) {
        syncedDay = await workDayService.updateWorkDay(
          existingDays[0].work_log_day_id,
          payload
        );
      } else {
        syncedDay = await workDayService.createWorkDay(payload);
      }

      await clearQueuedWorkDay(payload.work_date);
      console.log("✅ Synced work day:", syncedDay.work_date);
    } catch (err) {
      // Keep going: one unsyncable day must not block every other queued day.
      // The failed entry stays in the queue for the next sync attempt.
      console.error("Error syncing work day:", payload.work_date, err);
      continue;
    }
  }
};
export const queueFacings = async (payload: QueuedPodravkaBatchPayload) => {
  const db = await getDB();
  await db.add("pendingFacings", payload);
  console.log("✅ Saved to IndexedDB:", payload);
};
export const getAllQueuedFacings = async (): Promise<
  QueuedPodravkaBatchPayload[]
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
const CACHE_DURATION = 30 * 60 * 1000; // 72 hours

export const fetchAndCacheCompetitorCategories = async () => {
  const lastUpdatedStr = localStorage.getItem(CACHE_KEY);

  const shouldFetch =
    !lastUpdatedStr || Date.now() - Number(lastUpdatedStr) >= CACHE_DURATION;

  if (!shouldFetch) {
    console.log("✅ Competitor categories cache still valid.");
    return;
  }

  try {
    const categories =
      await competitorServices.getAllCompetitorsWithCategories();
    await cacheCompetitorCategories(categories);
    localStorage.setItem(CACHE_KEY, String(Date.now()));
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
  payload: QueuedCompetitorBatchPayload
) => {
  const db = await getDB();
  await db.add("pendingCompetitorFacings", payload);
  console.log("✅ Competitor facings saved to IndexedDB:", payload);
};

export const getAllQueuedCompetitorFacings = async (): Promise<
  QueuedCompetitorBatchPayload[]
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
    work_log_day_id: formData.get("work_log_day_id"),
    work_date: formData.get("work_date"),
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
    if (item.work_log_day_id) {
      formData.append("work_log_day_id", item.work_log_day_id);
    }
    if (item.work_date) {
      formData.append("work_date", item.work_date);
    }

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

export const syncAllIfNeeded = async (): Promise<boolean> => {
  const [queuedWorkDays, queuedFacings, queuedCompetitorFacings, queuedPhotos] =
    await Promise.all([
      getAllQueuedWorkDays(),
      getAllQueuedFacings(),
      getAllQueuedCompetitorFacings(),
      getDB().then((db) => db.getAll("pendingPhotos")),
    ]);

  const shouldSync =
    queuedWorkDays.length > 0 ||
    queuedFacings.length > 0 ||
    queuedCompetitorFacings.length > 0 ||
    queuedPhotos.length > 0;

  if (!shouldSync) {
    console.log("✅ Nothing to sync.");
    return false;
  }

  console.log("🔁 Syncing all pending data...");
  await syncQueuedWorkDays();
  await syncQueuedFacings();
  await syncQueuedCompetitorFacings();
  await syncQueuedPhotos();

  return true;
};
