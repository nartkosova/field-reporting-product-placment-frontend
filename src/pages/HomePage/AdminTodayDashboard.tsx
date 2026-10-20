import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { REPORT_STALE_TIME } from "../../lib/queryClient";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  CHART_INK,
  SERIES,
  axisProps,
  formatNumber,
  formatPercent,
  tooltipStyles,
} from "../../components/Analytics/chartTheme";
import StatCard, { ShelfSplit } from "../../components/Analytics/StatCard";
import workDayService from "../../services/workDayService";
import { LiveState } from "../../types/attendanceInterface";
import { formatTime } from "../../utils/attendance";
import { getLocalDateIso } from "../../utils/utils";

// Today's view refreshes itself every 10 minutes while it is open.
const REFRESH_MS = 10 * 60 * 1000;

const STATE_LABELS: Record<LiveState, { label: string; className: string }> = {
  in_store: {
    label: "Në market",
    className: "bg-green-950 text-green-300 border-green-800",
  },
  on_road: {
    label: "Në rrugë",
    className: "bg-sky-950 text-sky-300 border-sky-800",
  },
  done: {
    label: "Mbaroi",
    className: "bg-neutral-800 text-neutral-300 border-neutral-700",
  },
  not_started: {
    label: "Pa filluar",
    className: "bg-amber-950 text-amber-300 border-amber-800",
  },
  missing: {
    label: "Pa ditë",
    className: "bg-red-950 text-red-300 border-red-800",
  },
  absence: {
    label: "Mungesë",
    className: "bg-neutral-900 text-neutral-400 border-neutral-700",
  },
};

// Problems first, then whoever is active, then the rest.
const STATE_ORDER: LiveState[] = [
  "missing",
  "not_started",
  "in_store",
  "on_road",
  "done",
  "absence",
];

const AdminTodayDashboard = () => {
  const [date, setDate] = useState(getLocalDateIso());
  const isToday = date === getLocalDateIso();

  // Today's numbers move while people work, so they refresh every 10 minutes.
  // Other days stay fresh for an hour and survive a page reload.
  const overviewQuery = useQuery({
    queryKey: ["day-overview", date],
    queryFn: () => workDayService.getDayOverview(date),
    staleTime: isToday ? REFRESH_MS : REPORT_STALE_TIME,
    refetchInterval: isToday ? REFRESH_MS : false,
    placeholderData: keepPreviousData,
    meta: { persist: true },
  });
  const data = overviewQuery.data ?? null;
  const error = overviewQuery.isError && !data;

  const previous = data?.previous_business;
  const business = data?.business;
  const isLoading = !data && !error;
  const people = [...(data?.people || [])].sort(
    (a, b) =>
      STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state) ||
      a.user.localeCompare(b.user),
  );
  const chartData = people
    .filter((person) => person.visit_count > 0)
    .map((person) => ({ user: person.user, Vizita: person.visit_count }));

  return (
    <section className="w-full mb-10 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Përmbledhja e ditës
          </h2>
          <p className="text-sm text-neutral-400">
            Orari {data?.expected_start ?? "08:00"}–
            {data?.expected_end ?? "16:00"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            max={getLocalDateIso()}
            onChange={(event) =>
              event.target.value && setDate(event.target.value)
            }
            className="border border-neutral-700 bg-neutral-900 text-white text-sm p-2 rounded-lg"
          />
          <Link
            to="/reports/work-days"
            className="text-sm text-neutral-300 hover:text-white underline-offset-4 hover:underline"
          >
            Raporti i plotë →
          </Link>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-300">
          Të dhënat nuk u ngarkuan. Provo përsëri.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="PPL të regjistruara"
          value={business?.ppl_batches}
          previous={previous?.ppl_batches}
          detail={
            business &&
            `${formatNumber(business.podravka_facings)} facings Podravka`
          }
          isLoading={isLoading}
        />
        <StatCard
          label="Pjesa e raftit Podravka"
          value={business?.podravka_share ?? null}
          previous={previous?.podravka_share ?? null}
          format={formatPercent}
          deltaUnit="pp"
          isLoading={isLoading}
        >
          {business && (
            <ShelfSplit
              podravka={business.podravka_facings}
              competitor={business.competitor_facings}
            />
          )}
        </StatCard>
        <StatCard
          label="Markete të mbuluara"
          value={business?.stores_covered}
          previous={previous?.stores_covered}
          isLoading={isLoading}
        />
        <StatCard
          label="Foto raporti"
          value={business?.photos}
          previous={previous?.photos}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="card-inset p-0 lg:col-span-3 overflow-x-auto">
          <table className="w-full text-sm text-white">
            <thead className="text-neutral-400 text-left">
              <tr className="border-b border-neutral-800">
                <th className="font-normal px-4 py-2">Punonjësi</th>
                <th className="font-normal px-4 py-2">Statusi</th>
                <th className="font-normal px-4 py-2">Orari</th>
                <th className="font-normal px-4 py-2 text-right">Vizita</th>
                <th className="font-normal px-4 py-2 text-right">Foto</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => (
                <tr
                  key={person.user_id}
                  className="border-b border-neutral-900 last:border-0"
                >
                  <td className="px-4 py-2 font-medium">{person.user}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-xs ${
                        STATE_LABELS[person.state].className
                      }`}
                    >
                      {STATE_LABELS[person.state].label}
                    </span>
                    {person.current_store && (
                      <span className="ml-2 text-xs text-neutral-400">
                        {person.current_store}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 tabular-nums text-neutral-300">
                    {person.check_in_at ? (
                      <>
                        <span className={person.late ? "text-amber-300" : ""}>
                          {formatTime(person.check_in_at)}
                        </span>
                        {" – "}
                        {formatTime(person.check_out_at)}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {person.visit_count}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {person.photo_count}
                  </td>
                </tr>
              ))}
              {data && !people.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-neutral-500"
                  >
                    Nuk ka punonjës.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card-inset lg:col-span-2">
          <p className="text-sm text-neutral-400 mb-3">Vizita në markete</p>
          {chartData.length ? (
            <ResponsiveContainer
              width="100%"
              height={Math.max(160, chartData.length * 36)}
            >
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid horizontal={false} stroke={CHART_INK.grid} />
                <XAxis type="number" allowDecimals={false} {...axisProps} />
                <YAxis
                  type="category"
                  dataKey="user"
                  width={90}
                  {...axisProps}
                />
                <Tooltip {...tooltipStyles} cursor={{ fill: "#ffffff0d" }} />
                <Bar
                  dataKey="Vizita"
                  fill={SERIES.podravka}
                  radius={[0, 4, 4, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-neutral-500 py-10 text-center">
              Ende asnjë vizitë.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminTodayDashboard;
