import { useEffect, useMemo, useState } from "react";
import podravkaFacingsService from "../../../services/podravkaFacingsService";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PodravkaProduct, Product } from "../../../types/productInterface";
import productServices from "../../../services/productServices";
import { useSelectedStore } from "../../../hooks/useSelectStore";
import { queueFacings } from "../../../db/db";
import { isOnline } from "../../../utils/cacheManager";
import FacingsForm from "../../../components/FacingsForm/FacingsForm";
import { useUser } from "../../../hooks/useUser";
import Select from "react-select";
import darkSelectStyles from "../../../utils/darkSelectStyles";
import storeServices from "../../../services/storeServices";

const PodravkaFacingsFormPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [otherStoreProducts, setOtherStoreProducts] = useState<
    PodravkaProduct[]
  >([]);
  const [customProducts, setCustomProducts] = useState<PodravkaProduct[]>([]);
  const [facings, setFacings] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchOptions, setSearchOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [unlistedProducts, setUnlistedProducts] = useState<number[]>([]);

  const storeInfo = useSelectedStore();
  const id = storeInfo?.store_id || 0;
  const storeId = id ? parseInt(id.toString()) : NaN;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const { user } = useUser();
  const userId = user?.user_id;

  const combinedProducts = useMemo(
    () => [...products, ...customProducts],
    [products, customProducts]
  );

  // Get products listed for current store
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
        console.error("Error fetching store products:", err);
      } finally {
        setProductsLoading(false);
      }
    };
    if (storeId && selectedCategory) fetchProducts();
  }, [storeId, selectedCategory]);

  // Get products listed in other stores
  useEffect(() => {
    const fetchOthers = async () => {
      try {
        const other = await storeServices.getOtherStoreProducts(storeId);
        setOtherStoreProducts(other);
      } catch (err) {
        console.error("Error fetching other-store products:", err);
      }
    };
    if (storeId && selectedCategory) fetchOthers();
  }, [storeId, selectedCategory]);

  // Build search dropdown
  useEffect(() => {
    const unique = [...products, ...otherStoreProducts].filter(
      (p, i, arr) => arr.findIndex((x) => x.product_id === p.product_id) === i
    );

    const filtered = unique
      .filter((p) => p.category === selectedCategory)
      .filter((p) => {
        const isSelected = combinedProducts.some(
          (cp) => cp.product_id === p.product_id
        );
        const isUnlisted = unlistedProducts.includes(p.product_id!);
        return !isSelected || isUnlisted;
      });

    const options = filtered.map((p) => ({
      label: `${p.name} - ${p.product_category}`,
      value: p.product_id!,
    }));

    setSearchOptions(options);
  }, [
    products,
    otherStoreProducts,
    combinedProducts,
    unlistedProducts,
    selectedCategory,
  ]);

  const handleAddProduct = (productId: number) => {
    const allAvailable = [...products, ...otherStoreProducts];
    const product = allAvailable.find((p) => p.product_id === productId);
    if (product) {
      setCustomProducts((prev) => [...prev, product as PodravkaProduct]);
      setUnlistedProducts((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleRemoveProduct = (productId: string | number) => {
    const id = typeof productId === "string" ? parseInt(productId) : productId;
    setUnlistedProducts((prev) => [...new Set([...prev, id])]);
    setCustomProducts((prev) => prev.filter((p) => p.product_id !== id));
    setProducts((prev) => prev.filter((p) => p.product_id !== id));
    setFacings((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleFacingChange = (productId: number, value: number) => {
    setFacings((prev) => ({ ...prev, [productId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!userId) {
      alert("User not authenticated");
      setLoading(false);
      return;
    }

    const allProducts = [...products, ...customProducts];

    const listedFacings = allProducts
      .filter((p) => p.product_id !== undefined)
      .map((p) => ({
        user_id: Number(userId),
        store_id: Number(storeId),
        product_id: p.product_id!,
        category: p.category,
        facings_count: facings[p.product_id!] || 0,
        is_listed: true,
      }));

    const unlistedFacings = unlistedProducts.map((id) => {
      const product = [...products, ...otherStoreProducts].find(
        (p) => p.product_id === id
      );
      return {
        user_id: Number(userId),
        store_id: Number(storeId),
        product_id: id,
        category: product?.category || selectedCategory,
        facings_count: 0,
        is_listed: false,
      };
    });

    const facingData = [...listedFacings, ...unlistedFacings];

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

  const entries = combinedProducts
    .filter((p) => !unlistedProducts.includes(p.product_id!))
    .map((p) => ({
      id: p.product_id!,
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
            onChange={(selected) =>
              selected && handleAddProduct(selected.value)
            }
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
