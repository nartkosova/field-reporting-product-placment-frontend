/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Select, { SingleValue } from "react-select";
import podravkaFacingsService from "../../services/podravkaFacingsService";
import { useUser } from "../../hooks/useUser";
import { PodravkaFacingInput } from "../../types/podravkaFacingInterface";
import { Store } from "../../types/storeInterface";

interface PresenceBatchStore {
  store_id: number;
  store_name: string;
  store_code?: number;
  store_category?: string;
  user_id: number;
  batch_id: string;
  created_at?: string;
}

interface PresenceBatchItem {
  podravka_facings_id: number;
  product_id: number;
  category: string;
  facings_count: number;
  is_listed?: boolean;
  record_type?: string;
  name: string;
}

interface PresenceProduct {
  product_id: number;
  name: string;
  category: string;
}

interface CategoryOption {
  value: string;
  label: string;
}

interface StoreOption {
  value: number;
  label: string;
  data: Store;
}

const UpdatePresenceBatch = () => {
  const { batchId = "" } = useParams();
  const { user } = useUser();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<PresenceProduct[]>([]);
  const [listedMap, setListedMap] = useState<Record<number, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!batchId) return;
      setLoading(true);
      try {
        const res = (await podravkaFacingsService.getPodravkaPresenceByBatchId(
          batchId
        )) as { store: PresenceBatchStore; items: PresenceBatchItem[] };

        if (!res?.items?.length) {
          setProducts([]);
          setListedMap({});
          setStore(null);
          return;
        }

        const first = res.store;
        setStore({
          store_id: first.store_id,
          store_name: first.store_name,
          store_code: first.store_code ?? 0,
          store_category: first.store_category ?? "",
          location: "",
        });

        const productMap = new Map<number, PresenceProduct>();
        res.items.forEach((item) => {
          if (item.product_id != null) {
            productMap.set(item.product_id, {
              product_id: item.product_id,
              name: item.name,
              category: item.category,
            });
          }
        });

        const sortedProducts = Array.from(productMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setProducts(sortedProducts);

        const initialMap = res.items.reduce<Record<number, boolean>>(
          (acc, item) => {
          if (item.product_id != null) {
            const listed =
              item.is_listed != null
                ? Boolean(item.is_listed)
                : item.facings_count === 1;
            acc[item.product_id] = listed;
          }
          return acc;
        }, {});

        setListedMap(initialMap);
      } catch (error) {
        console.error("Failed to fetch presence batch:", error);
        setToast({ type: "err", text: "Gabim gjatë ngarkimit të raportit." });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [batchId]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const storeOptions: StoreOption[] = useMemo(() => {
    if (!store) return [];
    return [
      {
        value: store.store_id,
        label: `${store.store_name} (${store.store_code}) - ${store.store_category}`,
        data: store,
      },
    ];
  }, [store]);

  const categoryOptions: CategoryOption[] = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    );
    return uniqueCategories.sort().map((c) => ({
      value: c,
      label: c,
    }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleCategoryChange = (selected: SingleValue<CategoryOption>) => {
    setSelectedCategory(selected ? selected.value : null);
  };

  const handleToggleListed = (productId: number, checked: boolean) => {
    setListedMap((prev) => ({ ...prev, [productId]: checked }));
  };

  const handleSave = async () => {
    if (!store?.store_id || !user?.user_id) {
      setToast({
        type: "err",
        text: "Duhet të zgjidhni marketin dhe përdoruesin.",
      });
      return;
    }

    setSaving(true);
    try {
      const payload: PodravkaFacingInput[] = products.map((p) => ({
        user_id: Number(user.user_id),
        store_id: Number(store.store_id),
        product_id: p.product_id,
        category: p.category || "Uncategorized",
        facings_count: listedMap[p.product_id] ? 1 : 0,
        record_type: "PRESENCE",
      }));

      await podravkaFacingsService.updatePodravkaBatch({
        batchId,
        facings: payload,
      });

      setToast({ type: "ok", text: "Presence u përditësua me sukses!" });
    } catch (error) {
      console.error("Failed to update presence:", error);
      setToast({ type: "err", text: "Gabim gjatë përditësimit." });
    } finally {
      setSaving(false);
    }
  };

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
            Edito Presence
          </h2>

          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1">
              <label className="text-xs text-neutral-400 mb-1 block pl-1">
                Marketi
              </label>
              <Select<StoreOption>
                options={storeOptions}
                value={storeOptions[0] ?? null}
                placeholder="Zgjedh një market..."
                isDisabled
                styles={selectStyles}
              />
            </div>

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
                isDisabled={!store}
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
                  const isChecked = !!listedMap[p.product_id];
                  return (
                    <tr
                      key={p.product_id}
                      className="hover:bg-neutral-900/40 cursor-pointer select-none"
                      onClick={() =>
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
                            handleToggleListed(p.product_id, e.target.checked)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}

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
                      Nuk u gjetën produkte në këtë kategori.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full flex justify-between items-center mt-6">
          <div className="text-neutral-500 text-sm">
            {store && !loading && (
              <span>
                Po shfaqen {filteredProducts.length} nga {products.length}{" "}
                produkte
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading || !store}
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

export default UpdatePresenceBatch;
