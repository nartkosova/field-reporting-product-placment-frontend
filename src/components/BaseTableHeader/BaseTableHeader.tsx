import ActionButton from "../Buttons/ActionButtons";
import DateRangePicker from "../DateRangePicker/DateRangePicker";
import Select from "react-select";
import { useEffect, useState } from "react";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import darkSelectStyles from "../../utils/darkSelectStyles";
type GenericReportHeaderProps<T> = {
  title: string;
  filtersConfig: {
    key: string;
    options: { value: string; label: string }[];
    placeholder: string;
    className?: string;
    isMulti?: boolean;
    onChange?: (
      selected: { value: string; label: string }[],
      updateFilters: React.Dispatch<
        React.SetStateAction<Record<string, string[]>>
      >
    ) => void;
  }[];
  fetchData: (
    pageSize: number,
    offset: number,
    filters: Record<
      string,
      string | number | boolean | string[] | number[] | boolean[]
    >
  ) => Promise<{ data: T[]; total: number }>;
  renderTable: (
    data: T[],
    filters: Record<string, string | string[]>
  ) => React.ReactNode;
  exportExcel?: (data: T[]) => void;
  dateNeeded?: boolean;
  user?: { user?: string; user_id?: number } | null;
  userRole?: string | null;
};

export default function GenericReportHeader<T>({
  title,
  filtersConfig,
  fetchData,
  renderTable,
  exportExcel,
  dateNeeded = true,
  user,
  userRole,
}: GenericReportHeaderProps<T>) {
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const debouncedFilters = useDebouncedValue(filters, 800);

  useEffect(() => {
    const load = async () => {
      const query: Record<
        string,
        string | number | boolean | string[] | number[] | boolean[]
      > = {
        ...debouncedFilters,
        ...(startDate
          ? { start_date: startDate.toISOString().split("T")[0] }
          : {}),
        ...(endDate ? { end_date: endDate.toISOString().split("T")[0] } : {}),
      };
      const res = await fetchData(pageSize, page * pageSize, query);
      setData(res.data);
      setTotal(res.total);
    };
    load();
  }, [debouncedFilters, startDate, endDate, page, pageSize, fetchData]);

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>

      <div className="flex gap-2 mb-4 flex-wrap">
        {filtersConfig.map(
          ({ key, options, placeholder, className, onChange }) => (
            <Select
              key={key}
              isMulti
              isClearable
              options={options}
              placeholder={placeholder}
              className={className}
              styles={darkSelectStyles}
              closeMenuOnSelect={false}
              onChange={(selected) => {
                setFilters((prev) => ({
                  ...prev,
                  [key]: selected?.map((s) => String(s.value)) ?? [],
                }));

                if (onChange) {
                  onChange(Array.from(selected ?? []), setFilters);
                }
              }}
            />
          )
        )}
        {dateNeeded && (
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={([start, end]) => {
              setStartDate(start);
              setEndDate(end);
            }}
          />
        )}
      </div>

      <div className="flex justify-between items-center mt-4 text-sm mb-4 text-white">
        <div className="flex items-center gap-2">
          <span>
            {page + 1} / {Math.ceil(total / pageSize) || 1}
          </span>
          <ActionButton
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            variant="fut"
            scrollToTop={false}
          >
            Prev
          </ActionButton>
          <ActionButton
            onClick={() =>
              setPage((p) => ((p + 1) * pageSize < total ? p + 1 : p))
            }
            disabled={(page + 1) * pageSize >= total}
            variant="fut"
            scrollToTop={false}
          >
            Next
          </ActionButton>

          <label>Rreshtat për faqe:</label>
          <select
            className="border border-neutral-800 rounded p-1 bg-neutral-900 text-white"
            value={pageSize}
            onChange={(e) => {
              setPage(0);
              setPageSize(Number(e.target.value));
            }}
          >
            {[10, 25, 50, 100, 300].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {renderTable(data, {
        ...debouncedFilters,
        ...(startDate
          ? { start_date: startDate.toISOString().split("T")[0] }
          : {}),
        ...(endDate ? { end_date: endDate.toISOString().split("T")[0] } : {}),
      })}

      {exportExcel &&
        userRole === "admin" &&
        (user?.user === "Ilir" || user?.user === "Arjeta") && (
          <div className="pt-6 flex gap-2">
            <ActionButton onClick={() => exportExcel(data)} variant="primary">
              Exporto në Excel
            </ActionButton>
          </div>
        )}
    </div>
  );
}
