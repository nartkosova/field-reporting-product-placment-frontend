import { useEffect, useState } from "react";
import { useParams, useLocation, NavLink } from "react-router-dom";
import Select from "react-select";
import storeServices from "../../Services/storeServices";
import podravkaFacingsService from "../../Services/podravkaFacingsService";
import { Store } from "../../types/storeInterface";

interface CategorySelectorProps {
  routeBase: string;
  buttonLinks: {
    label: string;
    path: string; // e.g. '/ppl-podravka'
  }[];
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  routeBase,
  buttonLinks,
}) => {
  const { id } = useParams<{ id: string }>();
  const storeId = id ? parseInt(id) : NaN;
  const location = useLocation();

  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const store = await storeServices.getStoreById(storeId);
        setStore(store);

        const products = await podravkaFacingsService.getProductsByStoreId(
          storeId
        );
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
        Jeni në shitoren {store?.store_name}, zgjidhni kategorinë dhe opsionin.
      </p>

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

      {buttonLinks.map(({ label, path }) => (
        <NavLink
          key={label}
          to={`${routeBase}/${store?.store_id}${path}?category=${selectedCategory}`}
        >
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 max-w-xl w-full"
            disabled={!selectedCategory}
          >
            {label}
          </button>
        </NavLink>
      ))}
    </div>
  );
};

export default CategorySelector;
