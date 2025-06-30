import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
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
  rowClassName = "hover:bg-neutral-900",
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
    <div className="overflow-x-auto border border-neutral-800 rounded-2xl shadow bg-[#0f0f0f]">
      <table className="w-full text-sm table-auto min-w-max text-white">
        <thead className="bg-neutral-900 text-gray-300">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={`px-4 py-3 font-semibold text-left border-b border-neutral-800 cursor-pointer select-none ${cellClassName(
                    header.column.id
                  )}`}
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
                  className={`px-4 py-3 border-b border-neutral-800 ${cellClassName(
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
          <tfoot className="bg-neutral-900 font-semibold text-gray-300">
            <tr>
              {customFooter(table.getRowModel().rows.map((r) => r.original))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};
