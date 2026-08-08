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

type FilterOption = { value: string; label: string };

const toDateInputValue = (value: Date) => {
  const localTime = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return localTime.toISOString().slice(0, 10);
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
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, { value: string; label: string }[]>
  >({});
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const normalizeSelected = (
    selected: FilterOption | readonly FilterOption[] | null
  ): FilterOption[] => {
    if (!selected) return [];
    if (Array.isArray(selected)) {
      return selected.map((item) => ({
        value: String(item.value),
        label: item.label,
      }));
    }

    const option = selected as FilterOption;
    return [
      {
        value: String(option.value),
        label: option.label,
      },
    ];
  };

  const debouncedFilters = useDebouncedValue(filters, 800);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const activeFilterCount =
    Object.values(filters).filter((value) => value.length > 0).length +
    (startDate ? 1 : 0) +
    (endDate ? 1 : 0);

  useEffect(() => {
    setPage(0);
  }, [debouncedFilters, startDate, endDate]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
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
      try {
        const res = await fetchData(pageSize, page * pageSize, query);
        setData(res.data);
        setTotal(res.total);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [debouncedFilters, startDate, endDate, page, pageSize, fetchData]);

  const setQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    setStartDate(start);
    setEndDate(end);
  };

  const clearAllFilters = () => {
    setFilters({});
    setSelectedOptions({});
    setStartDate(null);
    setEndDate(null);
    setPage(0);
    filtersConfig.forEach((filter) => {
      filter.onChange?.([], setFilters);
    });
  };

  return (
    <div className="py-4">
      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 shadow-lg">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="mt-1 text-sm text-neutral-400">
              {total} rezultate, {activeFilterCount} filtra aktive
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {dateNeeded && (
              <>
                <ActionButton onClick={() => setQuickRange(1)} variant="fut" scrollToTop={false}>
                  Sot
                </ActionButton>
                <ActionButton onClick={() => setQuickRange(7)} variant="fut" scrollToTop={false}>
                  7 ditet
                </ActionButton>
                <ActionButton onClick={() => setQuickRange(30)} variant="fut" scrollToTop={false}>
                  30 ditet
                </ActionButton>
              </>
            )}
            <ActionButton onClick={clearAllFilters} variant="secondary" scrollToTop={false}>
              Pastro filtrat
            </ActionButton>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
        {filtersConfig.map(
          ({ key, options, placeholder, className, onChange, isMulti = true }) => (
            <Select
              key={key}
              isMulti={isMulti}
              isClearable
              options={options}
              value={
                selectedOptions[key] ??
                (isMulti ? [] : null)
              }
              placeholder={placeholder}
              className={className ?? "min-w-[220px] flex-1"}
              styles={darkSelectStyles}
              closeMenuOnSelect={!isMulti}
              isSearchable
              onChange={(selected) => {
                const normalized = normalizeSelected(selected);

                setSelectedOptions((prev) => ({
                  ...prev,
                  [key]: normalized,
                }));

                setFilters((prev) => ({
                  ...prev,
                  [key]: normalized.map((s) => String(s.value)),
                }));

                if (onChange) {
                  onChange(normalized, setFilters);
                }
              }}
            />
          )
        )}
        {dateNeeded && (
          <div className="min-w-[280px] flex-1 rounded-xl border border-neutral-800 bg-black p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Data
            </p>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={([start, end]) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />
            {(startDate || endDate) && (
              <p className="mt-2 text-xs text-neutral-400">
                {startDate ? toDateInputValue(startDate) : "Pa fillim"} -{" "}
                {endDate ? toDateInputValue(endDate) : "Pa fund"}
              </p>
            )}
          </div>
        )}
      </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filtersConfig.map(({ key, placeholder }) =>
              (selectedOptions[key] ?? []).map((option) => (
                <span
                  key={`${key}-${option.value}`}
                  className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs text-neutral-200"
                >
                  {placeholder}: {option.label}
                </span>
              ))
            )}
            {startDate && (
              <span className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs text-neutral-200">
                Nga: {toDateInputValue(startDate)}
              </span>
            )}
            {endDate && (
              <span className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs text-neutral-200">
                Deri: {toDateInputValue(endDate)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4 text-sm text-white lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-neutral-300">
            Faqja {page + 1} nga {totalPages}
          </span>
          <span className="text-neutral-500">|</span>
          <span className="text-neutral-300">
            {total} rreshta gjithsej
          </span>
          {isLoading && (
            <>
              <span className="text-neutral-500">|</span>
              <span className="text-amber-300">Duke ngarkuar...</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span>
            {Math.min(page * pageSize + 1, total || 1)}-
            {Math.min((page + 1) * pageSize, total)} / {total || 0}
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
        (user?.user === "Ilir" ||
          user?.user === "Arjeta" ||
          user?.user === "Kushtrim") && (
          <div className="pt-6 flex gap-2">
            <ActionButton onClick={() => exportExcel(data)} variant="primary">
              Exporto në Excel
            </ActionButton>
          </div>
        )}
    </div>
  );
}
