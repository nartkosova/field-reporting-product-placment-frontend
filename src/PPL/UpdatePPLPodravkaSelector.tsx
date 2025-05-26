import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import podravkaFacingsService from "../Services/podravkaFacingsService";

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

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await podravkaFacingsService.getUserPPLBatches();
        setBatches(data);
      } catch (err) {
        console.error("Failed to fetch PPL batches:", err);
        alert("Error loading your PPL reports.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const handleEdit = (batchId: string) => {
    navigate(`/ppl-podravka/edit/${batchId}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-semibold">My PPL Reports</h2>
      {loading ? (
        <p>Loading...</p>
      ) : batches.length === 0 ? (
        <p>No PPL reports found.</p>
      ) : (
        <ul className="space-y-2">
          {batches.map((b) => (
            <li
              key={b.batch_id}
              className="border p-4 rounded hover:bg-gray-50 cursor-pointer"
              onClick={() => handleEdit(b.batch_id)}
            >
              <div className="font-semibold">{b.store_name}</div>
              <div className="text-sm text-gray-600">
                Category: {b.category} | Products: {b.product_count} | Date:{" "}
                {b.report_date}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PodravkaPPLEditor;
