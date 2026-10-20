import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatCard, { ShelfSplit } from "../../components/Analytics/StatCard";
import {
  CHART_INK,
  SERIES,
  axisProps,
  formatNumber,
  formatPercent,
  tooltipStyles,
} from "../../components/Analytics/chartTheme";
import { PplReportResponse } from "../../types/pplReportInterface";

const shortDate = (date: string) => {
  const [, month, day] = date.split("-");
  return `${day}.${month}`;
};

const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="card-inset">
    <p className="text-sm text-neutral-400 mb-3">{title}</p>
    {children}
  </div>
);

const Empty = () => (
  <p className="text-sm text-neutral-500 py-12 text-center">Nuk ka të dhëna.</p>
);

const PplSummary = ({
  report,
  isLoading,
}: {
  report: PplReportResponse | null;
  isLoading: boolean;
}) => {
  const summary = report?.summary;
  const previous = report?.previous_summary;
  const charts = report?.charts;
  const deltaTitle = report?.previous_range
    ? `Krahasuar me ${report.previous_range.start} – ${report.previous_range.end}`
    : undefined;
  // Without a date range there is no previous period to compare with.
  const prev = <K extends keyof NonNullable<typeof previous>>(key: K) =>
    previous ? previous[key] : undefined;

  const topBrands = (charts?.brands || []).slice(0, 8);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Pjesa e raftit Podravka"
          value={summary?.share ?? null}
          previous={prev("share")}
          format={formatPercent}
          deltaUnit="pp"
          deltaTitle={deltaTitle}
          isLoading={isLoading && !report}
        >
          {summary && (
            <ShelfSplit
              podravka={summary.podravka}
              competitor={summary.competitor}
            />
          )}
        </StatCard>
        <StatCard
          label="Facings Podravka"
          value={summary?.podravka}
          previous={prev("podravka")}
          deltaTitle={deltaTitle}
          isLoading={isLoading && !report}
        />
        <StatCard
          label="Facings konkurrenca"
          value={summary?.competitor}
          previous={prev("competitor")}
          deltaTitle={deltaTitle}
          isLoading={isLoading && !report}
        />
        <StatCard
          label="PPL të regjistruara"
          value={summary?.entries}
          previous={prev("entries")}
          deltaTitle={deltaTitle}
          detail={
            summary &&
            `${formatNumber(summary.stores)} markete · ${formatNumber(summary.reporters)} raportues`
          }
          isLoading={isLoading && !report}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ChartCard title="Pjesa e raftit sipas ditës">
          {charts && charts.trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={charts.trend}
                margin={{ left: -12, right: 8, top: 4 }}
              >
                <CartesianGrid vertical={false} stroke={CHART_INK.grid} />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  {...axisProps}
                />
                <YAxis domain={[0, 100]} unit="%" {...axisProps} />
                <Tooltip
                  {...tooltipStyles}
                  labelFormatter={(label) => String(label)}
                  formatter={(value) => [
                    formatPercent(Number(value)),
                    "Podravka",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="share"
                  stroke={SERIES.podravka}
                  strokeWidth={2}
                  dot={charts.trend.length < 20}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Empty />
          )}
        </ChartCard>

        <ChartCard title="Markat sipas facings">
          {topBrands.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height={Math.max(220, topBrands.length * 28)}
            >
              <BarChart
                data={topBrands}
                layout="vertical"
                margin={{ left: 0, right: 12 }}
              >
                <CartesianGrid horizontal={false} stroke={CHART_INK.grid} />
                <XAxis type="number" allowDecimals={false} {...axisProps} />
                <YAxis
                  type="category"
                  dataKey="brand"
                  width={90}
                  {...axisProps}
                />
                <Tooltip
                  {...tooltipStyles}
                  cursor={{ fill: "#ffffff0d" }}
                  formatter={(value) => [
                    formatNumber(Number(value)),
                    "Facings",
                  ]}
                />
                <Bar dataKey="facings" radius={[0, 4, 4, 0]} barSize={16}>
                  {topBrands.map((item) => (
                    <Cell
                      key={item.brand}
                      fill={
                        item.is_podravka ? SERIES.podravka : SERIES.competitor
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty />
          )}
        </ChartCard>

        <ChartCard title="Pjesa e raftit sipas kategorisë">
          {charts && charts.categories.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height={Math.max(220, charts.categories.length * 28)}
            >
              <BarChart
                data={charts.categories}
                layout="vertical"
                margin={{ left: 0, right: 12 }}
              >
                <CartesianGrid horizontal={false} stroke={CHART_INK.grid} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  unit="%"
                  {...axisProps}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={90}
                  {...axisProps}
                />
                <Tooltip
                  {...tooltipStyles}
                  cursor={{ fill: "#ffffff0d" }}
                  formatter={(value) => [
                    formatPercent(Number(value)),
                    "Podravka",
                  ]}
                />
                <Bar
                  dataKey="share"
                  fill={SERIES.podravka}
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty />
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default PplSummary;
