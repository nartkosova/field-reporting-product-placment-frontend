import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { PhotoSchema } from "../types/photoInterface";
import photoService from "../Services/photoService";

const columnHelper = createColumnHelper<PhotoSchema>();

const PhotoTable = ({ data }: { data: PhotoSchema[] }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState(10);
  const [showAll, setShowAll] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  const togglePhoto = useCallback((url: string) => {
    setSelectedPhotos((prev) => {
      const updated = new Set(prev);
      if (updated.has(url)) {
        updated.delete(url);
      } else {
        updated.add(url);
      }
      return new Set(updated);
    });
  }, []);

  const toggleAllPhotos = useCallback(() => {
    setSelectedPhotos((prev) => {
      const all = data.map((d) => d.photo_url);
      const allSelected = all.every((url) => prev.has(url));
      return allSelected ? new Set() : new Set(all);
    });
  }, [data]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: () => (
          <input
            className="cursor-pointer align-middle"
            type="checkbox"
            checked={
              data.length > 0 &&
              data.every((d) => selectedPhotos.has(d.photo_url))
            }
            onChange={toggleAllPhotos}
          />
        ),
        cell: ({ row }) => (
          <input
            className="cursor-pointer align-middle"
            type="checkbox"
            checked={selectedPhotos.has(row.original.photo_url)}
            onChange={() => togglePhoto(row.original.photo_url)}
          />
        ),
      }),
      columnHelper.accessor("user", { header: "User", enableSorting: true }),
      columnHelper.accessor("store_name", {
        header: "Store",
        enableSorting: true,
      }),
      columnHelper.accessor("category", {
        header: "Category",
        enableSorting: true,
      }),
      columnHelper.accessor("photo_type", {
        header: "Photo Type",
        enableSorting: true,
      }),
      columnHelper.accessor("uploaded_at", {
        header: "Uploaded At",
        enableSorting: true,
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.accessor("photo_url", {
        header: "Photo",
        cell: (info) => (
          <img
            src={info.getValue()}
            alt="photo"
            className="h-24 w-auto object-contain cursor-pointer"
            onClick={() => setSelectedPhoto(info.getValue())}
          />
        ),
      }),
    ],
    [selectedPhotos, data, toggleAllPhotos, togglePhoto]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border rounded shadow-sm">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border px-2 py-1 text-left cursor-pointer"
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
                  <td key={cell.id} className="border px-2 py-1">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        {!showAll ? (
          <div className="flex items-center gap-2">
            <span>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Prev
            </button>
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
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

      {selectedPhotos.size > 0 && (
        <div className="pt-2 flex gap-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
            onClick={async () => {
              const JSZip = (await import("jszip")).default;
              const zip = new JSZip();

              await Promise.all(
                Array.from(selectedPhotos).map(async (url, idx) => {
                  const res = await fetch(url);
                  const blob = await res.blob();
                  const filename =
                    url.split("/").pop()?.split("?")[0] || `photo_${idx}.jpg`;
                  zip.file(filename, blob);
                })
              );

              const blob = await zip.generateAsync({ type: "blob" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "photos.zip";
              a.click();
              URL.revokeObjectURL(a.href);
            }}
          >
            Download Selected ({selectedPhotos.size})
          </button>

          <button
            className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
            onClick={async () => {
              const photoUrls = Array.from(selectedPhotos);
              await photoService.bulkDeletePhotos(photoUrls);
              alert("Selected photos deleted successfully");
              setSelectedPhotos(new Set());
              // optionally trigger refetch or update table
            }}
          >
            Delete Selected ({selectedPhotos.size})
          </button>
        </div>
      )}

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-[var(--transparent-black)] flex items-center justify-center z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-auto">
            <img
              src={selectedPhoto}
              alt="Full size"
              className="rounded shadow-lg full h-auto max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-2 right-2 text-white bg-opacity-60 px-2 py-1 rounded cursor-pointer"
              onClick={() => setSelectedPhoto(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoTable;
