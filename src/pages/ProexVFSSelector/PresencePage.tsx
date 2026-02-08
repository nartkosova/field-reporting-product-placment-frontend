/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import Select, { SingleValue } from "react-select";
import { Store } from "../../types/storeInterface";
import productServices from "../../services/productServices";
import podravkaFacingsService from "../../services/podravkaFacingsService";
import { clearApiCache } from "../../utils/cacheManager";
import { useSelectedStore } from "../../hooks/useSelectStore";
import { useUser } from "../../hooks/useUser";
import { PodravkaProduct } from "../../types/productInterface";

interface StoreOption {
  value: number;
  label: string;
  data: Store;
}

interface CategoryOption {
  value: string;
  label: string;
}

type FetchStores = () => Promise<Store[]>;

interface PresencePageProps {
  title: string;
  fetchStores: FetchStores;
  recordType: string;
}

const PresencePage = ({
  title,
  fetchStores,
  recordType,
}: PresencePageProps) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // Products State
  const [products, setProducts] = useState<PodravkaProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [listedMap, setListedMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const storeInfo = useSelectedStore();
  const { user } = useUser();

  // 1. Load Stores
  useEffect(() => {
    const loadStores = async () => {
      try {
        const res = await fetchStores();
        setStores(res);
      } catch (error) {
        console.error("Failed to fetch stores:", error);
        setToast({ type: "err", text: "Gabim në ngarkimin e marketeve." });
      }
    };
    loadStores();
  }, [fetchStores]);

  // 2. Load ALL Products when store changes
  useEffect(() => {
    const loadProducts = async () => {
      if (!selectedStore?.store_id) {
        setProducts([]);
        setListedMap({});
        return;
      }

      setLoading(true);
      try {
        // Fetch ALL products (no arguments = default fetch all in your updated service)
        const res = await productServices.getProducts();

        setProducts(res);

        // Initialize listedMap
        setListedMap((prev) => {
          const newMap = { ...prev };
          res.forEach((p: PodravkaProduct) => {
            if (
              p.product_id !== undefined &&
              newMap[p.product_id] === undefined
            ) {
              newMap[p.product_id] = false;
            }
          });
          return newMap;
        });
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setToast({ type: "err", text: "Gabim në ngarkimin e produkteve." });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedStore?.store_id]);

  // 3. Auto-select store from context
  useEffect(() => {
    if (!selectedStore && storeInfo?.store_id && stores.length) {
      const match = stores.find((s) => s.store_id === storeInfo.store_id);
      if (match) setSelectedStore(match);
    }
  }, [selectedStore, storeInfo?.store_id, stores]);

  // 4. Toast Timer
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // --- Derived Data & Memos ---

  const storeOptions: StoreOption[] = useMemo(
    () =>
      stores
        .slice()
        .sort((a, b) => a.store_name.localeCompare(b.store_name))
        .map((store) => ({
          value: store.store_id,
          label: `${store.store_name} (${store.store_code}) - ${store.store_category}`,
          data: store,
        })),
    [stores]
  );

  // Extract unique categories for the filter dropdown
  const categoryOptions: CategoryOption[] = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    );
    return uniqueCategories.sort().map((c) => ({
      value: c,
      label: c,
    }));
  }, [products]);

  // Filter products based on selection
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  // --- Handlers ---

  const handleStoreChange = async (selected: SingleValue<StoreOption>) => {
    if (!selected) {
      setSelectedStore(null);
      localStorage.removeItem("selectedStore");
      setProducts([]);
      return;
    }
    const s = selected.data;
    setSelectedStore(s);
    localStorage.setItem("selectedStore", JSON.stringify(s));
    await clearApiCache();
  };

  const handleCategoryChange = (selected: SingleValue<CategoryOption>) => {
    setSelectedCategory(selected ? selected.value : null);
  };

  const handleToggleListed = (productId: number, checked: boolean) => {
    setListedMap((prev) => ({ ...prev, [productId]: checked }));
  };

  const handleSave = async () => {
    if (!selectedStore?.store_id || !user?.user_id) {
      setToast({
        type: "err",
        text: "Duhet të zgjidhni marketin dhe përdoruesin.",
      });
      return;
    }

    setSaving(true);
    try {
      // NOTE: We map over 'products' (ALL items), not 'filteredProducts'.
      // This ensures we save checks even for categories currently hidden by the filter.
      const payload = products
        .filter((p) => p.product_id !== undefined)
        .map((p) => ({
          user_id: Number(user.user_id),
          store_id: Number(selectedStore.store_id),
          product_id: p.product_id!,
          category: p.category || "Uncategorized",
          facings_count: listedMap[p.product_id!] ? 1 : 0,
          record_type: recordType,
        }));

      await podravkaFacingsService.batchCreatePodravkaFacings(payload);
      setToast({ type: "ok", text: "Presence u ruajt me sukses!" });
    } catch (error) {
      console.error("Failed to save presence:", error);
      setToast({ type: "err", text: "Gabim gjatë ruajtjes." });
    } finally {
      setSaving(false);
    }
  };

  // Shared Select Styles
  const selectStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: "#18181b",
      borderColor: "#27272a",
      color: "#fff",
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "#18181b",
      color: "#fff",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#27272a" : "#18181b",
      color: "#fff",
    }),
    singleValue: (provided: any) => ({ ...provided, color: "#fff" }),
    input: (provided: any) => ({ ...provided, color: "#fff" }),
    placeholder: (provided: any) => ({ ...provided, color: "#9ca3af" }),
  };

  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-5xl flex flex-col items-center justify-center flex-1 py-8">
        <div className="w-full max-w-4xl mb-4">
          <h2 className="font-extrabold text-white mb-6 tracking-tight text-center drop-shadowtext-lg">
            {title}
          </h2>

          <div className="flex gap-4 flex-col sm:flex-row">
            {/* Store Select */}
            <div className="flex-1">
              <label className="text-xs text-neutral-400 mb-1 block pl-1">
                Marketi
              </label>
              <Select<StoreOption>
                options={storeOptions}
                onChange={handleStoreChange}
                placeholder="Zgjedh një market..."
                value={
                  selectedStore
                    ? {
                        value: selectedStore.store_id,
                        label: `${selectedStore.store_name} (${selectedStore.store_code}) - ${selectedStore.store_category}`,
                        data: selectedStore,
                      }
                    : null
                }
                isClearable
                styles={selectStyles}
              />
            </div>

            {/* Category Filter */}
            <div className="w-full sm:w-64">
              <label className="text-xs text-neutral-400 mb-1 block pl-1">
                Filtro Kategorinë
              </label>
              <Select<CategoryOption>
                options={categoryOptions}
                onChange={handleCategoryChange}
                placeholder="Të gjitha kategoritë"
                isClearable
                styles={selectStyles}
                isDisabled={!selectedStore}
              />
            </div>
          </div>
        </div>

        <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl shadow-lg overflow-hidden flex flex-col h-auto max-h-[600px] relative z-0">
          <div className="w-full overflow-y-auto flex-1">
            <table className="min-w-full text-sm text-left text-neutral-200 relative">
              <thead className="bg-neutral-900 text-neutral-400 uppercase text-xs sticky top-0 z-10 shadow-md">
                <tr>
                  <th className="px-4 py-3 bg-neutral-900">Produkti</th>
                  <th className="px-4 py-3 bg-neutral-900">Kategoria</th>
                  <th className="px-4 py-3 bg-neutral-900 text-center">
                    E Listuar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredProducts.map((p) => {
                  const isChecked = !!(p.product_id && listedMap[p.product_id]);
                  return (
                    <tr
                      key={p.product_id}
                      className="hover:bg-neutral-900/40 cursor-pointer select-none"
                      onClick={() =>
                        p.product_id &&
                        handleToggleListed(p.product_id, !isChecked)
                      }
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-neutral-400">
                        {p.category}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-blue-600 cursor-pointer"
                          checked={isChecked}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            p.product_id &&
                            handleToggleListed(p.product_id, e.target.checked)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}

                {/* Empty / Loading States */}
                {loading && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-12 text-center text-neutral-500"
                    >
                      Duke ngarkuar produktet...
                    </td>
                  </tr>
                )}

                {!loading && filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-12 text-center text-neutral-500"
                    >
                      {selectedStore
                        ? "Nuk u gjetën produkte në këtë kategori."
                        : "Zgjidhni një market për të parë produktet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full flex justify-between items-center mt-6">
          <div className="text-neutral-500 text-sm">
            {selectedStore && !loading && (
              <span>
                Po shfaqen {filteredProducts.length} nga {products.length}{" "}
                produkte
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading || !selectedStore}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
          >
            {saving ? "Duke ruajtur..." : "Ruaj"}
          </button>
        </div>

        {toast && (
          <div
            className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white ${
              toast.type === "ok" ? "bg-emerald-600" : "bg-red-600"
            }`}
          >
            {toast.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default PresencePage;
