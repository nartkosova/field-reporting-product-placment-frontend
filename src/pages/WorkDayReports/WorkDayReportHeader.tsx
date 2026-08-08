import { useCallback, useEffect, useState } from "react";
import GenericReportHeader from "../../components/BaseTableHeader/BaseTableHeader";
import { useUser } from "../../hooks/useUser";
import userService from "../../services/userService";
import workDayService from "../../services/workDayService";
import { DetailedWorkDayReportRow } from "../../types/workDayReportInterface";
import { WORK_LOG_STATUS_OPTIONS } from "../../types/workDayInterface";
import WorkDayReportTable from "./WorkDayReportTable";

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
        user={user}
        userRole={userRole}
      />
    </div>
  );
};

export default WorkDayReportHeader;
