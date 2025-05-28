import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import podravkaFacingsService from "../../services/podravkaFacingsService";

interface PPLBatch {
  batch_id: string;
  store_name: string;
  category: string;
  report_date: string;
  product_count: number;
}

const PodravkaPPLEditor = () => {
  const [batches, setBatches] = useState<PPLBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBatches = async () => {
    try {
      const data = await podravkaFacingsService.getUserPPLBatches();
      setBatches(data);
    } catch (err) {
      console.error("Failed to fetch PPL batches:", err);
      alert(
        err instanceof Error ? err.message : "Error gjate ngarkimit te PPL."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleEdit = (batchId: string) => {
    navigate(`/ppl-podravka/edit/${batchId}`);
  };

  const handleDelete = async (batchId: string) => {
    const confirm = window.confirm(
      "A jeni te sigurt që dëshironi të fshini këtë raport PPL?"
    );
    if (!confirm) return;

    try {
      await podravkaFacingsService.deletePodravkaFacingBatch(batchId);
      fetchBatches();
      alert("PPL esht fshire me sukses.");
    } catch (err) {
      console.error("Error deleting batch:", err);
      alert(
        err instanceof Error ? err.message : "Gabim gjatë fshirjes së PPL."
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-semibold">PPL Reports</h2>
      {loading ? (
        <p>Loading...</p>
      ) : batches.length === 0 ? (
        <p>Nuk ka asnje PPL</p>
      ) : (
        <ul className="space-y-2">
          {batches.map((b) => (
            <li
              key={b.batch_id}
              className="border p-4 rounded flex justify-between items-center hover:bg-gray-50"
            >
              <div
                onClick={() => handleEdit(b.batch_id)}
                className="cursor-pointer w-full"
              >
                <div className="font-semibold">{b.store_name}</div>
                <div className="text-sm text-gray-600">
                  Kategoria: {b.category} | Numri i produkteve:{" "}
                  {b.product_count} | Data: {b.report_date}
                </div>
              </div>
              <button
                onClick={() => handleDelete(b.batch_id)}
                className="text-red-600 hover:text-red-800 text-xl ml-4 cursor-pointer"
                title="Delete"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PodravkaPPLEditor;
