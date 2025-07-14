import { useMemo } from "react";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "../../components/BaseTable/BaseTable";
import { getFacingTotals } from "../../utils/getFacingTotals";

export interface FacingTable {
  user: string;
  store_name: string;
  category: string;
  business_unit: string;
  total_facings: number;
  created_at: string;
  competitors: Record<string, number>;
  user_id: number;
  store_id: number;
}

interface Props {
  data: FacingTable[];
  competitorColumns: string[];
}

const columnHelper = createColumnHelper<FacingTable>();

const FacingsTable = ({ data, competitorColumns }: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<FacingTable, any>[] = useMemo(() => {
    const hasData = (key: keyof FacingTable) =>
      data.some(
        (f) => f[key] !== null && f[key] !== undefined && f[key] !== ""
      );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cols: ColumnDef<FacingTable, any>[] = [];

    if (hasData("business_unit")) {
      cols.push(
        columnHelper.accessor("business_unit", {
          header: "Business Unit",
          cell: (info) => info.getValue() || "",
        })
      );
    }

    if (hasData("category")) {
      cols.push(
        columnHelper.accessor("category", {
          header: "Kategorija",
        })
      );
    }

    if (hasData("user")) {
      cols.push(
        columnHelper.accessor("user", {
          header: "Reporter",
        })
      );
    }

    if (hasData("store_name")) {
      cols.push(
        columnHelper.accessor("store_name", {
          header: "Store",
        })
      );
    }

    cols.push(
      columnHelper.accessor("total_facings", {
        id: "total_facings",
        header: "Podravka Facings",
        cell: (info) => {
          const row = info.row.original;
          const podravka = Number(row.total_facings);
          const competitor = Object.values(row.competitors || {}).reduce(
            (sum, val) => sum + Number(val),
            0
          );
          const total = podravka + competitor;
          const percent = total === 0 ? 0 : (podravka / total) * 100;
          return `${podravka} (${percent.toFixed(1)}%)`;
        },
      })
    );

    cols.push(
      ...competitorColumns.map((comp) =>
        columnHelper.accessor((row) => row.competitors?.[comp] ?? 0, {
          header: comp,
          id: comp,
          cell: (info) => {
            const row = info.row.original;
            const compCount = Number(row.competitors?.[comp] || 0);
            const podravka = Number(row.total_facings);
            const total =
              podravka +
              Object.values(row.competitors || {}).reduce(
                (sum, val) => sum + Number(val),
                0
              );
            const percent = total === 0 ? 0 : (compCount / total) * 100;
            return `${compCount} (${percent.toFixed(1)}%)`;
          },
        })
      )
    );

    cols.push(
      columnHelper.display({
        id: "total_competitor_facings",
        header: "Konkurrenca Total",
        cell: ({ row }) => {
          const competitor = Object.values(
            row.original.competitors || {}
          ).reduce((sum, val) => sum + Number(val), 0);
          const podravka = Number(row.original.total_facings);
          const total = competitor + podravka;
          const percent = total === 0 ? 0 : (competitor / total) * 100;
          return `${competitor} (${percent.toFixed(1)}%)`;
        },
      })
    );

    if (hasData("created_at")) {
      cols.push(
        columnHelper.accessor("created_at", {
          header: "Date & Time",
          cell: (info) => {
            const date = new Date(info.getValue());
            return isNaN(date.getTime())
              ? "—"
              : date.toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                });
          },
        })
      );
    }

    return cols;
  }, [competitorColumns, data]);

  const customFooter = (rows: FacingTable[]) => {
    const { podravka, competitor, total } = getFacingTotals(rows);
    return columns.map((col) => {
      const id = col.id?.toString() ?? `col-${Math.random()}`;
      if (id === "total_facings") {
        const percent = total === 0 ? 0 : (podravka / total) * 100;
        return (
          <td
            key={id}
            className=" px-2 py-1 text-center"
          >{`${podravka} (${percent.toFixed(1)}%)`}</td>
        );
      }

      if (id === "total_competitor_facings") {
        const percent = total === 0 ? 0 : (competitor / total) * 100;
        return (
          <td
            key={id}
            className=" px-2 py-1 text-center"
          >{`${competitor} (${percent.toFixed(1)}%)`}</td>
        );
      }

      if (competitorColumns.includes(id)) {
        const compTotal = rows.reduce(
          (sum, row) => sum + Number(row.competitors?.[id] || 0),
          0
        );
        const percent = total === 0 ? 0 : (compTotal / total) * 100;
        return (
          <td
            key={id}
            className=" px-2 py-1 text-center"
          >{`${compTotal} (${percent.toFixed(1)}%)`}</td>
        );
      }

      return <td key={id} className="px-2 py-1" />;
    });
  };

  const cellClassName = (colId: string) =>
    [
      "total_facings",
      "total_competitor_facings",
      ...competitorColumns,
    ].includes(colId)
      ? "text-center"
      : "";

  return (
    <BaseTable
      data={data}
      columns={columns}
      customFooter={customFooter}
      cellClassName={cellClassName}
    />
  );
};

export default FacingsTable;
