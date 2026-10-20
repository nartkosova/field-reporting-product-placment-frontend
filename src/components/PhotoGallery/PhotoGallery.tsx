import { useCallback, useEffect, useState } from "react";
import { GalleryPhoto } from "../../types/attendanceInterface";
import { formatTime } from "../../utils/attendance";

type Props = {
  photos: GalleryPhoto[];
  title: string;
  previewCount?: number;
};

const kindLabel = (photo: GalleryPhoto) =>
  photo.kind === "presence" ? "Prezencë" : photo.label || "Raport";

// Compact thumbnail strip for a table cell that opens a full-screen viewer
// with every photo of the day.
const PhotoGallery = ({ photos, title, previewCount = 3 }: Props) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showGrid, setShowGrid] = useState(false);

  const close = useCallback(() => {
    setOpenIndex(null);
    setShowGrid(false);
  }, []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((index) =>
        index === null ? index : (index + delta + photos.length) % photos.length
      ),
    [photos.length]
  );

  const isOpen = openIndex !== null || showGrid;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close, step]);

  if (!photos.length) {
    return <span className="text-xs text-neutral-500">Pa foto</span>;
  }

  const current = openIndex !== null ? photos[openIndex] : null;
  const hiddenCount = photos.length - previewCount;

  return (
    <>
      <div className="flex items-center gap-1">
        {photos.slice(0, previewCount).map((photo, index) => (
          <button
            key={`${photo.photo_url}-${index}`}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="relative"
            title={`${kindLabel(photo)} · ${formatTime(photo.created_at)}`}
          >
            <img
              src={photo.photo_url}
              alt={kindLabel(photo)}
              loading="lazy"
              className={`h-10 w-10 rounded object-cover border ${
                photo.kind === "presence" ? "border-sky-500" : "border-neutral-700"
              }`}
            />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowGrid(true)}
          className="h-10 min-w-10 px-2 rounded border border-neutral-700 bg-neutral-900 text-xs text-neutral-200 hover:bg-neutral-800"
        >
          {hiddenCount > 0 ? `+${hiddenCount}` : `${photos.length} foto`}
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 text-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="min-w-0">
              <p className="font-semibold truncate">{title}</p>
              <p className="text-xs text-neutral-400">
                {current
                  ? `${(openIndex ?? 0) + 1} / ${photos.length} · ${kindLabel(current)}${
                      current.store_name ? ` · ${current.store_name}` : ""
                    } · ${formatTime(current.created_at)}`
                  : `${photos.length} foto`}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {current && (
                <button
                  type="button"
                  onClick={() => setOpenIndex(null)}
                  className="rounded border border-neutral-600 px-3 py-1 text-sm hover:bg-neutral-800"
                >
                  Të gjitha
                </button>
              )}
              <button
                type="button"
                onClick={close}
                className="rounded border border-neutral-600 px-3 py-1 text-sm hover:bg-neutral-800"
              >
                ✕ Mbyll
              </button>
            </div>
          </div>

          {current ? (
            <div
              className="flex-1 flex items-center justify-center gap-2 px-2 pb-4 min-h-0"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => step(-1)}
                className="text-white text-3xl px-3 py-6 hover:bg-white/10 rounded"
                aria-label="Para"
              >
                ‹
              </button>
              <a
                href={current.photo_url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 h-full flex items-center justify-center min-w-0"
              >
                <img
                  src={current.photo_url}
                  alt={kindLabel(current)}
                  className="max-h-full max-w-full object-contain rounded"
                />
              </a>
              <button
                type="button"
                onClick={() => step(1)}
                className="text-white text-3xl px-3 py-6 hover:bg-white/10 rounded"
                aria-label="Pas"
              >
                ›
              </button>
            </div>
          ) : (
            <div
              className="flex-1 overflow-y-auto px-4 pb-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {photos.map((photo, index) => (
                  <button
                    key={`${photo.photo_url}-${index}`}
                    type="button"
                    onClick={() => setOpenIndex(index)}
                    className="text-left"
                  >
                    <img
                      src={photo.photo_url}
                      alt={kindLabel(photo)}
                      loading="lazy"
                      className={`aspect-square w-full rounded object-cover border-2 ${
                        photo.kind === "presence" ? "border-sky-500" : "border-neutral-700"
                      }`}
                    />
                    <p className="mt-1 text-xs text-neutral-300 truncate">
                      {formatTime(photo.created_at)} · {kindLabel(photo)}
                    </p>
                    {photo.store_name && (
                      <p className="text-xs text-neutral-500 truncate">{photo.store_name}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PhotoGallery;
