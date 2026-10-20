import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import podravkaFacingsService from "../../services/podravkaFacingsService";
import userService from "../../services/userService";
import storeServices from "../../services/storeServices";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { User, Store } from "../../types/reportInterface";
import PplSummary from "./PplSummary";
import PplTable, { ColumnPicker } from "./PplTable";
import {
  DEFAULT_VISIBLE,
  GROUP_OPTIONS,
  columnsFor,
  formatDate,
} from "./pplColumns";
import {
  PplGroupBy,
  PplReportResponse,
  PplRow,
  PplSortField,
} from "../../types/pplReportInterface";
import GenericReportHeader from "../../components/BaseTableHeader/BaseTableHeader";
import { toast } from "../../components/Toast/toast";
import { useProductCategories } from "../../hooks/useProductCategories";
import { useUser } from "../../hooks/useUser";

type Filters = Record<
  string,
  string | number | boolean | string[] | number[] | boolean[]
>;

const COLUMNS_KEY = "pplReportColumns";

const readVisibleColumns = (): string[] => {
  try {
    const stored = JSON.parse(localStorage.getItem(COLUMNS_KEY) || "null");
    return Array.isArray(stored) ? stored : DEFAULT_VISIBLE;
  } catch {
    return DEFAULT_VISIBLE;
  }
};

const toQuery = (filters: Filters) => {
  const list = (value: unknown) =>
    Array.isArray(value) ? value.map(String) : [];
  const query: Record<string, string | string[]> = {};
  if (list(filters.user_ids).length) query.user_id = list(filters.user_ids);
  if (list(filters.store_ids).length) query.store_id = list(filters.store_ids);
  if (list(filters.categories).length)
    query.category = list(filters.categories);
  if (list(filters.business_unit).length)
    query.business_unit = list(filters.business_unit)[0];
  if (typeof filters.start_date === "string")
    query.start_date = filters.start_date;
  if (typeof filters.end_date === "string") query.end_date = filters.end_date;
  return query;
};

const ReportHeader = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [report, setReport] = useState<PplReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [groupBy, setGroupBy] = useState<PplGroupBy>("entry");
  const [sort, setSort] = useState<{
    field: PplSortField | "";
    direction: "asc" | "desc";
  }>({
    field: "",
    direction: "desc",
  });
  const [visibleColumns, setVisibleColumns] =
    useState<string[]>(readVisibleColumns);
  // Filters of the last load, so the export covers exactly what is shown.
  const lastQuery = useRef<Record<string, string | string[]>>({});
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
            selected[0]?.value === "all" ? null : (selected[0]?.value ?? null),
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

  const fetchData = useCallback(
    async (pageSize: number, offset: number, filters: Filters) => {
      const query = toQuery(filters);
      lastQuery.current = query;
      setIsLoading(true);
      try {
        const res = await podravkaFacingsService.getPplReport({
          ...query,
          group_by: groupBy,
          ...(sort.field
            ? { sort: sort.field, direction: sort.direction }
            : {}),
          limit: pageSize,
          offset,
        });
        setReport(res);
        return { data: res.data, total: res.total };
      } finally {
        setIsLoading(false);
      }
    },
    [groupBy, sort],
  );

  const updateVisibleColumns = (next: string[]) => {
    setVisibleColumns(next);
    try {
      localStorage.setItem(COLUMNS_KEY, JSON.stringify(next));
    } catch {
      // Column choice just won't be remembered.
    }
  };

  const brands = report?.brands ?? [];
  const columns = columnsFor(groupBy, visibleColumns, brands);

  const handleSort = (field: PplSortField) =>
    setSort((current) => ({
      field,
      direction:
        (current.field || report?.sort) === field &&
        (current.direction ?? report?.direction) === "desc"
          ? "asc"
          : "desc",
    }));

  const [exporting, setExporting] = useState<"xlsx" | "csv" | null>(null);

  // Both exports contain every filtered row, with the grouping, sort and
  // columns currently chosen on screen.
  const exportReport = async (format: "xlsx" | "csv") => {
    if (exporting) return;
    setExporting(format);
    try {
      const res = await podravkaFacingsService.getPplReport({
        ...lastQuery.current,
        group_by: groupBy,
        ...(sort.field ? { sort: sort.field, direction: sort.direction } : {}),
        export: "1",
      });

      const rows = res.data.map((row: PplRow) =>
        Object.fromEntries(
          columns.map((column) => {
            if (column.id.startsWith("brand:")) {
              return [column.label, row.competitors[column.label] ?? 0];
            }
            switch (column.id) {
              case "date":
                return [column.label, formatDate(row.date)];
              case "share":
                return [
                  column.label,
                  row.share === null ? "" : `${row.share.toFixed(1)}%`,
                ];
              default:
                return [column.label, row[column.id as keyof PplRow] ?? ""];
            }
          }),
        ),
      );

      const sheet = XLSX.utils.json_to_sheet(rows, {
        header: columns.map((column) => column.label),
      });
      const fileName = `raporti_ppl_${groupBy}_${Date.now()}`;

      if (format === "csv") {
        // The BOM makes Excel open ë/ç and other accents correctly.
        const csv = XLSX.utils.sheet_to_csv(sheet);
        saveAs(
          new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }),
          `${fileName}.csv`,
        );
      } else {
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, sheet, "PPL");
        const buffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        saveAs(
          new Blob([buffer], { type: "application/octet-stream" }),
          `${fileName}.xlsx`,
        );
      }
    } catch {
      toast.error("Eksporti nuk u krye. Provo përsëri.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="py-4">
      <GenericReportHeader<PplRow>
        title="Raportet PPL"
        filtersConfig={filterConfigs}
        fetchData={fetchData}
        renderTable={(data) => (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex rounded-lg border border-neutral-800 bg-neutral-950 p-1">
                {GROUP_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setGroupBy(option.value);
                      setSort({ field: "", direction: "desc" });
                    }}
                    className={`rounded-md px-3 py-1.5 text-sm ${
                      groupBy === option.value
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {userRole === "admin" && (
                  <button
                    type="button"
                    onClick={() => exportReport("csv")}
                    disabled={exporting !== null}
                    className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {exporting === "csv"
                      ? "Duke eksportuar..."
                      : "Eksporto CSV"}
                  </button>
                )}
                <ColumnPicker
                  groupBy={groupBy}
                  brands={brands}
                  visible={visibleColumns}
                  onChange={updateVisibleColumns}
                />
              </div>
            </div>
            <PplTable
              rows={data}
              columns={columns}
              sort={(sort.field || report?.sort || "date") as PplSortField}
              direction={
                sort.field ? sort.direction : (report?.direction ?? "desc")
              }
              onSort={handleSort}
            />
            <PplSummary report={report} isLoading={isLoading} />
          </div>
        )}
        exportExcel={() => exportReport("xlsx")}
        user={user}
        userRole={userRole}
      />
    </div>
  );
};

export default ReportHeader;
