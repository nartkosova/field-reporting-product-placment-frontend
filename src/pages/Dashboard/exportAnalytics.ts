import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  AnalyticsOverview,
  BreakdownRow,
  EmployeeBreakdownRow,
  Granularity,
  StoreCoverage,
  TimeseriesPoint,
} from "../../types/analyticsInterface";

interface ExportInput {
  range: { start: string; end: string };
  granularity: Granularity;
  overview: AnalyticsOverview | null;
  timeseries: TimeseriesPoint[];
  byEmployee: EmployeeBreakdownRow[];
  categories: BreakdownRow[];
  coverage: StoreCoverage | null;
}

const HEADER_FILL = "FF1F2937";

const styleHeader = (worksheet: ExcelJS.Worksheet) => {
  const header = worksheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: HEADER_FILL },
  };
  header.alignment = { vertical: "middle" };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
};

const autoWidth = (worksheet: ExcelJS.Worksheet) => {
  worksheet.columns.forEach((column) => {
    let longest = String(column.header ?? "").length;
    column.eachCell?.({ includeEmpty: false }, (cell) => {
      longest = Math.max(longest, String(cell.value ?? "").length);
    });
    column.width = Math.min(Math.max(longest + 2, 10), 42);
  });
};

/** Bold totals row appended under a numeric table. */
const addTotalsRow = (
  worksheet: ExcelJS.Worksheet,
  label: string,
  totals: Record<string, number>
) => {
  const row = worksheet.addRow({ ...totals, [worksheet.columns[0].key as string]: label });
  row.font = { bold: true };
  row.border = { top: { style: "thin", color: { argb: "FF9CA3AF" } } };
};

const sumBy = <T,>(rows: T[], pick: (row: T) => number) =>
  rows.reduce((total, row) => total + (pick(row) || 0), 0);

export const exportAnalyticsWorkbook = async ({
  range,
  granularity,
  overview,
  timeseries,
  byEmployee,
  categories,
  coverage,
}: ExportInput) => {
  const workbook = new ExcelJS.Workbook();
  workbook.created = new Date();

  // --- Summary -------------------------------------------------------------
  const summary = workbook.addWorksheet("Përmbledhje");
  summary.columns = [
    { header: "Treguesi", key: "metric" },
    { header: "Vlera", key: "value" },
  ];
  styleHeader(summary);

  summary.addRows([
    { metric: "Periudha", value: `${range.start} - ${range.end}` },
    { metric: "Grupimi", value: granularity },
    { metric: "Foto", value: overview?.photos ?? 0 },
    { metric: "Markete të vizituara", value: overview?.storesVisited ?? 0 },
    { metric: "Punëtorë aktivë", value: overview?.activeEmployees ?? 0 },
    { metric: "Facings Podravka", value: overview?.podravkaFacingsTotal ?? 0 },
    {
      metric: "Facings Konkurrenca",
      value: overview?.competitorFacingsTotal ?? 0,
    },
    {
      metric: "Share of shelf (%)",
      value:
        overview?.shareOfShelf === null || overview?.shareOfShelf === undefined
          ? "-"
          : Number(overview.shareOfShelf.toFixed(2)),
    },
    { metric: "Ditë pune", value: overview?.workDays ?? 0 },
    { metric: "Ditë mungese", value: overview?.absenceDays ?? 0 },
    { metric: "Kilometra", value: overview?.kilometersDriven ?? 0 },
    { metric: "Kosto karburanti", value: overview?.fuelCost ?? 0 },
    { metric: "Litra karburanti", value: overview?.fuelLiters ?? 0 },
    { metric: "Kosto tjera udhëtimi", value: overview?.otherTravelCost ?? 0 },
    { metric: "Markete gjithsej", value: coverage?.total ?? 0 },
    { metric: "Markete me aktivitet", value: coverage?.covered ?? 0 },
    { metric: "Markete pa aktivitet", value: coverage?.uncovered ?? 0 },
    {
      metric: "Mbulimi (%)",
      value:
        coverage?.coverageRate === null || coverage?.coverageRate === undefined
          ? "-"
          : Number(coverage.coverageRate.toFixed(2)),
    },
  ]);
  autoWidth(summary);

  // --- Timeseries ----------------------------------------------------------
  const trend = workbook.addWorksheet("Trendi");
  trend.columns = [
    { header: "Periudha", key: "bucket" },
    { header: "Foto", key: "photos" },
    { header: "Facings Podravka", key: "podravkaFacings" },
    { header: "Facings Konkurrenca", key: "competitorFacings" },
    { header: "Kilometra", key: "kilometersDriven" },
  ];
  styleHeader(trend);
  trend.addRows(timeseries);
  if (timeseries.length) {
    addTotalsRow(trend, "Totali", {
      photos: sumBy(timeseries, (r) => r.photos),
      podravkaFacings: sumBy(timeseries, (r) => r.podravkaFacings),
      competitorFacings: sumBy(timeseries, (r) => r.competitorFacings),
      kilometersDriven: sumBy(timeseries, (r) => r.kilometersDriven),
    });
  }
  autoWidth(trend);

  // --- Per employee --------------------------------------------------------
  const employees = workbook.addWorksheet("Sipas punëtorit");
  employees.columns = [
    { header: "Punëtori", key: "user" },
    { header: "Foto", key: "photos" },
    { header: "Facings Podravka", key: "podravkaFacingsTotal" },
    { header: "Facings Konkurrenca", key: "competitorFacingsTotal" },
    { header: "Markete", key: "storesVisited" },
    { header: "Ditë pune", key: "workDays" },
    { header: "Ditë mungese", key: "absenceDays" },
    { header: "Kilometra", key: "kilometersDriven" },
    { header: "Kosto karburanti", key: "fuelCost" },
  ];
  styleHeader(employees);
  employees.addRows(byEmployee);
  if (byEmployee.length) {
    addTotalsRow(employees, "Totali", {
      photos: sumBy(byEmployee, (r) => r.photos),
      podravkaFacingsTotal: sumBy(byEmployee, (r) => r.podravkaFacingsTotal),
      competitorFacingsTotal: sumBy(
        byEmployee,
        (r) => r.competitorFacingsTotal
      ),
      storesVisited: sumBy(byEmployee, (r) => r.storesVisited),
      workDays: sumBy(byEmployee, (r) => r.workDays),
      absenceDays: sumBy(byEmployee, (r) => r.absenceDays),
      kilometersDriven: sumBy(byEmployee, (r) => r.kilometersDriven),
      fuelCost: sumBy(byEmployee, (r) => r.fuelCost),
    });
  }
  autoWidth(employees);

  // --- Categories / quarters ----------------------------------------------
  const categorySheet = workbook.addWorksheet("Kategori-Kvartal");
  categorySheet.columns = [
    { header: "Kategoria / Kvartali", key: "label" },
    { header: "Foto", key: "value" },
  ];
  styleHeader(categorySheet);
  categorySheet.addRows(categories);
  if (categories.length) {
    addTotalsRow(categorySheet, "Totali", {
      value: sumBy(categories, (r) => r.value),
    });
  }
  autoWidth(categorySheet);

  // --- Store coverage ------------------------------------------------------
  const coverageSheet = workbook.addWorksheet("Mbulimi i marketeve");
  coverageSheet.columns = [
    { header: "Marketi", key: "store_name" },
    { header: "Shifra", key: "store_code" },
    { header: "Kategoria", key: "store_category" },
    { header: "Foto", key: "photo_count" },
    { header: "Facings", key: "facing_count" },
    { header: "Aktiviteti i fundit", key: "last_activity" },
  ];
  styleHeader(coverageSheet);
  coverageSheet.addRows(
    (coverage?.stores || []).map((store) => ({
      ...store,
      store_code: store.store_code ?? "-",
      store_category: store.store_category ?? "-",
      last_activity: store.last_activity ?? "Asnjëherë",
    }))
  );
  autoWidth(coverageSheet);

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer]),
    `analitika_${range.start}_${range.end}.xlsx`
  );
};
