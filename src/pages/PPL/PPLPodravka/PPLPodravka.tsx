import { useEffect, useMemo, useState } from "react";
import podravkaFacingsService from "../../../services/podravkaFacingsService";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PodravkaProduct, Product } from "../../../types/productInterface";
import productServices from "../../../services/productServices";
import { useSelectedStore } from "../../../hooks/useSelectStore";
import { queueFacings } from "../../../db/db";
import { isOnline } from "../../../utils/cacheManager";
import FacingsForm from "../../../components/FacingsForm/FacingsForm";

import Select from "react-select";
import darkSelectStyles from "../../../utils/darkSelectStyles";

const PodravkaFacingsFormPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [facings, setFacings] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [customProducts, setCustomProducts] = useState<PodravkaProduct[]>([]);
  const [allCategoryProducts, setAllCategoryProducts] = useState<
    PodravkaProduct[]
  >([]);
  const storeInfo = useSelectedStore();
  const id = storeInfo?.store_id || 0;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const storeId = id ? parseInt(id.toString()) : NaN;
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userId = userInfo?.id;
  const combinedProducts = useMemo(
    () => [...products, ...customProducts],
    [products, customProducts]
  );
  const [searchOptions, setSearchOptions] = useState<
    { label: string; value: number }[]
  >([]);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!selectedCategory) return;
      const all = await productServices.getProductsByCategory(selectedCategory);
      setAllCategoryProducts(all);
    };

    fetchCategoryProducts();
  }, [selectedCategory]);

  useEffect(() => {
    const options = allCategoryProducts
      .filter(
        (p) => !combinedProducts.find((cp) => cp.product_id === p.product_id)
      )
      .map((p) => ({
        label: `${p.name} - ${p.product_category}`,
        value: p.product_id!,
      }));
    setSearchOptions(options);
  }, [combinedProducts, allCategoryProducts]);

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

  const handleAddProduct = (productId: number) => {
    const product = allCategoryProducts.find((p) => p.product_id === productId);
    if (product && !customProducts.some((p) => p.product_id === productId)) {
      setCustomProducts((prev) => [...prev, product]);
    }
  };

  const handleFacingChange = (productId: number, value: number) => {
    setFacings({ ...facings, [productId]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const allProducts = [...products, ...customProducts];

    const facingData = allProducts
      .filter((product) => product.product_id !== undefined)
      .map((product) => ({
        user_id: userId,
        store_id: Number(storeId),
        product_id: product.product_id!,
        category: product.category,
        facings_count: facings[product.product_id!] || 0,
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

  const handleRemoveProduct = (productId: string | number) => {
    const numericProductId =
      typeof productId === "string" ? parseInt(productId, 10) : productId;

    setCustomProducts((prev) =>
      prev.filter((p) => p.product_id !== numericProductId)
    );

    setProducts((prev) =>
      prev.filter((p) => p.product_id !== numericProductId)
    );

    setFacings((prev) => {
      const updated = { ...prev };
      delete updated[numericProductId];
      return updated;
    });
  };

  const entries = combinedProducts
    .filter((p) => p.product_id !== undefined)
    .map((p) => ({
      id: p.product_id as number,
      label: `${p.name} - ${p.product_category}`,
      value: facings[p.product_id!] || 0,
      isCustom: customProducts.some((cp) => cp.product_id === p.product_id),
    }));
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center flex-1 py-8">
        <div className="w-full max-w-2xl mb-6">
          <Select
            options={searchOptions}
            onChange={(selected) => {
              if (selected) handleAddProduct(selected.value);
            }}
            styles={darkSelectStyles}
            placeholder="Shto produkt"
            isClearable
          />
        </div>
        <FacingsForm
          title="Podravka Facings"
          category={selectedCategory}
          entries={entries}
          productsLoading={productsLoading}
          loading={loading}
          onChange={(id, val) => handleFacingChange(Number(id), val)}
          onRemoveProduct={handleRemoveProduct}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default PodravkaFacingsFormPage;
