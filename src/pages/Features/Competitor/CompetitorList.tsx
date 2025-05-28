import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import competitorServices from "../../../services/competitorServices";
interface Competitor {
  competitor_id: number;
  brand_name: string;
  created_at: string;
}

const CompetitorList = () => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCompetitors = async () => {
    try {
      const data = await competitorServices.getAllCompetitorBrands();
      setCompetitors(data);
    } catch (err) {
      console.error("Failed to fetch competitors:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Gabim gjatë ngarkimit të brandëve."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const handleEdit = (id: number) => {
    navigate(`/competitor-brands/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    const confirm = window.confirm(
      "A jeni të sigurt që dëshironi të fshini këtë brand?"
    );
    if (!confirm) return;

    try {
      await competitorServices.deleteCompetitorBrand(id);
      fetchCompetitors();
      alert("Brandi është fshirë me sukses.");
    } catch (err) {
      console.error("Gabim gjatë fshirjes:", err);
      alert("Gabim gjatë fshirjes së brandit.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-semibold">Competitor Brands</h2>
      {loading ? (
        <p>Duke u ngarkuar...</p>
      ) : competitors.length === 0 ? (
        <p>Nuk ka asnjë brand.</p>
      ) : (
        <ul className="space-y-2">
          {competitors.map((brand) => (
            <li
              key={brand.competitor_id}
              className="border p-4 rounded flex justify-between items-center hover:bg-gray-50"
            >
              <div
                onClick={() => handleEdit(brand.competitor_id)}
                className="cursor-pointer w-full"
              >
                <div className="font-semibold">{brand.brand_name}</div>
                <div className="text-sm text-gray-600">
                  Krijuar më: {brand.created_at}
                </div>
              </div>
              <button
                onClick={() => handleDelete(brand.competitor_id)}
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

export default CompetitorList;
