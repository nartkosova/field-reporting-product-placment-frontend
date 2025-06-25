/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Select from "react-select";
// import storeServices from "../../services/storeServices";
// import { Store } from "../../types/storeInterface";
import productServices from "../../services/productServices";
import { useSelectedStore } from "../../hooks/useSelectStore";
import { NavButton } from "../NavButton/NavButton";
interface CategorySelectorProps {
  routeBase: string;
  buttonLinks: {
    label: string;
    path: string;
  }[];
  categoryRequired?: boolean;
  textRendered?: boolean;
  storeRequired?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  routeBase,
  buttonLinks,
  categoryRequired = true,
  textRendered = true,
  storeRequired = true,
}) => {
  const selectedStore = useSelectedStore();
  const storeId = selectedStore?.store_id || 0;
  const location = useLocation();
  const company = useParams<{ company: string }>().company;

  // const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (!storeRequired && !categoryRequired) return;

    const fetchData = async () => {
      try {
        // const store = await storeServices.getStoreById(storeId);
        // setStore(store);

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
  }, [storeId, storeRequired, categoryRequired]);

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
    <div className="flex flex-col w-full justify-center items-center bg-black shadow-lg space-y-6">
      {textRendered && (
        <p className="text-2xl font-bold text-white text-center mb-6">
          Jeni në shitoren{" "}
          <span className="text-neutral-300">{selectedStore?.store_name}</span>
          {categoryRequired && (
            <span className="text-gray-400">
              , zgjidhni kategorinë dhe opsionin.
            </span>
          )}
        </p>
      )}
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
          styles={{
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
              backgroundColor: state.isSelected
                ? "#27272a"
                : state.isFocused
                ? "#27272a"
                : "#18181b",
              color: "#fff",
            }),
            singleValue: (provided: any) => ({
              ...provided,
              color: "#fff",
            }),
            multiValue: (provided: any) => ({
              ...provided,
              backgroundColor: "#27272a",
              color: "#fff",
            }),
            input: (provided: any) => ({
              ...provided,
              color: "#fff",
            }),
          }}
        />
      )}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        {buttonLinks.map(({ label, path }) => {
          const categoryNotRequired =
            label.toLowerCase() === "fletushka" ||
            label.toLowerCase() === "korporative";
          const storeSegment = storeId ? `/${storeId}` : "";
          const companySegment = company ? `/${company}` : "";

          const fullPath = !storeRequired
            ? `${routeBase}${path}`
            : categoryNotRequired
            ? `${routeBase}${storeSegment}${companySegment}${path}`
            : categoryRequired
            ? `${routeBase}${storeSegment}${companySegment}${path}?category=${selectedCategory}`
            : `${routeBase}${storeSegment}${companySegment}${path}`;
          const isDisabled = categoryNotRequired
            ? !!selectedCategory
            : categoryRequired && !selectedCategory;

          return (
            // <div className="flex flex-col justify-center items-center bg-black shadow-lg space-y-6">
            <NavButton
              key={label}
              to={fullPath}
              disabled={isDisabled}
              variant="card"
            >
              {label}
            </NavButton>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;
