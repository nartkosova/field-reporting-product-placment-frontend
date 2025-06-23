import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { formattedDate } from "../../utils/utils";

export interface Entity {
  id: number;
  name: string;
  role?: string;
  created_at?: string;
  created_by?: string;
  category?: string;
}

interface EntityListProps<T extends Entity> {
  title: string;
  fetchAll: () => Promise<T[]>;
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

  const fetchItems = async () => {
    try {
      const data = await fetchAll();
      setItems(data);
    } catch (err) {
      console.error(`Failed to fetch ${title.toLowerCase()}:`, err);
      const axiosError = err as AxiosError<{ error: string }>;
      const backendMessage =
        axiosError.response?.data?.error ||
        `Gabim gjatë ngarkimit të ${title.toLowerCase()}.`;
      alert(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleEdit = (id: number) => {
    navigate(`${editPath}/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!onDelete) return;
    const confirm = window.confirm(
      `A jeni të sigurt që dëshironi të fshini këtë ${itemLabel}?`
    );
    if (!confirm) return;

    try {
      await onDelete(id);
      fetchItems();
      alert(
        `${itemLabel[0].toUpperCase() + itemLabel.slice(1)} u fshi me sukses.`
      );
    } catch (err) {
      console.error(`Gabim gjatë fshirjes së ${itemLabel}:`, err);
      const axiosError = err as AxiosError<{ error: string }>;
      const backendMessage =
        axiosError.response?.data?.error ||
        `Gabim gjatë fshirjes së ${itemLabel}.`;
      alert(backendMessage);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      {loading ? (
        <div className="text-gray-400">Loading...</div>
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
    </div>
  );
};
