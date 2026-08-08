import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { BaseTable } from "../../components/BaseTable/BaseTable";
import { DetailedWorkDayReportRow } from "../../types/workDayReportInterface";

const columnHelper = createColumnHelper<DetailedWorkDayReportRow>();

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
      columnHelper.accessor("work_date", { header: "Data" }),
      columnHelper.accessor("status", {
        header: "Statusi",
        cell: (info) => getStatusLabel(info.getValue()),
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
        cell: ({ row }) =>
          row.original.activities.length
            ? row.original.activities
                .map((activity) => {
                  const flags = [
                    activity.planned ? "plan" : null,
                    activity.completed ? "done" : null,
                  ]
                    .filter(Boolean)
                    .join(", ");

                  return `${getActivityLabel(activity.activity_type)}${
                    flags ? ` [${flags}]` : ""
                  }${activity.note ? ` - ${activity.note}` : ""}`;
                })
                .join(" | ")
            : "-",
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
