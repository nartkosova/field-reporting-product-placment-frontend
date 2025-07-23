/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo } from "react";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "../../components/BaseTable/BaseTable";
import { PodravkaFacingReport } from "../../types/podravkaFacingInterface";
import { getPodravkaOnlyFacingTotals } from "../../utils/getFacingTotals";

interface Props {
  data: PodravkaFacingReport[];
  categories?: string[];
}

const columnHelper = createColumnHelper<PodravkaFacingReport>();

const ProductFacingsReportTable = ({ data }: Props) => {
  const columns: ColumnDef<PodravkaFacingReport, any>[] = useMemo(() => {
    return [
      columnHelper.accessor("business_unit", { header: "Business Unit" }),
      columnHelper.accessor("product_category", { header: "Kategoria" }),
      columnHelper.accessor("product_name", {
        header: "Produkti",
        cell: (info) => {
          const row = info.row.original;
          const name = row.product_name;
          const rank = row.product_category_rank;
          const percentage = Number(row.category_sales_share);

          const hasRank = typeof rank === "number";
          const hasPercentage = !isNaN(percentage);

          const rankText = hasRank ? ` (${rank}` : "";
          let percentText = "";

          if (hasPercentage) {
            const percentValue = (percentage * 100).toFixed(2);
            percentText = hasRank
              ? ` - ${percentValue}%`
              : ` (${percentValue}%`;
          }

          const suffix = hasRank || hasPercentage ? ")" : "";

          return `${name}${rankText}${percentText}${suffix}`;
        },
      }),
      columnHelper.accessor("total_facings", {
        id: "total_facings",
        header: "Facings",
        cell: (info) => {
          const count = info.getValue();
          const percentage =
            info.row.original.facing_percentage_in_category ?? 0;
          return `${count} (${percentage.toFixed(1)}%)`;
        },
      }),
    ];
  }, []);

  const customFooter = (rows: PodravkaFacingReport[]) => {
    const { podravka } = getPodravkaOnlyFacingTotals(rows);
    return columns.map((col) => {
      const id = col.id?.toString() ?? `col-${Math.random()}`;
      if (id === "total_facings") {
        return (
          <td key={id} className=" px-4 py-1 text-left">{`${podravka} `}</td>
        );
      }

      return <td key={id} className="px-2 py-1" />;
    });
  };

  const cellClassName = (colId: string) =>
    ["total_facings"].includes(colId) ? "text-left" : "";

  return (
    <BaseTable
      data={data}
      columns={columns}
      customFooter={customFooter}
      cellClassName={cellClassName}
    />
  );
};

export default ProductFacingsReportTable;
