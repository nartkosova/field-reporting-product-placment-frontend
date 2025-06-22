import { useEffect, useState } from "react";
import podravkaFacingsService from "../../../services/podravkaFacingsService";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Product } from "../../../types/productInterface";
import productServices from "../../../services/productServices";
import { useSelectedStore } from "../../../hooks/useSelectStore";
import { queueFacings } from "../../../db/db";
import { isOnline } from "../../../utils/cacheManager";

const PodravkaFacingsFormPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [facings, setFacings] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const storeInfo = useSelectedStore();
  const id = storeInfo?.store_id || 0;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const storeId = id ? parseInt(id.toString()) : NaN;
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userId = userInfo?.id;

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const products = await productServices.getProductsByStoreId(storeId);
        const filtered = products
          .filter((p: Product) => p.category === selectedCategory)
          .sort((a: Product, b: Product) =>
            b.product_category.localeCompare(a.product_category)
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

    const facingData = products.map((product) => ({
      user_id: userId,
      store_id: Number(storeId),
      product_id: product.product_id,
      category: product.category,
      facings_count: facings[product.product_id] || 0,
    }));

    try {
      if (!isOnline()) {
        await queueFacings(facingData);
        alert("Offline – facings u ruajtën për t'u dërguar më vonë.");
      } else {
        await podravkaFacingsService.batchCreatePodravkaFacings(facingData);
        alert("Facings u ngarkuan me sukses!");
      }

      setFacings({});
      navigate(-1);
    } catch (err) {
      console.error("Gabim gjatë submit:", err);
      alert("Gabim gjatë ngarkimit të facings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 border border-gray-200 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Podravka Facings</h2>

      {productsLoading ? (
        <p className="text-gray-600">Duke i shfaqur produktet...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {products.map((product) => (
            <div
              key={product.product_id}
              className="p-4 border border-gray-300 rounded-md "
            >
              <label className="block mb-2 font-medium text-gray-700">
                {product.name} - {product.product_category}
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Numri i facings"
                min={0}
                value={facings[product.product_id] || ""}
                onChange={(e) =>
                  handleFacingChange(product.product_id, Number(e.target.value))
                }
              />
            </div>
          ))}

          <div className="text-left font-semibold text-gray-700">
            Total i facings për kategorinë{" "}
            <span className="text-blue-600">{selectedCategory}</span>:{" "}
            <span className="text-red-600">{totalFacingsForCategory}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 w-full rounded hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
};

export default PodravkaFacingsFormPage;
