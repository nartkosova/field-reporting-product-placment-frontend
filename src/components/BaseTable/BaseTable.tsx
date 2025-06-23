import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnDef,
} from "@tanstack/react-table";
import { useState } from "react";

interface Props<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  customFooter?: (rows: T[]) => React.ReactNode;
  rowClassName?: string;
  cellClassName?: (colId: string) => string;
}

export const BaseTable = <T,>({
  data,
  columns,
  customFooter,
  rowClassName = "hover:bg-gray-50",
  cellClassName = () => "",
}: Props<T>) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto border rounded shadow-sm">
      <table className="w-full text-sm table-auto border-collapse min-w-max">
        <thead className="bg-gray-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border px-2 py-1 text-left cursor-pointer select-none"
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
            <tr key={row.id} className={rowClassName}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={`border px-2 py-1 ${cellClassName(
                    cell.column.id
                  )}`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {customFooter && (
          <tfoot className="bg-gray-100 font-semibold">
            <tr>
              {customFooter(table.getRowModel().rows.map((r) => r.original))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};
