import { useCallback, useEffect, useState } from "react";
import GenericReportHeader from "../../components/BaseTableHeader/BaseTableHeader";
import { useUser } from "../../hooks/useUser";
import userService from "../../services/userService";
import workDayService from "../../services/workDayService";
import { DetailedWorkDayReportRow } from "../../types/workDayReportInterface";
import { WORK_LOG_STATUS_OPTIONS } from "../../types/workDayInterface";
import WorkDayReportTable from "./WorkDayReportTable";
import { withDerivedStoreVisits, FLAG_LABELS, STATUS_STYLES, formatMinutes, formatTime } from "../../utils/attendance";

const getStatusLabel = (status: (typeof WORK_LOG_STATUS_OPTIONS)[number]["value"]) => {
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

const exportCsv = (rows: DetailedWorkDayReportRow[]) => {
  const columns = [
    "Perdoruesi",
    "Data",
    "Statusi",
    "Verifikimi",
    "Check-in",
    "Check-out",
    "Ore pune",
    "Ne market",
    "Vizita",
    "Vizita me foto",
    "Paralajmerime",
    "Detajet e vizitave",
    "KM Fillestar",
    "KM Perfundimtar",
    "KM te Pershkuara",
    "Plani",
    "Permbledhja",
    "Arsyeja e mungeses",
    "Qytetet",
    "Aktivitetet",
    "Foto",
    "PPL Podravka",
    "PPL Konkurrenca",
  ];

  const escapeCsvValue = (value: string | number | null | undefined) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const csvRows = rows.map((row) => [
    row.user,
    row.work_date,
    getStatusLabel(row.status),
    row.verification ? STATUS_STYLES[row.verification.verification_status].label : "",
    formatTime(row.verification?.check_in_at),
    row.verification?.check_out_at
      ? formatTime(row.verification.check_out_at)
      : row.verification?.estimated_check_out_at
      ? `~${formatTime(row.verification.estimated_check_out_at)} (pa check-out)`
      : "-",
    formatMinutes(row.verification?.worked_minutes),
    row.verification ? formatMinutes(row.verification.in_store_minutes) : "",
    row.verification?.visit_count ?? "",
    row.verification?.photo_visit_count ?? "",
    (row.verification?.flags || []).map((flag) => FLAG_LABELS[flag]).join(", "),
    (row.verification?.visits || [])
      .map(
        (visit) =>
          `${formatTime(visit.check_in_at)}-${formatTime(visit.check_out_at)} ${visit.store_name} (foto: ${
            visit.photos.map((photo) => photo.photo_url).join(" ") || "-"
          })`
      )
      .join(" | "),
    row.start_kilometers,
    row.end_kilometers,
    row.kilometers_driven,
    row.plan,
    row.summary,
    row.absence_reason,
    row.cities
      .map(
        (city) =>
          `${city.visit_order ?? "-"} ${city.city_name}${
            city.note ? ` (${city.note})` : ""
          }`
      )
      .join(", "),
    withDerivedStoreVisits(row.activities, row.verification?.visits ?? [])
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
      .join(" | "),
    row.report_photo_count,
    row.podravka_facing_count,
    row.competitor_facing_count,
  ]);

  const csv = [columns, ...csvRows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "raporti-i-dites-se-punes.csv";
  link.click();
  URL.revokeObjectURL(url);
};

const WorkDayReportHeader = () => {
  const { user, userRole } = useUser();
  const [users, setUsers] = useState<Array<{ user_id: number; user: string }>>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const userList = await userService.getAllUsersWithAdmin();
      setUsers(userList);
    };

    loadUsers();
  }, []);

  const fetchData = useCallback(
    async (
      pageSize: number,
      offset: number,
      filters: Record<string, string | number | boolean | string[] | number[] | boolean[]>
    ) => {
      return workDayService.getDetailedWorkDayReport(pageSize, offset, filters);
    },
    []
  );

  return (
    <div className="py-4">
      <GenericReportHeader<DetailedWorkDayReportRow>
        title="Raporti i Dites se Punes"
        filtersConfig={[
          {
            key: "user_id",
            options: users.map((u) => ({
              value: String(u.user_id),
              label: u.user,
            })),
            placeholder: "Zgjidh perdoruesin",
          },
          {
            key: "status",
            options: WORK_LOG_STATUS_OPTIONS.map((status) => ({
              value: status.value,
              label: getStatusLabel(status.value),
            })),
            placeholder: "Zgjidh statusin",
          },
        ]}
        fetchData={fetchData}
        renderTable={(data) => <WorkDayReportTable data={data} />}
        exportCsv={exportCsv}
        user={user}
        userRole={userRole}
      />
    </div>
  );
};

export default WorkDayReportHeader;
