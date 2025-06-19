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
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {loading ? (
        <p>Duke u ngarkuar...</p>
      ) : items.length === 0 ? (
        <p>Nuk ka asnjë {itemLabel}.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="border p-4 rounded flex justify-between items-center hover:bg-gray-50"
            >
              <div
                onClick={() => handleEdit(item.id)}
                className="cursor-pointer w-full"
              >
                <div className="font-semibold">{item.name}</div>
                {renderDetails ? (
                  renderDetails(item)
                ) : (
                  <>
                    {item.role && (
                      <div className="text-sm text-gray-600">
                        Roli: {item.role}
                      </div>
                    )}
                    {item.created_at && (
                      <div className="text-sm text-gray-600">
                        Krijuar në: {formattedDate(item.created_at)}
                      </div>
                    )}
                    {item.created_by && (
                      <div className="text-sm text-gray-600">
                        Krijuar nga: {item.created_by}
                      </div>
                    )}
                    {item.category && (
                      <div className="text-sm text-gray-600">
                        Kategoria: {item.category}
                      </div>
                    )}
                  </>
                )}
              </div>
              {onDelete && (
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800 text-xl ml-4 cursor-pointer"
                  title="Delete"
                >
                  🗑️
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
