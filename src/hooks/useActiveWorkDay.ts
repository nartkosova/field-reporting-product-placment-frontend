import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { ActiveWorkDaySelection } from "../types/workDayInterface";
import { getToken } from "../services/authService";

const STORAGE_KEY = "activeWorkDay";
const EVENT_NAME = "activeWorkDayChanged";

type DecodedToken = {
  user_id?: number;
};

const normalizeDateOnly = (value: string) => value.slice(0, 10);

const getCurrentUserId = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return typeof decoded.user_id === "number" ? decoded.user_id : null;
  } catch {
    return null;
  }
};

const readActiveWorkDay = (): ActiveWorkDaySelection | null => {
  const item = localStorage.getItem(STORAGE_KEY);
  if (!item) return null;

  try {
    const parsed = JSON.parse(item) as Partial<ActiveWorkDaySelection>;
    const currentUserId = getCurrentUserId();

    if (
      typeof parsed.user_id !== "number" ||
      typeof parsed.work_date !== "string" ||
      typeof parsed.status !== "string" ||
      typeof parsed.selected_at !== "string"
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    if (currentUserId === null || parsed.user_id !== currentUserId) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return {
      user_id: parsed.user_id,
      work_log_day_id:
        typeof parsed.work_log_day_id === "number" ? parsed.work_log_day_id : null,
      work_date: normalizeDateOnly(parsed.work_date),
      status: parsed.status,
      selected_at: normalizeDateOnly(parsed.selected_at),
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const setActiveWorkDay = (selection: ActiveWorkDaySelection | null) => {
  if (selection) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...selection,
        work_date: normalizeDateOnly(selection.work_date),
        selected_at: normalizeDateOnly(selection.selected_at),
      })
    );
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }

  window.dispatchEvent(new Event(EVENT_NAME));
};

export const useActiveWorkDay = () => {
  const [activeWorkDay, setActiveWorkDayState] =
    useState<ActiveWorkDaySelection | null>(readActiveWorkDay);

  useEffect(() => {
    const sync = () => setActiveWorkDayState(readActiveWorkDay());

    window.addEventListener("storage", sync);
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener("authTokenChanged", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener("authTokenChanged", sync);
    };
  }, []);

  return activeWorkDay;
};
