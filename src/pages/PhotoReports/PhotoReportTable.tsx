import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { useMemo, useState, useCallback, useEffect } from "react";
import { BaseTable } from "../../components/BaseTable/BaseTable";
import { PhotoSchema } from "../../types/photoInterface";
import photoService from "../../services/photoService";
import ActionButton from "../../components/Buttons/ActionButtons";

const columnHelper = createColumnHelper<PhotoSchema>();

const PhotoTable = ({ data }: { data: PhotoSchema[] }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [tableData, setTableData] = useState<PhotoSchema[]>(data);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const togglePhoto = useCallback((url: string) => {
    setSelectedPhotos((prev) => {
      const updated = new Set(prev);
      if (updated.has(url)) updated.delete(url);
      else updated.add(url);
      return updated;
    });
  }, []);

  const toggleAllPhotos = useCallback(() => {
    const all = tableData.map((d) => d.photo_url);
    const allSelected = all.every((url) => selectedPhotos.has(url));
    setSelectedPhotos(allSelected ? new Set() : new Set(all));
  }, [tableData, selectedPhotos]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = useMemo<ColumnDef<PhotoSchema, any>[]>(
    () => [
      columnHelper.display({
        id: "select",
        header: () => (
          <input
            type="checkbox"
            checked={
              tableData.length > 0 &&
              tableData.every((d) => selectedPhotos.has(d.photo_url))
            }
            onChange={toggleAllPhotos}
            className="w-4 h-4 appearance-none rounded border border-neutral-700 bg-neutral-900 checked:bg-blue-600 checked:border-blue-600 focus:outline-none cursor-pointer transition-colors"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedPhotos.has(row.original.photo_url)}
            onChange={() => togglePhoto(row.original.photo_url)}
            className="w-4 h-4 appearance-none rounded border border-neutral-700 bg-neutral-900 checked:bg-blue-600 checked:border-blue-600 focus:outline-none cursor-pointer transition-colors"
          />
        ),
      }),
      columnHelper.accessor("user", { header: "User" }),
      columnHelper.accessor("store_name", { header: "Shitorja" }),
      columnHelper.accessor("category", { header: "Kategoria" }),
      columnHelper.accessor("photo_type", { header: "Lloji i Fotos" }),
      columnHelper.accessor("photo_description", {
        header: "Përshkrimi",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("company", {
        header: "Kompania",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("created_at", {
        header: "Ngarkuar më",
        cell: (info) => {
          const date = new Date(info.getValue());
          return isNaN(date.getTime())
            ? "—"
            : date.toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              });
        },
      }),
      columnHelper.accessor("photo_url", {
        header: "Fotot",
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
    [tableData, selectedPhotos, toggleAllPhotos, togglePhoto]
  );

  return (
    <div className="space-y-4">
      <BaseTable data={tableData} columns={columns} />

      {selectedPhotos.size > 0 && (
        <div className="pt-2 flex gap-2">
          <ActionButton
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
          </ActionButton>

          <ActionButton
            variant="danger"
            onClick={async () => {
              if (
                !window.confirm(
                  "A je i sigurt që dëshiron të fshish këto foto?"
                )
              )
                return;

              const photoUrls = Array.from(selectedPhotos);
              await photoService.bulkDeletePhotos(photoUrls);
              alert("Fotot u fshinë me sukses.");
              setTableData((prev) =>
                prev.filter((photo) => !selectedPhotos.has(photo.photo_url))
              );
              setSelectedPhotos(new Set());
            }}
          >
            Delete Selected ({selectedPhotos.size})
          </ActionButton>
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
              className="rounded shadow-lg h-auto max-h-[90vh] object-contain"
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
