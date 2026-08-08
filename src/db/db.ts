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

export interface DrainResult {
  synced: number;
  failed: number;
}

/**
 * Sends every queued entry in a store and deletes each one immediately after
 * its OWN upload succeeds.
 *
 * This per-entry delete is the whole point: clearing the store once at the end
 * means a failure halfway through leaves already-uploaded entries queued, and
 * the next sync uploads them a second time — duplicate facings and photos in
 * the audit data. A failed entry stays queued and is retried later; it never
 * blocks the entries behind it.
 */
const drainStore = async <T>(
  storeName: "pendingFacings" | "pendingCompetitorFacings" | "pendingPhotos" | "pendingWorkDays",
  send: (payload: T) => Promise<unknown>
): Promise<DrainResult> => {
  const db = await getDB();

  // Read keys and values together so each payload can be deleted by its own key.
  const [keys, values] = await Promise.all([
    db.getAllKeys(storeName),
    db.getAll(storeName),
  ]);

  let synced = 0;
  let failed = 0;

  for (let index = 0; index < values.length; index += 1) {
    const key = keys[index];
    const payload = values[index] as T;

    try {
      await send(payload);
      await db.delete(storeName, key);
      synced += 1;
    } catch (err) {
      failed += 1;
      console.error(`Failed to sync entry in ${storeName}:`, key, err);
    }
  }

  if (synced || failed) {
    console.log(`${storeName}: ${synced} synced, ${failed} still queued`);
  }

  return { synced, failed };
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

export const syncQueuedWorkDays = () =>
  drainStore<WorkLogDayInput>("pendingWorkDays", async (payload) => {
    // Upsert by date: a day created online before the queue drains must be
    // updated, not duplicated (the server also enforces one row per user/date).
    const existingDays = await workDayService.listWorkDays({
      start_date: payload.work_date,
      end_date: payload.work_date,
    });

    const syncedDay: WorkLogDay = existingDays[0]
      ? await workDayService.updateWorkDay(
          existingDays[0].work_log_day_id,
          payload
        )
      : await workDayService.createWorkDay(payload);

    return syncedDay;
  });
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

export const syncQueuedFacings = () =>
  drainStore<QueuedPodravkaBatchPayload>("pendingFacings", (batch) =>
    podravkaFacingsService.batchCreatePodravkaFacings(batch)
  );

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

export const syncQueuedCompetitorFacings = () =>
  drainStore<QueuedCompetitorBatchPayload>(
    "pendingCompetitorFacings",
    (batch) => competitorFacingsService.batchCreateCompetitorFacings(batch)
  );

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

interface QueuedPhoto {
  photo: ArrayBuffer;
  photo_name: string;
  photo_type: string;
  category: string;
  company: string;
  user_id: string;
  store_id: string;
  photo_description: string;
  work_log_day_id?: string | null;
  work_date?: string | null;
}

export const syncQueuedPhotos = () =>
  drainStore<QueuedPhoto>("pendingPhotos", (item) => {
    const formData = new FormData();

    formData.append("photo", new Blob([item.photo]), item.photo_name);
    formData.append("photo_type", item.photo_type);
    formData.append("category", item.category);
    formData.append("company", item.company);
    formData.append("user_id", item.user_id);
    formData.append("store_id", item.store_id);
    formData.append("photo_description", item.photo_description);
    if (item.work_log_day_id) {
      formData.append("work_log_day_id", String(item.work_log_day_id));
    }
    if (item.work_date) {
      formData.append("work_date", String(item.work_date));
    }

    return photoService.createPhoto(formData);
  });

// syncAllIfNeeded is triggered from app start, the browser "online" event and
// the header. Two overlapping runs would read the same queue and upload every
// entry twice, so concurrent callers share one in-flight run.
let inFlightSync: Promise<boolean> | null = null;

const runSyncAll = async (): Promise<boolean> => {
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

  // Work days first: facings and photos link to a work-log day, so syncing the
  // day first lets the server attach the evidence to the right record.
  const results = [
    await syncQueuedWorkDays(),
    await syncQueuedFacings(),
    await syncQueuedCompetitorFacings(),
    await syncQueuedPhotos(),
  ];

  const stillQueued = results.reduce((total, r) => total + r.failed, 0);
  if (stillQueued) {
    console.warn(`${stillQueued} entr(ies) remain queued and will be retried.`);
  }

  return true;
};

export const syncAllIfNeeded = (): Promise<boolean> => {
  if (inFlightSync) {
    return inFlightSync;
  }

  inFlightSync = runSyncAll().finally(() => {
    inFlightSync = null;
  });

  return inFlightSync;
};
