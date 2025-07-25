/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import podravkaFacingsService from "../../services/podravkaFacingsService";
import userService from "../../services/userService";
import storeServices from "../../services/storeServices";
import ReportTable, { FacingTable } from "./ReportTable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { User, Store } from "../../types/reportInterface";
import ReportChart from "./ReportChart";
import GenericReportHeader from "../../components/BaseTableHeader/BaseTableHeader";
import { useProductCategories } from "../../hooks/useProductCategories";
import { useUser } from "../../hooks/useUser";

const ReportHeader = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [facings, setFacings] = useState<FacingTable[]>([]);
  const {
    categories: productCategories,
    businessUnits,
    getCategoriesForBusinessUnit,
  } = useProductCategories();
  const [selectedBU, setSelectedBU] = useState<string | null>(null);
  const { user, userRole } = useUser();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const [userList, storeList] = await Promise.all([
        userService.getAllUsers(),
        storeServices.getStoresWithUserId(),
      ]);

      setUsers(userList);
      setStores(storeList);
    };

    fetchInitialData();
  }, []);

  const userOptions = users.map((u) => ({
    value: String(u.user_id),
    label: u.user,
  }));

  const filteredStores = useMemo(() => {
    if (selectedUsers.includes("all") || selectedUsers.length === 0) {
      return stores;
    }

    return stores.filter((s) => selectedUsers.includes(String(s.user_id)));
  }, [stores, selectedUsers]);

  const filteredCategories = useMemo(() => {
    const cleanBU = selectedBU?.trim();
    return cleanBU ? getCategoriesForBusinessUnit(cleanBU) : productCategories;
  }, [selectedBU, getCategoriesForBusinessUnit, productCategories]);

  const filterConfigs = useMemo(() => {
    interface FilterOption {
      value: string;
      label: string;
    }

    interface FilterConfig {
      key: string;
      options: FilterOption[];
      placeholder: string;
      className?: string;
      onChange?: (selected: FilterOption[]) => void;
    }

    return [
      {
        key: "business_unit",
        options: [
          { value: "all", label: "Zgjidh të gjitha" },
          ...businessUnits.map((unit) => ({
            value: unit,
            label: unit,
          })),
        ],
        placeholder: "Zgjedh njesinë e biznesit",
        onChange: (selected) => {
          setSelectedBU(
            selected[0]?.value === "all" ? null : selected[0]?.value ?? null
          );
        },
      },
      {
        key: "categories",
        options: [
          { value: "all", label: "Zgjidh të gjitha" },
          ...filteredCategories.map((c) => ({ value: c, label: c })),
        ],
        placeholder: "Zgjedh kategorinë",
      },
      {
        key: "user_ids",
        options: [{ value: "all", label: "Zgjidh të gjitha" }, ...userOptions],
        placeholder: "Zgjidh përdoruesin",
        onChange: (selected) => {
          const values = selected?.map((s) => s.value) ?? [];
          setSelectedUsers(values.includes("all") ? [] : values);
        },
      },
      {
        key: "store_ids",
        options: [
          { value: "all", label: "Zgjidh të gjitha" },
          ...filteredStores.map((s) => ({
            value: String(s.store_id),
            label: s.store_name,
          })),
        ],
        placeholder: "Zgjidh dyqanin",
        className: "md:w-1/2 w-full",
      },
    ] as FilterConfig[];
  }, [userOptions, filteredStores, filteredCategories, businessUnits]);

  const competitorColumns = useMemo(() => {
    const names = new Set<string>();
    facings.forEach((f) => {
      Object.entries(f.competitors || {}).forEach(([brand, count]) => {
        if (Number(count) > 0) names.add(brand);
      });
    });
    return Array.from(names);
  }, [facings]);

  const fetchData = useCallback(
    async (pageSize: number, offset: number, filters: Record<string, any>) => {
      const {
        user_ids,
        store_ids,
        categories,
        start_date,
        end_date,
        report_month,
        business_unit,
      } = filters;

      const query: Record<string, string | string[]> = {};

      if (user_ids?.length > 0) query.user_id = user_ids;
      if (store_ids?.length > 0) query.store_id = store_ids;
      if (categories?.length > 0) query.category = categories;
      if (business_unit?.length > 0) {
        query.business_unit = business_unit[0];
      }

      if (start_date && end_date) {
        query.start_date = start_date;
        query.end_date = end_date;
      } else if (report_month?.length > 0) {
        const year = new Date().getFullYear();
        const monthIndex = parseInt(report_month[0], 10) - 1;
        const start = new Date(year, monthIndex, 1);
        const end = new Date(year, monthIndex + 1, 0);
        query.start_date = start.toISOString().split("T")[0];
        query.end_date = end.toISOString().split("T")[0];
      }

      const res =
        await podravkaFacingsService.getPodravkaFacingsWithCompetitors(
          query,
          pageSize,
          offset
        );

      const typedData = res.data as FacingTable[];
      setFacings(typedData);

      return {
        data: typedData,
        total: res.total,
      };
    },
    []
  );

  const handleExportExcel = () => {
    const dataToExport = facings.map((row) => {
      const podravka = Number(row.total_facings);
      const competitor = Object.values(row.competitors || {}).reduce(
        (sum, val) => sum + Number(val),
        0
      );
      const total = podravka + competitor;
      const podravkaPercent = total === 0 ? 0 : (podravka / total) * 100;

      const competitors = competitorColumns.reduce((acc, brand) => {
        const count = row.competitors?.[brand] ?? 0;
        const percent = total === 0 ? 0 : (count / total) * 100;
        acc[brand] = `${count} (${percent.toFixed(1)}%)`;
        return acc;
      }, {} as Record<string, string>);

      return {
        User: row.user,
        Store: row.store_name,
        Category: row.category,
        "Podravka Facings": `${podravka} (${podravkaPercent.toFixed(1)}%)`,
        ...competitors,
        "Total Facings Konkurrenca": `${competitor} (${(total === 0
          ? 0
          : (competitor / total) * 100
        ).toFixed(1)}%)`,
        Date: new Date(row.created_at).toLocaleDateString(),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Facings Report");

    const blob = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });

    const buf = new ArrayBuffer(blob.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < blob.length; i++) {
      view[i] = blob.charCodeAt(i) & 0xff;
    }

    saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      `facings_report_${Date.now()}.xlsx`
    );
  };

  return (
    <div className="py-4">
      <GenericReportHeader
        title="Raportet PPL"
        filtersConfig={filterConfigs}
        fetchData={fetchData}
        renderTable={(data, filters) => {
          const activeFilters: (
            | "user"
            | "store_name"
            | "category"
            | "business_unit"
            | "created_at"
          )[] = [];

          if (filters.user_ids?.length) activeFilters.push("user");

          if (filters.store_ids?.length) activeFilters.push("store_name");

          if (filters.categories?.length) activeFilters.push("category");

          if (filters.business_unit?.length)
            activeFilters.push("business_unit");

          if (filters.start_date && filters.end_date)
            activeFilters.push("created_at");

          return (
            <>
              <ReportTable
                data={data}
                competitorColumns={competitorColumns}
                activeFilters={activeFilters}
              />
              {userRole === "admin" && <ReportChart data={data} />}
            </>
          );
        }}
        exportExcel={handleExportExcel}
        user={user}
        userRole={userRole}
      />
    </div>
  );
};

export default ReportHeader;
