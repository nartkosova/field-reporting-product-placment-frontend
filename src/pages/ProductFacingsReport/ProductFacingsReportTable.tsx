/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "../../components/BaseTable/BaseTable";
import { PodravkaFacingReport } from "../../types/podravkaFacingInterface";

interface Props {
  data: PodravkaFacingReport[];
  categories?: string[];
}

const columnHelper = createColumnHelper<PodravkaFacingReport>();

const ProductFacingsReportTable = ({ data }: Props) => {
  const columns: ColumnDef<PodravkaFacingReport, any>[] = useMemo(() => {
    return [
      columnHelper.accessor("product_name", {
        header: "Produkti",
        cell: (info) => {
          const row = info.row.original;
          const name = row.product_name;
          const rank = row.product_category_rank;
          return `${name}${rank ? ` (${rank})` : ""}`;
        },
      }),
      columnHelper.accessor("facings_count", {
        header: "Facings",
        cell: (info) => info.getValue().toString(),
      }),
      columnHelper.accessor("product_category", { header: "Kategoria" }),
      columnHelper.accessor("store_name", { header: "Dyqani" }),
      columnHelper.accessor("sales_rep", { header: "Përfaqësuesi" }),
      columnHelper.accessor("location", { header: "Lokacioni" }),
      columnHelper.accessor("reported_by", { header: "Raportuar nga" }),
      columnHelper.accessor("created_at", {
        header: "Data",
        cell: (info) => {
          const date = new Date(info.getValue());
          return isNaN(date.getTime())
            ? "—"
            : date.toLocaleDateString(undefined, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
        },
      }),
    ];
  }, []);

  return <BaseTable data={data} columns={columns} />;
};

export default ProductFacingsReportTable;
