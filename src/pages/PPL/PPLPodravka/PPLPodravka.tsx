import { useEffect, useState } from "react";
import podravkaFacingsService from "../../../services/podravkaFacingsService";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Product } from "../../../types/productInterface";
import productServices from "../../../services/productServices";
import { useSelectedStore } from "../../../hooks/useSelectStore";
import { queueFacings } from "../../../db/db";
import { isOnline } from "../../../utils/cacheManager";
import FacingsForm from "../../../components/FacingsForm/FacingsForm";
import React from "react";

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

  const entries = products.map((p) => ({
    id: p.product_id,
    label: `${p.name} - ${p.product_category}`,
    value: facings[p.product_id] || 0,
  }));
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center flex-1 py-8">
        <FacingsForm
          title="Podravka Facings"
          category={selectedCategory}
          entries={entries}
          productsLoading={productsLoading}
          loading={loading}
          onChange={(id, val) => handleFacingChange(Number(id), val)}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default PodravkaFacingsFormPage;
