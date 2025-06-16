import { useEffect, useState } from "react";
import { useParams, useLocation, NavLink } from "react-router-dom";
import Select from "react-select";
import storeServices from "../../services/storeServices";
import { Store } from "../../types/storeInterface";
import productServices from "../../services/productServices";

interface CategorySelectorProps {
  routeBase: string;
  buttonLinks: {
    label: string;
    path: string;
  }[];
  categoryRequired?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  routeBase,
  buttonLinks,
  categoryRequired = true,
}) => {
  const { id } = useParams<{ id: string }>();
  const storeId = id ? parseInt(id) : NaN;
  const location = useLocation();
  const company = useParams<{ company: string }>().company;

  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const store = await storeServices.getStoreById(storeId);
        setStore(store);

        const products = await productServices.getProductsByStoreId(storeId);
        const uniqueCategories: string[] = Array.from(
          new Set(products.map((p: { category: string }) => p.category))
        );
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    if (!isNaN(storeId)) fetchData();
  }, [storeId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlCategory = params.get("category");

    if (urlCategory) {
      setSelectedCategory(urlCategory);
      localStorage.setItem("selectedCategory", urlCategory);
    } else {
      const stored = localStorage.getItem("selectedCategory");
      if (stored) setSelectedCategory(stored);
    }
  }, [location.search]);

  const handleCategoryChange = (
    selectedOption: { value: string; label: string } | null
  ) => {
    const category = selectedOption?.value || "";
    setSelectedCategory(category);
    localStorage.setItem("selectedCategory", category);
  };

  return (
    <div className="flex flex-col justify-center align-middle p-6 max-w-xl space-y-4 mx-auto">
      <p className="text-2xl font-semibold">
        Jeni në shitoren {store?.store_name}
        {categoryRequired && ", zgjidhni kategorinë dhe opsionin."}
      </p>

      {categoryRequired && (
        <Select
          className="w-full"
          options={categories.map((cat) => ({ value: cat, label: cat }))}
          value={
            selectedCategory
              ? { value: selectedCategory, label: selectedCategory }
              : null
          }
          onChange={handleCategoryChange}
          placeholder="Zgjidh kategorinë..."
          isClearable
        />
      )}

      {buttonLinks.map(({ label, path }) => {
        const categoryNotRequired =
          label.toLowerCase() === "fletushka" ||
          label.toLowerCase() === "korporative";
        const storeSegment = store?.store_id ? `/${store.store_id}` : "";
        const companySegment = company ? `/${company}` : "";

        const fullPath = categoryNotRequired
          ? `${routeBase}${storeSegment}${companySegment}${path}`
          : categoryRequired
          ? `${routeBase}${storeSegment}${companySegment}${path}?category=${selectedCategory}`
          : `${routeBase}${storeSegment}${companySegment}${path}`;

        const isDisabled = categoryNotRequired
          ? !!selectedCategory
          : categoryRequired && !selectedCategory;

        return (
          <NavLink key={label} to={fullPath}>
            <button
              className={`px-4 py-2 rounded cursor-pointer max-w-xl w-full ${
                isDisabled
                  ? "bg-blue-600 opacity-70 text-gray-200 !cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              disabled={isDisabled}
            >
              {label}
            </button>
          </NavLink>
        );
      })}
    </div>
  );
};

export default CategorySelector;
