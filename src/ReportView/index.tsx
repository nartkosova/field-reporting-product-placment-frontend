import { useEffect, useState } from "react";
import podravkaFacingsService from "../Services/podravkaFacingsService";
import userService from "../Services/userService";
import storeServices from "../Services/storeServices";

const ReportView = () => {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [facings, setFacings] = useState([]);
  const [competitorColumns, setCompetitorColumns] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    user_id: "",
    store_id: "",
    category: "",
    report_date: "",
    date_range: "",
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

      const cats = Array.from(new Set(allFacings.map((f: any) => f.category)));
      setCategories(cats);

      const allCompetitorNames = new Set<string>();
      allFacings.forEach((f: any) => {
        const competitors = f.competitors || {};
        Object.keys(competitors).forEach((name) =>
          allCompetitorNames.add(name)
        );
      });
      setCompetitorColumns(Array.from(allCompetitorNames));
    };

    fetchInitialData();
  }, []);

  const formatDateISO = (date: string | Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDateRangeFilter = () => {
    const today = new Date();
    if (filters.date_range === "today") {
      return [formatDateISO(today), formatDateISO(today)];
    }
    if (filters.date_range === "week") {
      const pastWeek = new Date(today);
      pastWeek.setDate(today.getDate() - 7);
      return [formatDateISO(pastWeek), formatDateISO(today)];
    }
    if (filters.date_range === "month") {
      const pastMonth = new Date(today);
      pastMonth.setMonth(today.getMonth() - 1);
      return [formatDateISO(pastMonth), formatDateISO(today)];
    }
    if (filters.date_range === "3 months") {
      const past3Months = new Date(today);
      past3Months.setMonth(today.getMonth() - 3);
      return [formatDateISO(past3Months), formatDateISO(today)];
    }
  };

  const [startDate, endDate] = getDateRangeFilter() || ["", ""];

  const filteredFacings = facings.filter((f: any) => {
    const reportDate = formatDateISO(f.report_date);
    return (
      (!filters.user_id || String(f.user_id) === filters.user_id) &&
      (!filters.store_id || String(f.store_id) === filters.store_id) &&
      (!filters.category || f.category === filters.category) &&
      (!filters.report_date || reportDate === filters.report_date) &&
      (!filters.date_range ||
        (reportDate >= startDate && reportDate <= endDate))
    );
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Facings Overview</h2>

      <div className="flex gap-2 mb-4 flex-wrap">
        <select
          className="border p-2"
          value={filters.user_id}
          onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
        >
          <option value="">User</option>
          {users.map((u: any) => (
            <option key={u.user_id} value={u.user_id}>
              {u.user}
            </option>
          ))}
        </select>

        <select
          className="border p-2"
          value={filters.store_id}
          onChange={(e) => setFilters({ ...filters, store_id: e.target.value })}
        >
          <option value="">Store</option>
          {stores.map((s: any) => (
            <option key={s.store_id} value={s.store_id}>
              {s.store_name}
            </option>
          ))}
        </select>

        <select
          className="border p-2"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">Category</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border p-2"
          value={filters.report_date}
          onChange={(e) =>
            setFilters({ ...filters, report_date: e.target.value })
          }
        />

        <select
          className="border p-2"
          value={filters.date_range}
          onChange={(e) =>
            setFilters({ ...filters, date_range: e.target.value })
          }
        >
          <option value="">All time</option>
          <option value="today">Today</option>
          <option value="week">Past week</option>
          <option value="month">Past month</option>
          <option value="3 months">Past 3 months</option>
        </select>
      </div>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">User</th>
            <th className="border p-2">Store</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Podravka Facings</th>
            {competitorColumns.map((comp) => (
              <th key={comp} className="border p-2">
                {comp}
              </th>
            ))}
            <th className="border p-2">Total Competitor Facings</th>
            <th className="border p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredFacings.map((f: any, index: number) => {
            const competitors = f.competitors || {};
            const totalCompFacings = Object.values(competitors).reduce(
              (sum: number, val: any) => sum + Number(val),
              0
            );

            return (
              <tr key={index}>
                <td className="border p-2">{f.user}</td>
                <td className="border p-2">{f.store_name}</td>
                <td className="border p-2">{f.category}</td>
                <td className="border p-2">{f.total_facings}</td>
                {competitorColumns.map((comp) => (
                  <td key={comp} className="border p-2">
                    {competitors[comp] ?? 0}
                  </td>
                ))}
                <td className="border p-2">{totalCompFacings}</td>
                <td className="border p-2">
                  {new Date(f.report_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReportView;
