import { useEffect, useState } from "react";
import podravkaFacingsService from "../Services/podravkaFacingsService";
import userService from "../Services/userService";
import storeServices from "../Services/storeServices";
import Select from "react-select";
import ReportTable from "./ReportTable";

interface User {
  user_id: string | number;
  user: string;
}

interface Store {
  store_id: string | number;
  store_name: string;
}

interface Facing {
  user: string;
  user_id: number;
  store_name: string;
  store_id: number;
  category: string;
  total_facings: number;
  report_date: string;
  competitors: Record<string, number>;
}

interface FilterState {
  user_ids: string[];
  store_ids: string[];
  categories: string[];
  report_month: string[];
}

const monthOptions = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const ReportHeader = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [facings, setFacings] = useState<Facing[]>([]);
  const [competitorColumns, setCompetitorColumns] = useState<string[]>([]);

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
        storeServices.getAllStores(),
        podravkaFacingsService.getPodravkaFacingsWithCompetitors(),
      ]);

      setUsers(userList);
      setStores(storeList);
      setFacings(allFacings);

      const cats = Array.from(
        new Set<string>(allFacings.map((f: Facing) => f.category))
      );
      setCategories(cats);

      const allCompetitorNames = new Set<string>();
      allFacings.forEach((f: Facing) => {
        const competitors = f.competitors || {};
        Object.keys(competitors).forEach((name) =>
          allCompetitorNames.add(name)
        );
      });
      setCompetitorColumns(Array.from(allCompetitorNames));
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
    </div>
  );
};

export default ReportHeader;
