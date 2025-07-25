import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import priceCheckServices from "../../../services/priceCheckServices";
import BrandSelector from "./BrandSelector";
import AddProductForm from "./AddProductForm";
import ProductList from "./ProductList";
import { CompetitorPriceCheckInput } from "../../../types/priceCheckInterface";
import { CompetitorProduct } from "../../../types/productInterface";
import { AxiosError } from "axios";
import productServices from "../../../services/productServices";
import SubmitButton from "../../../components/Buttons/SubmitButton";
import { useUser } from "../../../hooks/useUser";

const PriceCheckCompetitor = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const storeId = id ? parseInt(id) : NaN;
  const { user } = useUser();
  const userId = user?.user_id;
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [products, setProducts] = useState<CompetitorProduct[]>([]);
  const [prices, setPrices] = useState<{
    [key: number]: Partial<CompetitorPriceCheckInput>;
  }>({});
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!selectedBrandId) return;
    const res = await productServices.getCompetitorProducts({
      category: selectedCategory,
      competitor_id: selectedBrandId,
    });
    setProducts(res);
  }, [selectedBrandId, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePriceChange = (
    id: number,
    field: string,
    value: string | number
  ) => {
    setPrices((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]:
          field === "discount_description" ? String(value) : Number(value),
      },
    }));
  };

  const handleSubmit = async () => {
    if (!userId) {
      alert("User not authenticated");
      return;
    }
    setLoading(true);
    try {
      const payload: CompetitorPriceCheckInput[] = products.map((p) => ({
        user_id: Number(userId),
        store_id: storeId,
        product_type: "competitor",
        competitor_product_id: p.competitor_product_id,
        category: p.category,
        regular_price: prices[p.competitor_product_id]?.regular_price ?? 0,
        deal_price: prices[p.competitor_product_id]?.deal_price,
        discount_description:
          prices[p.competitor_product_id]?.discount_description,
      }));
      await priceCheckServices.batchCreatePriceCheck(payload);
      alert("Qmimet u ngarkuan me sukses!");
      setPrices({});
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      const backendMessage =
        axiosError.response?.data?.error || "Gabim gjatë ngarkimit të qmimit.";
      alert(backendMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-semibold">Submit Competitor Prices</h2>

      <BrandSelector
        selectedBrandId={selectedBrandId}
        onBrandSelect={setSelectedBrandId}
      />

      {selectedBrandId && userId && (
        <AddProductForm
          competitor_id={selectedBrandId}
          category={selectedCategory}
          user_id={userId as number}
          onProductAdded={fetchProducts}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <ProductList
          products={products}
          prices={prices}
          onPriceChange={handlePriceChange}
        />

        <SubmitButton
          loading={loading}
          label="Dergo qmimet"
          loadingLabel="Duke i shfaqur..."
        />
      </form>
    </div>
  );
};

export default PriceCheckCompetitor;
