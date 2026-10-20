import {
  VerificationFlag,
  VerificationStatus,
} from "../types/attendanceInterface";

export const formatTime = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

export const formatMinutes = (minutes: number | null | undefined) => {
  if (minutes === null || minutes === undefined) return "-";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h ${String(rest).padStart(2, "0")}m` : `${rest}m`;
};

export const FLAG_LABELS: Record<VerificationFlag, string> = {
  no_check_in: "Pa check-in",
  late_check_in: "Filloi me vonesë",
  no_check_out: "Pa check-out",
  early_check_out: "Mbaroi herët",
  short_day: "Ditë e shkurtër",
  no_visits: "Asnjë vizitë marketi",
  open_visit: "Vizitë e pambyllur",
  short_visit: "Vizitë shumë e shkurtër",
  activity_outside_visit: "Aktivitet jashtë vizitës",
  long_gap: "Pauzë e gjatë",
  no_arrival_photo: "Pa foto në market",
};

export const CRITICAL_FLAGS: VerificationFlag[] = [
  "no_check_in",
  "no_visits",
  "activity_outside_visit",
];

export const STATUS_STYLES: Record<
  VerificationStatus | "missing",
  { label: string; className: string }
> = {
  ok: {
    label: "✓ Në rregull",
    className: "border-green-700 bg-green-950/50 text-green-200",
  },
  warning: {
    label: "⚠ Kujdes",
    className: "border-amber-700 bg-amber-950/50 text-amber-100",
  },
  critical: {
    label: "✕ Problem",
    className: "border-red-700 bg-red-950/50 text-red-200",
  },
  legacy: {
    label: "Para check-in",
    className: "border-neutral-700 bg-neutral-900 text-neutral-300",
  },
  absence: {
    label: "Mungesë",
    className: "border-sky-800 bg-sky-950/40 text-sky-200",
  },
  missing: {
    label: "✕ Pa ditë pune",
    className: "border-red-700 bg-red-950/50 text-red-200",
  },
};

type VisitLike = {
  store_name: string;
  check_in_at: string;
  check_out_at: string | null;
};

// "Interex Prishtine 09:12–09:40 · Spar Gjilan 10:05–…"
export const formatVisitList = (visits: VisitLike[]) =>
  visits
    .map(
      (visit) =>
        `${visit.store_name} ${formatTime(visit.check_in_at)}–${formatTime(visit.check_out_at)}`,
    )
    .join(" · ");

type ActivityLike = {
  activity_type: string;
  planned: boolean;
  completed: boolean;
  note: string | null;
};

/**
 * "Vizite ne Market" activities as they should be reported: the plan stays as
 * the employee wrote it, but completion and the store list come from the real
 * check-ins. Visits without a planned activity still appear as one.
 */
export const withDerivedStoreVisits = <T extends ActivityLike>(
  activities: T[],
  visits: VisitLike[],
): Array<T & { derived_visits?: string }> => {
  if (!visits.length) return activities;

  const visitText = formatVisitList(visits);
  const hasStoreVisit = activities.some(
    (activity) => activity.activity_type === "store_visit",
  );

  const merged = activities.map((activity) =>
    activity.activity_type === "store_visit"
      ? { ...activity, completed: true, derived_visits: visitText }
      : activity,
  );

  return hasStoreVisit
    ? merged
    : [
        ...merged,
        {
          activity_type: "store_visit",
          planned: false,
          completed: true,
          note: null,
          derived_visits: visitText,
        } as unknown as T & { derived_visits: string },
      ];
};
