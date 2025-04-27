import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import BaseForm from "../Components/BaseForm/BaseForm";
import priceCheckServices from "../Services/priceCheckServices";
import podravkaFacingsService from "../Services/podravkaFacingsService";
type Entry = {
  product_id: number;
  name: string;
  category: string;
  regular_price?: number;
  deal_price?: number;
  discount_description?: string;
};

const PriceCheckPodravka = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const storeId = id ? parseInt(id) : NaN;
  const [products, setProducts] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userId = userInfo?.id;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const products = await podravkaFacingsService.getProductsByStoreId(
          storeId
        );
        const filtered = products.filter(
          (p: Entry) => p.category === selectedCategory
        );
        const initialEntries = filtered.map((p: Entry) => ({
          product_id: p.product_id,
          name: p.name,
          category: p.category,
          regular_price: undefined,
          deal_price: undefined,
          discount_description: "",
        }));
        setProducts(initialEntries);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!isNaN(storeId)) fetchProducts();
  }, [storeId, selectedCategory]);

  const handleEntryChange = (
    index: number,
    key: string,
    value: string | number
  ) => {
    setProducts((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [key]: value } : entry))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const priceData = products.map((product) => ({
        user_id: userId,
        store_id: storeId,
        product_id: product.product_id,
        category: product.category,
        regular_price: product.regular_price ?? 0,
        deal_price: product.deal_price ?? 0,
        discount_description: product.discount_description ?? "",
      }));

      await priceCheckServices.batchCreatePriceCheck(priceData);

      alert("Prices submitted successfully!");
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          regular_price: undefined,
          deal_price: undefined,
          discount_description: "",
        }))
      );
    } catch (err) {
      alert("Error submitting prices");
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fields: {
    key: string;
    label: string;
    type: "number" | "text" | "select";
  }[] = [
    { key: "regular_price", label: "Regular Price", type: "number" },
    { key: "deal_price", label: "Deal Price (Optional)", type: "number" },
    {
      key: "discount_description",
      label: "Discount Description (Optional)",
      type: "text",
    },
  ];

  return (
    <BaseForm
      entries={products}
      fields={fields}
      onChange={handleEntryChange}
      onSubmit={handleSubmit}
      title="Submit Product Prices"
      submitButtonLabel={loading ? "Submitting..." : "Submit Prices"}
    />
  );
};

export default PriceCheckPodravka;
