import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { formattedDate } from "../../utils/utils";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

import { useErrorHandler } from "../../hooks/useErrorHandler";
import { BaseEntity } from "../../types/common";

export interface Entity extends BaseEntity {
  role?: string;
  category?: string;
}

interface EntityListProps<T extends Entity> {
  title: string;
  fetchAll: (offset: number, limit: number) => Promise<T[]>;
  onDelete?: (id: number) => Promise<void>;
  editPath: string;
  itemLabel?: string;
  renderDetails?: (item: T) => React.ReactNode;
}

export const EntityList = <T extends Entity>({
  title,
  fetchAll,
  onDelete,
  editPath,
  itemLabel = "elementin",
  renderDetails,
}: EntityListProps<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const LIMIT = 20;

  const loadMore = useCallback(async () => {
    if (loading || isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    try {
      const nextOffset = offset + LIMIT;
      const data = await fetchAll(nextOffset, LIMIT);
      setItems((prev) => [...prev, ...data]);
      setOffset(nextOffset);
      setHasMore(data.length === LIMIT);
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      const backendMessage =
        axiosError.response?.data?.error ||
        `Gabim gjatë ngarkimit të ${title.toLowerCase()}.`;
      handleError(backendMessage);
    } finally {
      setIsFetchingMore(false);
    }
  }, [
    offset,
    fetchAll,
    LIMIT,
    loading,
    isFetchingMore,
    hasMore,
    handleError,
    title,
  ]);

  const reset = useCallback(async () => {
    setOffset(0);
    setHasMore(true);
    setLoading(true);
    try {
      const data = await fetchAll(0, LIMIT);
      setItems(data);
      setHasMore(data.length === LIMIT);
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      const backendMessage =
        axiosError.response?.data?.error ||
        `Gabim gjatë ngarkimit të ${title.toLowerCase()}.`;
      handleError(backendMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchAll, LIMIT, handleError, title]);

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    const handleScroll = () => {
      if (loading || isFetchingMore || !hasMore) return;
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 100;
      if (scrollPosition >= threshold) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loading, isFetchingMore, hasMore, loadMore]);

  const handleEdit = (id: number) => {
    navigate(`${editPath}/${id}`);
  };

  const handleDelete = useCallback(
    async (id: number) => {
      if (!onDelete) return;
      const confirm = window.confirm(
        `A jeni të sigurt që dëshironi të fshini këtë ${itemLabel}?`
      );
      if (!confirm) return;

      try {
        await onDelete(id);
        setItems((prev) => prev.filter((item) => item.id !== id));
        alert(
          `${itemLabel[0].toUpperCase() + itemLabel.slice(1)} u fshi me sukses.`
        );
      } catch (err) {
        console.error(`Gabim gjatë fshirjes së ${itemLabel}:`, err);
        const axiosError = err as AxiosError<{ error: string }>;
        const backendMessage =
          axiosError.response?.data?.error ||
          `Gabim gjatë fshirjes së ${itemLabel}.`;
        handleError(backendMessage);
      }
    },
    [onDelete, itemLabel, handleError]
  );

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg p-6 w-full">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <div className="text-gray-400">Nuk ka të dhëna.</div>
      ) : (
        <ul className="divide-y divide-neutral-800">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <div className="flex-1 text-white">
                <span className="font-semibold">{item.name}</span>
                {renderDetails && (
                  <span className="ml-2">{renderDetails(item)}</span>
                )}
                {item.created_at && (
                  <span className="ml-2 text-xs text-gray-400">
                    ({formattedDate(item.created_at)})
                  </span>
                )}
                {item.category && (
                  <span className="ml-2 text-xs text-gray-400">
                    ({item.category})
                  </span>
                )}
              </div>
              <div className="flex items-center mt-2 sm:mt-0">
                <button
                  onClick={() => handleEdit(item.id)}
                  className="text-gray-200 hover:text-white bg-neutral-800 border border-neutral-700 px-5 py-3 cursor-pointer rounded-xl text-base font-semibold mr-3 transition-colors min-w-[110px] min-h-[48px]"
                  title="Ndrysho"
                >
                  ✏️ Ndrysho
                </button>
                {onDelete && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700 bg-neutral-800 border border-neutral-700 px-5 py-3 cursor-pointer rounded-xl text-base font-semibold transition-colors min-w-[110px] min-h-[48px]"
                    title="Fshi"
                  >
                    🗑️ Fshi
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {isFetchingMore && <LoadingSpinner />}
    </div>
  );
};
