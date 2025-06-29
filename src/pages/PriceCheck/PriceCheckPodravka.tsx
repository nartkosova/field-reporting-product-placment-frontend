import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import priceCheckServices from "../../services/priceCheckServices";
import {
  PriceCheckInput,
  PodravkaPriceCheckInput,
} from "../../types/priceCheckInterface";
import { Product } from "../../types/productInterface";
import { AxiosError } from "axios";
import productServices from "../../services/productServices";
import SubmitButton from "../../components/Buttons/SubmitButton";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import React from "react";

const PriceCheckPodravka = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [prices, setPrices] = useState<{ [key: number]: PriceCheckInput }>({});
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const storeId = id ? parseInt(id) : NaN;
  const userId = userInfo?.id;

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const all = await productServices.getProductsByStoreId(storeId);
        const filtered = all.filter(
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

  const handleChange = (
    productId: number,
    field: keyof PriceCheckInput,
    value: string | number
  ) => {
    setPrices((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]:
          field === "discount_description" ? String(value) : Number(value),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: PodravkaPriceCheckInput[] = products.map((product) => ({
        user_id: userId,
        store_id: storeId,
        product_type: "podravka",
        podravka_product_id: product.product_id,
        product_id: product.product_id,
        business_unit: product.business_unit,
        competitor_id: null,
        category: product.category,
        regular_price: prices[product.product_id]?.regular_price ?? 0,
        deal_price: prices[product.product_id]?.deal_price ?? undefined,
        discount_description:
          prices[product.product_id]?.discount_description ?? undefined,
      }));

      await priceCheckServices.batchCreatePriceCheck(payload);

      alert("Qmimet u ngarkuan me sukses!");
      setPrices({});
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      const backendMessage =
        axiosError.response?.data?.error || "Gabim gjatë ngarkimit të qmimit.";
      alert(backendMessage);
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">Submit Podravka Prices</h2>
      {productsLoading ? (
        <LoadingSpinner text="Loading products..." />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {products.map((product) => (
            <div
              key={product.product_id}
              className="border p-2 rounded space-y-2"
            >
              <label className="block font-medium">
                {product.name} ({product.category}) - {product.product_category}
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Regular Price"
                className="border p-2 w-full"
                min={0}
                value={prices[product.product_id]?.regular_price ?? ""}
                onChange={(e) =>
                  handleChange(
                    product.product_id,
                    "regular_price",
                    e.target.value
                  )
                }
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Deal Price (optional)"
                className="border p-2 w-full"
                min={0}
                value={prices[product.product_id]?.deal_price ?? ""}
                onChange={(e) =>
                  handleChange(product.product_id, "deal_price", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Discount Description (optional)"
                className="border p-2 w-full"
                value={prices[product.product_id]?.discount_description ?? ""}
                onChange={(e) =>
                  handleChange(
                    product.product_id,
                    "discount_description",
                    e.target.value
                  )
                }
              />
            </div>
          ))}

          <SubmitButton
            loading={loading}
            label="Dergo qmimet"
            loadingLabel="Duke i shfaqur..."
          />
        </form>
      )}
    </div>
  );
};

export default PriceCheckPodravka;
