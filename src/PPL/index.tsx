import { useEffect, useState } from "react";
import podravkaFacingsService from "../Services/podravkaFacingsService";
import { useParams } from "react-router-dom";

interface Product {
  product_id: number;
  name: string;
  category: string;
  business_unit: string;
  product_category: string;
}

const PodravkaFacingsFormPage = () => {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [facings, setFacings] = useState<{ [key: number]: number }>({});
  const { id } = useParams<{ id: string }>();
  const storeId = id ? parseInt(id) : NaN;
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userId = userInfo?.id;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await podravkaFacingsService.getProductsByStoreId(
          storeId
        );
        setProducts(products);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, [storeId]);

  const handleFacingChange = (productId: number, value: number) => {
    setFacings({ ...facings, [productId]: value });
  };

  const filteredProducts = categoryFilter
    ? products.filter((p) => p.category === categoryFilter)
    : products;

  const uniqueCategories = Array.from(new Set(products.map((p) => p.category)));

  const totalFacingsForCategory = filteredProducts.reduce((sum, product) => {
    const count = facings[product.product_id] || 0;
    return sum + count;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const today = new Date().toISOString().split("T")[0];

      const facingData = filteredProducts.map((product) => ({
        user_id: userId,
        store_id: Number(storeId),
        product_id: product.product_id,
        facings_count: facings[product.product_id] || 0,
        report_date: today,
      }));

      for (const facing of facingData) {
        await podravkaFacingsService.createPodravkaFacing(facing);
      }

      // Send total to category-facing table
      await podravkaFacingsService.createCategoryFacing({
        user_id: userId,
        store_id: Number(storeId),
        category: categoryFilter,
        total_facings: totalFacingsForCategory,
        report_date: today,
      });

      alert("Facings submitted successfully!");

      setCategoryFilter("");
      setFacings({});
    } catch (err) {
      alert("Error submitting facings");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">Submit Podravka Facings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          className="border p-2 w-full"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">...</option>
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {filteredProducts.map((product) => (
          <div key={product.product_id} className="border p-2 rounded">
            <label>
              {product.name} ({product.category}) - {product.product_category}
            </label>
            <input
              type="number"
              className="border p-2 w-full mt-1"
              placeholder="Facings Count"
              value={facings[product.product_id] || ""}
              onChange={(e) =>
                handleFacingChange(product.product_id, Number(e.target.value))
              }
            />
          </div>
        ))}

        {categoryFilter && (
          <div className="text-left font-semibold">
            Total facings for{" "}
            <span className="text-blue-600">{categoryFilter}</span>:{" "}
            {totalFacingsForCategory}
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 w-full rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default PodravkaFacingsFormPage;
