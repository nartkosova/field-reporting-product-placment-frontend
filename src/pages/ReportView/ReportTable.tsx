import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { useState } from "react";

interface Facing {
  user: string;
  store_name: string;
  category: string;
  total_facings: number;
  report_date: string;
  competitors: Record<string, number>;
}

interface Props {
  data: Facing[];
  competitorColumns: string[];
}

const columnHelper = createColumnHelper<Facing>();

const FacingsTable = ({ data, competitorColumns }: Props) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState(10);
  const [showAll, setShowAll] = useState(false);

  const columns = [
    columnHelper.accessor("user", { header: "User", enableSorting: true }),
    columnHelper.accessor("store_name", {
      header: "Store",
      enableSorting: true,
    }),
    columnHelper.accessor("category", {
      header: "Category",
      enableSorting: true,
    }),
    columnHelper.accessor("total_facings", {
      header: "Podravka Facings",
      enableSorting: true,
      cell: (info) => {
        const row = info.row.original;
        const podravka = Number(row.total_facings);
        const competitor = Object.values(row.competitors || {}).reduce(
          (sum, val) => sum + Number(val),
          0
        );
        const total = podravka + competitor;
        const percentage = total === 0 ? 0 : (podravka / total) * 100;

        return `${podravka} (${percentage.toFixed(1)}%)`;
      },
    }),
    ...competitorColumns.map((comp) =>
      columnHelper.accessor((row) => row.competitors?.[comp] ?? 0, {
        header: comp,
        id: comp,
        enableSorting: true,
      })
    ),
    columnHelper.display({
      id: "total_competitor_facings",
      header: "Konkurrenca Total",
      cell: ({ row }) => {
        const competitor = Object.values(row.original.competitors || {}).reduce(
          (sum, val) => sum + Number(val),
          0
        );
        const podravka = Number(row.original.total_facings);
        const total = competitor + podravka;
        const percent = total === 0 ? 0 : (competitor / total) * 100;
        return `${competitor} (${percent.toFixed(1)}%)`;
      },
      enableSorting: false, // optional: no sorting here unless you re-implement
    }),

    columnHelper.accessor("report_date", {
      header: "Date",
      enableSorting: true,
      cell: (info) =>
        new Date(info.getValue()).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border rounded shadow-sm">
        <div className="w-full overflow-x-auto rounded border">
          <table className="w-full text-sm table-auto border-collapse min-w-max">
            <thead className="bg-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`border px-2 py-1 text-left cursor-pointer select-none whitespace-normal break-words ${
                        [
                          "total_facings",
                          "total_competitor_facings",
                          ...competitorColumns,
                        ].includes(header.id)
                          ? "max-w-[80px]"
                          : "min-w-[80px] max-w-[200px]"
                      }`}
                      style={{ wordBreak: "break-word" }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === "asc" ? " ▲" : ""}
                      {header.column.getIsSorted() === "desc" ? " ▼" : ""}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`border px-2 py-1 align-top whitespace-normal break-words ${
                        // compact width for numeric cells
                        [
                          "total_facings",
                          "total_competitor_facings",
                          ...competitorColumns,
                        ].includes(cell.column.id)
                          ? "text-center"
                          : ""
                      }`}
                      style={{ wordBreak: "break-word" }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold bg-gray-100">
                {table.getFlatHeaders().map((header) => {
                  const id = header.id;

                  const rows = table.getRowModel().rows;
                  const totalPodravka = rows.reduce(
                    (sum, row) => sum + Number(row.original.total_facings),
                    0
                  );
                  const totalCompetitor = rows.reduce((sum, row) => {
                    return (
                      sum +
                      Object.values(row.original.competitors || {}).reduce(
                        (s, v) => s + Number(v),
                        0
                      )
                    );
                  }, 0);
                  const grandTotal = totalPodravka + totalCompetitor;

                  if (id === "total_facings") {
                    const percent =
                      grandTotal === 0 ? 0 : (totalPodravka / grandTotal) * 100;
                    return (
                      <td key={id} className="border px-2 py-1 text-center">
                        {totalPodravka} ({percent.toFixed(1)}%)
                      </td>
                    );
                  }

                  if (id === "total_competitor_facings") {
                    const percent =
                      grandTotal === 0
                        ? 0
                        : (totalCompetitor / grandTotal) * 100;
                    return (
                      <td key={id} className="border px-2 py-1 text-center">
                        {totalCompetitor} ({percent.toFixed(1)}%)
                      </td>
                    );
                  }

                  if (competitorColumns.includes(id)) {
                    const compTotal = rows.reduce((sum, row) => {
                      return sum + Number(row.original.competitors?.[id] || 0);
                    }, 0);
                    const percent =
                      grandTotal === 0 ? 0 : (compTotal / grandTotal) * 100;
                    return (
                      <td key={id} className="border px-2 py-1 text-center">
                        {compTotal} ({percent.toFixed(1)}%)
                      </td>
                    );
                  }

                  return <td key={id} className="border px-2 py-1"></td>;
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        {!showAll ? (
          <div className="flex items-center gap-2">
            <span>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>

            <button
              className="px-2 py-1 border rounded disabled:opacity-50 cursor-pointer"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Prev
            </button>
            <button
              className="px-2 py-1 border rounded disabled:opacity-50 cursor-pointer"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        ) : (
          <p>Showing all rows</p>
        )}

        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            className="border rounded p-1"
            value={showAll ? "all" : pageSize}
            onChange={(e) => {
              if (e.target.value === "all") {
                setShowAll(true);
                setPageSize(data.length);
                table.setPageSize(data.length);
              } else {
                const size = Number(e.target.value);
                setShowAll(false);
                setPageSize(size);
                table.setPageSize(size);
              }
            }}
          >
            {[10, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
            <option value="all">All</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FacingsTable;
