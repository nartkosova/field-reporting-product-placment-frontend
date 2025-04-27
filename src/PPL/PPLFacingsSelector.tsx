import { useEffect, useState } from "react";
import { NavLink, useParams, useLocation } from "react-router-dom";
import { Store } from "../types/storeInterface";
import podravkaFacingsService from "../Services/podravkaFacingsService";
import storeServices from "../Services/storeServices";
import Select from "react-select";

interface Product {
  category: string;
}

const FacingsSelector: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const storeId = id ? parseInt(id) : NaN;
  const location = useLocation();
  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    const fetchStoreAndCategories = async () => {
      try {
        const data = await storeServices.getStoreById(storeId);
        setStore(data);

        const products: Product[] =
          await podravkaFacingsService.getProductsByStoreId(storeId);
        const uniqueCategories = Array.from(
          new Set(products.map((p) => p.category))
        );
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (!isNaN(storeId)) fetchStoreAndCategories();
  }, [storeId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get("category");

    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
      localStorage.setItem("selectedCategory", categoryFromUrl);
    } else {
      // If URL doesn't have it, get it from localStorage
      const storedCategory = localStorage.getItem("selectedCategory");
      if (storedCategory) {
        setSelectedCategory(storedCategory);
      }
    }
  }, [location.search]);

  const handleCategoryChange = (
    selectedOption: { value: string; label: string } | null
  ) => {
    const category = selectedOption ? selectedOption.value : "";
    setSelectedCategory(category);
    localStorage.setItem("selectedCategory", category);
  };

  return (
    <div className="flex flex-col justify-center align-middle p-6 max-w-xl space-y-4 mx-auto">
      <p className="text-2xl font-semibold">
        Jeni ne shitoren {store?.store_name}, zgjidhni kategorine dhe opsionin e
        PPL.
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

      <NavLink
        to={`/ppl-store/${store?.store_id}/ppl-podravka?category=${selectedCategory}`}
      >
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 max-w-xl w-full"
          disabled={!selectedCategory}
        >
          PPL Podravka
        </button>
      </NavLink>

      <NavLink
        to={`/ppl/store/${store?.store_id}/ppl-konkurrenca?category=${selectedCategory}`}
      >
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 max-w-xl w-full"
          disabled={!selectedCategory}
        >
          PPL Konkurrenca
        </button>
      </NavLink>
    </div>
  );
};

export default FacingsSelector;
