/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import podravkaFacingsService from "../../services/podravkaFacingsService";
import userService from "../../services/userService";
import storeServices from "../../services/storeServices";
import Select from "react-select";
import ReportTable from "./ReportTable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { User, Store, Facing, FilterState } from "../../types/reportInterface";
import { monthOptions } from "../../utils/monthOptions";
import ReportChart from "./ReportChart";
import ActionButton from "../../components/Buttons/ActionButtons";

const ReportHeader = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [facings, setFacings] = useState<Facing[]>([]);
  const [totalFacings, setTotalFacings] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<FilterState>({
    user_ids: [],
    store_ids: [],
    categories: [],
    report_month: [],
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const [userList, storeList, facingsResponse] = await Promise.all([
        userService.getAllUsers(),
        storeServices.getStoresWithUserId(),
        podravkaFacingsService.getPodravkaFacingsWithCompetitors({}, 10, 0),
      ]);

      setUsers(userList);
      setStores(storeList);
      setFacings(facingsResponse.data);

      const cats = Array.from(
        new Set<string>(facingsResponse.data.map((f: Facing) => f.category))
      );
      setCategories(cats);
    };

    fetchInitialData();
  }, []);

  const userOptions = users.map((u) => ({
    value: String(u.user_id),
    label: u.user,
  }));

  const storeOptions = stores.map((s) => ({
    value: String(s.store_id),
    label: s.store_name,
  }));

  const categoryOptions = categories.map((c) => ({
    value: c,
    label: c,
  }));

  // const formatDateISO = (date: string | Date) => {
  //   const d = new Date(date);
  //   const year = d.getFullYear();
  //   const month = String(d.getMonth() + 1).padStart(2, "0");
  //   const day = String(d.getDate()).padStart(2, "0");
  //   return `${year}-${month}-${day}`;
  // };

  // const getMonthRanges = (): [string, string][] => {
  //   const year = new Date().getFullYear();
  //   return filters.report_month.map((m) => {
  //     const monthIndex = parseInt(m, 10) - 1;
  //     const start = new Date(year, monthIndex, 1);
  //     const end = new Date(year, monthIndex + 1, 0);
  //     return [formatDateISO(start), formatDateISO(end)];
  //   });
  // };

  // const monthRanges = getMonthRanges();

  const filterConfigs = [
    {
      key: "user_ids",
      options: userOptions,
      placeholder: "Select user(s)",
    },
    {
      key: "store_ids",
      options: storeOptions,
      placeholder: "Select store(s)",
      className: "md:w-1/2 w-full",
    },
    {
      key: "categories",
      options: categoryOptions,
      placeholder: "Select category(s)",
    },
    {
      key: "report_month",
      options: monthOptions,
      placeholder: "Select month(s)",
      isClearable: true,
    },
  ];

  const darkSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: "#18181b",
      borderColor: "#27272a",
      color: "#fff",
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "#18181b",
      color: "#fff",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#27272a"
        : state.isFocused
        ? "#27272a"
        : "#18181b",
      color: "#fff",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#fff",
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "#27272a",
      color: "#fff",
    }),
    input: (provided: any) => ({
      ...provided,
      color: "#fff",
    }),
  };

  const competitorColumns = useMemo(() => {
    const names = new Set<string>();
    facings.forEach((f) => {
      Object.entries(f.competitors || {}).forEach(([brand, count]) => {
        if (Number(count) > 0) names.add(brand);
      });
    });
    return Array.from(names);
  }, [facings]);

  useEffect(() => {
    const fetchData = async () => {
      const filterParams: Record<string, string | string[]> = {};

      if (filters.user_ids.length > 0) {
        filterParams.user_id = filters.user_ids;
      }
      if (filters.store_ids.length > 0) {
        filterParams.store_id = filters.store_ids;
      }
      if (filters.categories.length > 0) {
        filterParams.category = filters.categories;
      }
      if (filters.report_month.length > 0) {
        const year = new Date().getFullYear();
        const monthIndex = parseInt(filters.report_month[0], 10) - 1;
        const start = new Date(year, monthIndex, 1);
        const end = new Date(year, monthIndex + 1, 0);

        filterParams.start_date = start.toISOString().split("T")[0];
        filterParams.end_date = end.toISOString().split("T")[0];
      }

      const res =
        await podravkaFacingsService.getPodravkaFacingsWithCompetitors(
          filterParams,
          pageSize,
          page * pageSize
        );

      setFacings(res.data);
      setTotalFacings(res.total);
    };

    fetchData();
  }, [filters, page, pageSize]);

  const handleExportExcel = () => {
    const dataToExport = facings.map((row) => {
      const competitors = competitorColumns.reduce((acc, brand) => {
        acc[brand] = row.competitors[brand] ?? 0;
        return acc;
      }, {} as Record<string, number>);

      return {
        User: row.user,
        Store: row.store_name,
        Category: row.category,
        "Podravka Facings": row.total_facings,
        ...competitors,
        "Total Competitor Facings": Object.values(row.competitors).reduce(
          (sum, val) => sum + Number(val),
          0
        ),
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
    <div>
      <h2 className="text-2xl font-bold mb-4 text-white">Facings Overview</h2>

      <div className="flex gap-2 mb-4 flex-wrap">
        {filterConfigs.map(
          ({
            key,
            options,
            placeholder,
            className = "",
            isClearable = false,
          }) => (
            <Select
              key={key}
              isMulti
              isClearable={isClearable}
              options={options}
              placeholder={placeholder}
              className={className}
              value={options.filter((opt) =>
                filters[key as keyof typeof filters].includes(opt.value)
              )}
              onChange={(selected) => {
                const values = selected?.map((s) => String(s.value)) ?? [];
                setFilters((prev) => ({ ...prev, [key]: values }));
              }}
              styles={darkSelectStyles}
            />
          )
        )}
      </div>
      <div className="flex justify-between items-center mt-4 text-sm mb-4 text-white">
        <div className="flex items-center gap-2">
          <span>
            Page {page + 1} of {Math.ceil(totalFacings / pageSize) || 1}
          </span>

          <ActionButton
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            variant="fut"
          >
            Prev
          </ActionButton>

          <ActionButton
            onClick={() =>
              setPage((p) => ((p + 1) * pageSize < totalFacings ? p + 1 : p))
            }
            disabled={(page + 1) * pageSize >= totalFacings}
            variant="fut"
          >
            Next
          </ActionButton>
        </div>

        <div className="flex items-center gap-2">
          <label>Rows per page:</label>
          <select
            className="border border-neutral-800 rounded p-1 bg-neutral-900 text-white"
            value={pageSize}
            onChange={(e) => {
              setPage(0);
              setPageSize(Number(e.target.value));
            }}
          >
            {[10, 25, 50, 100].map((s) => (
              <option key={s} value={s} className="bg-neutral-900 text-white">
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ReportTable data={facings} competitorColumns={competitorColumns} />

      <div className="pt-6 flex gap-2">
        <ActionButton onClick={handleExportExcel} variant="fut">
          Exporto ne Excel
        </ActionButton>
      </div>
      <ReportChart data={facings} />
    </div>
  );
};

export default ReportHeader;
