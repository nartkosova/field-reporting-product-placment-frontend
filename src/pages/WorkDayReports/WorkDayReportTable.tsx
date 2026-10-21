import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { BaseTable } from "../../components/BaseTable/BaseTable";
import { DetailedWorkDayReportRow } from "../../types/workDayReportInterface";
import PhotoGallery from "../../components/PhotoGallery/PhotoGallery";
import {
  withDerivedStoreVisits,
  CRITICAL_FLAGS,
  FLAG_LABELS,
  STATUS_STYLES,
  formatMinutes,
  formatTime,
} from "../../utils/attendance";

const columnHelper = createColumnHelper<DetailedWorkDayReportRow>();

// `work_date` is a date-only field. Parse it as a local calendar date so it
// cannot shift to the previous day for users west of UTC.
const formatWorkDate = (workDate: string) => {
  const [year, month, day] = workDate.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) return workDate;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

const getStatusLabel = (status: DetailedWorkDayReportRow["status"]) => {
  switch (status) {
    case "planned_work":
      return "Dite Pune";
    case "vacation":
      return "Pushim";
    case "sick_day":
      return "Dite Semundjeje";
    case "other":
      return "Tjeter";
  }
};

const getActivityLabel = (
  type: DetailedWorkDayReportRow["activities"][number]["activity_type"]
) => {
  switch (type) {
    case "ppl":
      return "PPL";
    case "photo_report":
      return "Raport me Foto";
    case "store_visit":
      return "Vizite ne Market";
  }
};

const WorkDayReportTable = ({ data }: { data: DetailedWorkDayReportRow[] }) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor("user", { header: "Perdoruesi" }),
      columnHelper.accessor("work_date", {
        header: "Data",
        cell: (info) => formatWorkDate(info.getValue()),
      }),
      columnHelper.accessor("status", {
        header: "Statusi",
        cell: (info) => getStatusLabel(info.getValue()),
      }),
      columnHelper.display({
        id: "verification",
        header: "Verifikimi",
        cell: ({ row }) => {
          const v = row.original.verification;
          if (!v) return "-";
          return (
            <div className="space-y-1">
              <span
                className={`inline-block rounded-full border px-2 py-0.5 text-xs ${
                  STATUS_STYLES[v.verification_status].className
                }`}
              >
                {STATUS_STYLES[v.verification_status].label}
              </span>
              <div className="flex flex-wrap gap-1 max-w-xs">
                {v.flags.map((flag) => (
                  <span
                    key={flag}
                    className={`text-xs ${
                      CRITICAL_FLAGS.includes(flag) ? "text-red-300" : "text-amber-200"
                    }`}
                  >
                    {FLAG_LABELS[flag]};
                  </span>
                ))}
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "gallery",
        header: "Fotot",
        cell: ({ row }) => (
          <PhotoGallery
            photos={row.original.verification?.gallery || []}
            title={`${row.original.user} · ${formatWorkDate(row.original.work_date)}`}
          />
        ),
      }),
      columnHelper.display({
        id: "hours",
        header: "Orari",
        cell: ({ row }) => {
          const v = row.original.verification;
          if (!v || !v.check_in_at) return "-";
          if (!v.check_out_at && v.estimated_check_out_at) {
            return (
              <span>
                {formatTime(v.check_in_at)} –{" "}
                <span className="text-amber-300" title="Pa check-out: aktiviteti i fundit i regjistruar">
                  ~{formatTime(v.estimated_check_out_at)} (pa check-out)
                </span>
              </span>
            );
          }
          return `${formatTime(v.check_in_at)} – ${formatTime(v.check_out_at)} (${formatMinutes(
            v.worked_minutes
          )})`;
        },
      }),
      columnHelper.display({
        id: "visits",
        header: "Vizitat në markete",
        cell: ({ row }) => {
          const visits = row.original.verification?.visits || [];
          if (!visits.length) return "-";
          return (
            <ul className="space-y-0.5 text-xs">
              {visits.map((visit) => (
                <li key={visit.store_visit_id}>
                  {formatTime(visit.check_in_at)}–{formatTime(visit.check_out_at)}{" "}
                  {visit.store_name}
                  {visit.duration_minutes !== null && (
                    <span className="text-neutral-400">
                      {" "}({formatMinutes(visit.duration_minutes)})
                    </span>
                  )}
                  {!visit.photos.length && (
                    <span className="text-amber-300"> pa foto</span>
                  )}
                  {visit.photos.map((photo) => (
                    <a
                      key={photo.store_visit_photo_id}
                      href={photo.photo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-1 text-sky-400 hover:underline"
                    >
                      📷
                    </a>
                  ))}
                </li>
              ))}
            </ul>
          );
        },
      }),
      columnHelper.accessor("start_kilometers", {
        header: "KM Fillestar",
        cell: (info) => info.getValue() ?? "-",
      }),
      columnHelper.accessor("end_kilometers", {
        header: "KM Perfundimtar",
        cell: (info) => info.getValue() ?? "-",
      }),
      columnHelper.accessor("kilometers_driven", {
        header: "KM te Pershkuara",
        cell: (info) => info.getValue() ?? "-",
      }),
      columnHelper.accessor("plan", {
        header: "Plani",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("summary", {
        header: "Permbledhja",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.display({
        id: "cities",
        header: "Qytetet",
        cell: ({ row }) =>
          row.original.cities.length
            ? row.original.cities
                .map((city) =>
                  `${city.visit_order ?? "-"} ${city.city_name}${
                    city.note ? ` (${city.note})` : ""
                  }`
                )
                .join(", ")
            : "-",
      }),
      columnHelper.display({
        id: "activities",
        header: "Aktivitetet",
        cell: ({ row }) => {
          const activities = withDerivedStoreVisits(
            row.original.activities,
            row.original.verification?.visits ?? []
          );
          return activities.length
            ? activities
                .map((activity) => {
                  const flags = [
                    activity.planned ? "plan" : null,
                    activity.completed ? "done" : null,
                  ]
                    .filter(Boolean)
                    .join(", ");

                  return `${getActivityLabel(activity.activity_type)}${
                    flags ? ` [${flags}]` : ""
                  }${activity.note ? ` - ${activity.note}` : ""}${
                    activity.derived_visits ? ` (${activity.derived_visits})` : ""
                  }`;
                })
                .join(" | ")
            : "-";
        },
      }),
      columnHelper.accessor("report_photo_count", { header: "Foto" }),
      columnHelper.accessor("podravka_facing_count", { header: "PPL Podravka" }),
      columnHelper.accessor("competitor_facing_count", {
        header: "PPL Konkurrenca",
      }),
    ],
    []
  );

  return <BaseTable data={data} columns={columns} />;
};

export default WorkDayReportTable;
