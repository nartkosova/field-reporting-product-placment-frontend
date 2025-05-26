import { useEffect, useState } from "react";
import podravkaFacingsService from "../Services/podravkaFacingsService";
import { useParams, useSearchParams } from "react-router-dom";
import { Product } from "../types/productInterface";

const PodravkaFacingsFormPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [facings, setFacings] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const storeId = id ? parseInt(id) : NaN;
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userId = userInfo?.id;

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const products = await podravkaFacingsService.getProductsByStoreId(
          storeId
        );
        const filtered = products.filter(
          (p: Product) => p.category === selectedCategory
        );
        setProducts(filtered);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [storeId, selectedCategory]);

  const handleFacingChange = (productId: number, value: number) => {
    setFacings({ ...facings, [productId]: value });
  };

  const totalFacingsForCategory = products.reduce((sum, product) => {
    const count = facings[product.product_id] || 0;
    return sum + count;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const facingData = products.map((product) => ({
        user_id: userId,
        store_id: Number(storeId),
        product_id: product.product_id,
        category: product.category,
        facings_count: facings[product.product_id] || 0,
      }));

      await podravkaFacingsService.batchCreatePodravkaFacings(facingData);

      alert("Facings submitted successfully!");
      setFacings({});
    } catch (err) {
      alert("Error submitting facings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">Podravka Facings</h2>
      {productsLoading ? (
        <p>Duke i shfaqur produktet...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {products.map((product) => (
            <div key={product.product_id} className="border p-2 rounded">
              <label>
                {product.name} ({product.category}) - {product.product_category}
              </label>
              <input
                type="number"
                className="border p-2 w-full mt-1"
                placeholder="Numri i facings"
                min={0}
                value={facings[product.product_id] || ""}
                onChange={(e) =>
                  handleFacingChange(product.product_id, Number(e.target.value))
                }
              />
            </div>
          ))}

          <div className="text-left font-semibold">
            Total i facings per kategorin{" "}
            <span className="text-blue-600">{selectedCategory}</span>:{" "}
            {totalFacingsForCategory}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 w-full rounded hover:bg-blue-700"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
};

export default PodravkaFacingsFormPage;
