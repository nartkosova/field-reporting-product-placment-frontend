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
    <div className="overflow-x-auto border border-neutral-800 rounded shadow-sm bg-black">
      <table className="w-full text-sm table-auto border-collapse min-w-max bg-neutral-900 text-white">
        <thead className="bg-neutral-800 text-gray-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border border-neutral-800 px-2 py-2 text-left cursor-pointer select-none font-semibold"
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
                  className={`border border-neutral-800 px-2 py-2 ${cellClassName(
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
          <tfoot className="bg-neutral-800 font-semibold text-gray-200">
            <tr>
              {customFooter(table.getRowModel().rows.map((r) => r.original))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};
