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

const ReportHeader = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [facings, setFacings] = useState<Facing[]>([]);

  const [filters, setFilters] = useState<FilterState>({
    user_ids: [],
    store_ids: [],
    categories: [],
    report_month: [],
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const [userList, storeList, allFacings] = await Promise.all([
        userService.getAllUsers(),
        storeServices.getStoresWithUserId(),
        podravkaFacingsService.getPodravkaFacingsWithCompetitors(),
      ]);

      setUsers(userList);
      setStores(storeList);
      setFacings(allFacings);

      const cats = Array.from(
        new Set<string>(allFacings.map((f: Facing) => f.category))
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

  const formatDateISO = (date: string | Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getMonthRanges = (): [string, string][] => {
    const year = new Date().getFullYear();
    return filters.report_month.map((m) => {
      const monthIndex = parseInt(m, 10) - 1;
      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 0);
      return [formatDateISO(start), formatDateISO(end)];
    });
  };

  const monthRanges = getMonthRanges();

  const filteredFacings = facings.filter((f) => {
    const reportDate = formatDateISO(f.report_date);

    if (filters.report_month.length > 0) {
      const isInMonthRange = monthRanges.some(
        ([start, end]) => reportDate >= start && reportDate <= end
      );
      if (!isInMonthRange) return false;
    }

    return (
      (filters.user_ids.length === 0 ||
        filters.user_ids.includes(String(f.user_id))) &&
      (filters.store_ids.length === 0 ||
        filters.store_ids.includes(String(f.store_id))) &&
      (filters.categories.length === 0 ||
        filters.categories.includes(f.category))
    );
  });

  const competitorColumns = useMemo(() => {
    const names = new Set<string>();
    filteredFacings.forEach((f) => {
      Object.entries(f.competitors || {}).forEach(([brand, count]) => {
        if (Number(count) > 0) names.add(brand);
      });
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [filteredFacings]);

  const handleExportExcel = () => {
    const dataToExport = filteredFacings.map((row) => {
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
        Date: new Date(row.report_date).toLocaleDateString(),
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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Facings Overview</h2>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Select
          isMulti
          options={userOptions}
          placeholder="Select user(s)"
          value={userOptions.filter((opt) =>
            filters.user_ids.includes(opt.value)
          )}
          onChange={(selected) => {
            const ids = selected?.map((s) => String(s.value)) ?? [];
            setFilters((prev) => ({ ...prev, user_ids: ids }));
          }}
        />

        <Select
          className="md:w-1/2 w-full"
          isMulti
          options={storeOptions}
          placeholder="Select store(s)"
          value={storeOptions.filter((opt) =>
            filters.store_ids.includes(opt.value)
          )}
          onChange={(selected) => {
            const ids = selected?.map((s) => String(s.value)) ?? [];
            setFilters((prev) => ({ ...prev, store_ids: ids }));
          }}
        />

        <Select
          isMulti
          options={categoryOptions}
          placeholder="Select category(s)"
          value={categoryOptions.filter((opt) =>
            filters.categories.includes(opt.value)
          )}
          onChange={(selected) => {
            const cats = selected?.map((s) => String(s.value)) ?? [];
            setFilters((prev) => ({ ...prev, categories: cats }));
          }}
        />

        <Select
          isMulti
          options={monthOptions}
          placeholder="Select month(s)"
          value={monthOptions.filter((opt) =>
            filters.report_month.includes(opt.value)
          )}
          onChange={(selected) => {
            const months = selected?.map((opt) => opt.value) ?? [];
            setFilters((prev) => ({ ...prev, report_month: months }));
          }}
          isClearable
        />
      </div>

      <ReportTable
        data={filteredFacings}
        competitorColumns={competitorColumns}
      />

      <div className="pt-6 flex gap-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
          onClick={handleExportExcel}
        >
          Exporto ne Excel
        </button>
      </div>
      <ReportChart data={filteredFacings} />
    </div>
  );
};

export default ReportHeader;
