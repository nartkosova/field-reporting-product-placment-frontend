import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Select from "react-select";
import analyticsService from "../../services/analyticsService";
import userService from "../../services/userService";
import {
  AnalyticsFilterParams,
  AnalyticsOverview,
  BreakdownRow,
  EmployeeBreakdownRow,
  Granularity,
  StoreCoverage,
  TimeseriesPoint,
} from "../../types/analyticsInterface";
import { User } from "../../types/reportInterface";
import KpiTile from "../../components/Analytics/KpiTile";
import {
  axisProps,
  CHART_INK,
  formatNumber,
  formatPercent,
  SERIES,
  tooltipStyles,
} from "../../components/Analytics/chartTheme";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import ActionButton from "../../components/Buttons/ActionButtons";
import darkSelectStyles from "../../utils/darkSelectStyles";
import { useUser } from "../../hooks/useUser";
import { getLocalDateIso } from "../../utils/utils";
import { getCurrentQuarter } from "../../types/photoInterface";
import { exportAnalyticsWorkbook } from "./exportAnalytics";

type PresetKey =
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "last_quarter"
  | "ytd";

const startOfQuarter = (year: number, quarter: number) =>
  new Date(year, (quarter - 1) * 3, 1);

const buildPreset = (
  key: PresetKey
): { start: string; end: string; granularity: Granularity } => {
  const now = new Date();
  const { year, quarter } = getCurrentQuarter(now);

  switch (key) {
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        start: getLocalDateIso(start),
        end: getLocalDateIso(end),
        granularity: "day",
      };
    }
    case "this_quarter": {
      return {
        start: getLocalDateIso(startOfQuarter(year, quarter)),
        end: getLocalDateIso(now),
        granularity: "week",
      };
    }
    case "last_quarter": {
      const absolute = year * 4 + (quarter - 1) - 1;
      const prevYear = Math.floor(absolute / 4);
      const prevQuarter = (absolute % 4) + 1;
      const start = startOfQuarter(prevYear, prevQuarter);
      const end = new Date(prevYear, prevQuarter * 3, 0);
      return {
        start: getLocalDateIso(start),
        end: getLocalDateIso(end),
        granularity: "week",
      };
    }
    case "ytd": {
      return {
        start: getLocalDateIso(new Date(now.getFullYear(), 0, 1)),
        end: getLocalDateIso(now),
        granularity: "month",
      };
    }
    default: {
      return {
        start: getLocalDateIso(new Date(now.getFullYear(), now.getMonth(), 1)),
        end: getLocalDateIso(now),
        granularity: "day",
      };
    }
  }
};

const PRESET_OPTIONS: { value: PresetKey; label: string }[] = [
  { value: "this_month", label: "Ky muaj" },
  { value: "last_month", label: "Muaji i kaluar" },
  { value: "this_quarter", label: "Ky kvartal" },
  { value: "last_quarter", label: "Kvartali i kaluar" },
  { value: "ytd", label: "Nga fillimi i vitit" },
];

const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: "day", label: "Ditore" },
  { value: "week", label: "Javore" },
  { value: "month", label: "Mujore" },
  { value: "quarter", label: "Kvartale" },
];

const sectionClass =
  "w-full bg-neutral-900 p-5 border border-neutral-800 rounded-2xl shadow-lg space-y-4";

const Dashboard = () => {
  const { userRole } = useUser();
  const isAdmin = userRole === "admin";

  const [preset, setPreset] = useState<PresetKey>("this_quarter");
  const [granularity, setGranularity] = useState<Granularity>("week");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [byEmployee, setByEmployee] = useState<EmployeeBreakdownRow[]>([]);
  const [categories, setCategories] = useState<BreakdownRow[]>([]);
  const [coverage, setCoverage] = useState<StoreCoverage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const range = useMemo(() => buildPreset(preset), [preset]);

  const filters: AnalyticsFilterParams = useMemo(
    () => ({
      start_date: range.start,
      end_date: range.end,
      granularity,
      ...(selectedUsers.length ? { user_ids: selectedUsers } : {}),
    }),
    [range.start, range.end, granularity, selectedUsers]
  );

  // The preset carries a sensible bucket size; changing it explicitly afterwards
  // must still win, so this only fires when the preset itself changes.
  useEffect(() => {
    setGranularity(buildPreset(preset).granularity);
  }, [preset]);

  useEffect(() => {
    if (!isAdmin) return;

    userService
      .getAllUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [isAdmin]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        overviewRes,
        timeseriesRes,
        employeeRes,
        categoryRes,
        coverageRes,
      ] = await Promise.all([
        analyticsService.getOverview(filters),
        analyticsService.getTimeseries(filters),
        analyticsService.getByEmployee(filters),
        analyticsService.getPhotoCategories(filters),
        analyticsService.getStoreCoverage(filters),
      ]);

      setOverview(overviewRes);
      setTimeseries(timeseriesRes);
      setByEmployee(employeeRes);
      setCategories(categoryRes);
      setCoverage(coverageRes);
    } catch (err) {
      console.error("Error loading analytics:", err);
      setError("Nuk u ngarkuan të dhënat analitike. Provo përsëri.");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const topCategories = useMemo(() => categories.slice(0, 12), [categories]);

  const employeeChartData = useMemo(
    () =>
      byEmployee
        .slice(0, 12)
        .map((row) => ({ name: row.user, photos: row.photos })),
    [byEmployee]
  );

  const handleExport = () =>
    exportAnalyticsWorkbook({
      range,
      granularity,
      overview,
      timeseries,
      byEmployee,
      categories,
      coverage,
    });

  return (
    <div className="w-full flex flex-col items-center bg-black py-6">
      <div className="w-full max-w-6xl flex flex-col gap-6 px-3">
        <div className={sectionClass}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Paneli Analitik</h1>
              <p className="text-sm text-neutral-400">
                {range.start} - {range.end}
              </p>
            </div>
            <ActionButton onClick={handleExport} className="h-[42px]">
              Eksporto Excel
            </ActionButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-sm text-gray-300">Periudha</label>
              <Select
                options={PRESET_OPTIONS}
                value={PRESET_OPTIONS.find((o) => o.value === preset)}
                onChange={(selected) =>
                  setPreset((selected?.value as PresetKey) || "this_quarter")
                }
                isClearable={false}
                isSearchable={false}
                styles={darkSelectStyles}
                classNamePrefix="react-select"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-300">Grupimi</label>
              <Select
                options={GRANULARITY_OPTIONS}
                value={GRANULARITY_OPTIONS.find((o) => o.value === granularity)}
                onChange={(selected) =>
                  setGranularity((selected?.value as Granularity) || "week")
                }
                isClearable={false}
                isSearchable={false}
                styles={darkSelectStyles}
                classNamePrefix="react-select"
              />
            </div>

            {isAdmin && (
              <div className="space-y-1">
                <label className="text-sm text-gray-300">Punëtorët</label>
                <Select
                  isMulti
                  options={users.map((u) => ({
                    value: String(u.user_id),
                    label: u.user,
                  }))}
                  onChange={(selected) =>
                    setSelectedUsers(
                      (selected || []).map((option) => option.value)
                    )
                  }
                  placeholder="Të gjithë"
                  styles={darkSelectStyles}
                  classNamePrefix="react-select"
                />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="w-full rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiTile
            label="Foto"
            value={formatNumber(overview?.photos)}
            isLoading={isLoading}
          />
          <KpiTile
            label="Markete të vizituara"
            value={formatNumber(overview?.storesVisited)}
            hint={
              coverage
                ? `${coverage.covered}/${coverage.total} mbulim`
                : undefined
            }
            isLoading={isLoading}
          />
          <KpiTile
            label="Share of shelf"
            value={formatPercent(overview?.shareOfShelf)}
            hint="Podravka ndaj totalit"
            accent={SERIES.podravka}
            isLoading={isLoading}
          />
          <KpiTile
            label="Mbulimi i marketeve"
            value={formatPercent(coverage?.coverageRate)}
            hint={coverage ? `${coverage.uncovered} pa aktivitet` : undefined}
            isLoading={isLoading}
          />
          <KpiTile
            label="Ditë pune"
            value={formatNumber(overview?.workDays)}
            hint={
              overview ? `${overview.absenceDays} ditë mungesë` : undefined
            }
            isLoading={isLoading}
          />
          <KpiTile
            label="Kilometra"
            value={formatNumber(overview?.kilometersDriven)}
            isLoading={isLoading}
          />
          <KpiTile
            label="Kosto karburanti"
            value={formatNumber(overview?.fuelCost)}
            hint={
              overview ? `${formatNumber(overview.fuelLiters)} litra` : undefined
            }
            isLoading={isLoading}
          />
          <KpiTile
            label="Facings (Podravka)"
            value={formatNumber(overview?.podravkaFacingsTotal)}
            accent={SERIES.podravka}
            isLoading={isLoading}
          />
        </div>

        {isLoading && (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="sm" text="Duke ngarkuar analitikën..." />
          </div>
        )}

        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-white">
            Facings me kalimin e kohës
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeseries} margin={{ left: 4, right: 12, top: 8 }}>
                <CartesianGrid stroke={CHART_INK.grid} vertical={false} />
                <XAxis dataKey="bucket" {...axisProps} />
                <YAxis {...axisProps} width={56} />
                <Tooltip {...tooltipStyles} />
                <Legend wrapperStyle={{ color: CHART_INK.secondary }} />
                <Line
                  type="monotone"
                  dataKey="podravkaFacings"
                  name="Podravka"
                  stroke={SERIES.podravka}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="competitorFacings"
                  name="Konkurrenca"
                  stroke={SERIES.competitor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={sectionClass}>
            {/* Single series: the title names it, so no legend box. */}
            <h2 className="text-lg font-semibold text-white">Foto të ngarkuara</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeseries} margin={{ left: 4, right: 12, top: 8 }}>
                  <CartesianGrid stroke={CHART_INK.grid} vertical={false} />
                  <XAxis dataKey="bucket" {...axisProps} />
                  <YAxis {...axisProps} width={48} />
                  <Tooltip {...tooltipStyles} cursor={{ fill: "#ffffff10" }} />
                  <Bar
                    dataKey="photos"
                    name="Foto"
                    fill={SERIES.podravka}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={sectionClass}>
            <h2 className="text-lg font-semibold text-white">
              Foto sipas punëtorit
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={employeeChartData}
                  layout="vertical"
                  margin={{ left: 12, right: 16, top: 8 }}
                >
                  <CartesianGrid stroke={CHART_INK.grid} horizontal={false} />
                  <XAxis type="number" {...axisProps} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    {...axisProps}
                  />
                  <Tooltip {...tooltipStyles} cursor={{ fill: "#ffffff10" }} />
                  <Bar
                    dataKey="photos"
                    name="Foto"
                    fill={SERIES.aqua}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-white">
            Foto sipas kategorisë / kvartalit
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topCategories}
                layout="vertical"
                margin={{ left: 12, right: 16, top: 8 }}
              >
                <CartesianGrid stroke={CHART_INK.grid} horizontal={false} />
                <XAxis type="number" {...axisProps} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={130}
                  {...axisProps}
                />
                <Tooltip {...tooltipStyles} cursor={{ fill: "#ffffff10" }} />
                <Bar
                  dataKey="value"
                  name="Foto"
                  fill={SERIES.yellow}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="text-lg font-semibold text-white">
            Markete pa aktivitet
          </h2>
          <p className="text-sm text-neutral-400">
            Markete pa asnjë foto apo facing në periudhën e zgjedhur.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-neutral-300">
              <thead className="text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-2 pr-4">Marketi</th>
                  <th className="py-2 pr-4">Shifra</th>
                  <th className="py-2 pr-4">Kategoria</th>
                  <th className="py-2 pr-4 text-right">Foto</th>
                  <th className="py-2 pr-4 text-right">Facings</th>
                  <th className="py-2 text-right">Aktiviteti i fundit</th>
                </tr>
              </thead>
              <tbody>
                {(coverage?.stores || [])
                  .filter(
                    (store) =>
                      store.photo_count === 0 && store.facing_count === 0
                  )
                  .slice(0, 25)
                  .map((store) => (
                    <tr
                      key={store.store_id}
                      className="border-b border-neutral-900"
                    >
                      <td className="py-2 pr-4 text-white">
                        {store.store_name}
                      </td>
                      <td className="py-2 pr-4">{store.store_code ?? "-"}</td>
                      <td className="py-2 pr-4">
                        {store.store_category ?? "-"}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums">
                        {store.photo_count}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums">
                        {store.facing_count}
                      </td>
                      <td className="py-2 text-right">
                        {store.last_activity ?? "Asnjëherë"}
                      </td>
                    </tr>
                  ))}
                {!isLoading && coverage && coverage.uncovered === 0 && (
                  <tr>
                    <td colSpan={6} className="py-3 text-neutral-400">
                      Të gjitha marketet kanë aktivitet në këtë periudhë.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
