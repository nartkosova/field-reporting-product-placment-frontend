/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
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

  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [storeCategories, setStoreCategories] = useState<string[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (!categoryRequired) return;

    const fetchCategories = async () => {
      try {
        const response = await productServices.getProductCategories();
        const normalizedCategories = Array.isArray(response)
          ? response
              .map((item: { category?: string } | string) =>
                typeof item === "string" ? item : item?.category ?? ""
              )
              .filter((category): category is string => Boolean(category))
          : [];
        const uniqueCategories = Array.from(new Set(normalizedCategories));

        setAllCategories(uniqueCategories);
        localStorage.setItem(
          "allProductCategories",
          JSON.stringify(uniqueCategories)
        );
      } catch (err) {
        console.error("Error fetching product categories:", err);
        const cachedCategories = localStorage.getItem("allProductCategories");
        if (cachedCategories) {
          setAllCategories(JSON.parse(cachedCategories));
        }
      }
    };

    fetchCategories();
  }, [categoryRequired]);

  useEffect(() => {
    if (!categoryRequired || !storeRequired || !storeId) {
      setStoreCategories([]);
      return;
    }

    const fetchStoreCategories = async () => {
      try {
        const products = await productServices.getProductsByStoreId(storeId);
        const uniqueCategories: string[] = Array.from(
          new Set(
            products
              .map((p: { category?: string }) => p.category ?? "")
              .filter((category: string): category is string =>
                Boolean(category)
              )
          )
        );
        setStoreCategories(uniqueCategories);

        const storeCategoriesKey = `store_${storeId}_categories`;
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith("store_") &&
            key.endsWith("_categories") &&
            key !== storeCategoriesKey
          ) {
            localStorage.removeItem(key);
          }
        });

        localStorage.setItem(
          storeCategoriesKey,
          JSON.stringify(uniqueCategories)
        );
      } catch (err) {
        console.error("Error fetching store categories:", err);
        const cachedStoreCategories = localStorage.getItem(
          `store_${storeId}_categories`
        );
        if (cachedStoreCategories) {
          setStoreCategories(JSON.parse(cachedStoreCategories));
        }
      }
    };

    fetchStoreCategories();
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

  useEffect(() => {
    if (!selectedCategory) return;

    const categoryExistsGlobally =
      allCategories.length === 0 || allCategories.includes(selectedCategory);
    if (!categoryExistsGlobally) {
      setSelectedCategory("");
      localStorage.removeItem("selectedCategory");
      return;
    }

    const categoryExistsInStore =
      storeCategories.length === 0 ||
      storeCategories.includes(selectedCategory);

    if (!showAllCategories && !categoryExistsInStore) {
      setShowAllCategories(true);
    }
  }, [selectedCategory, allCategories, storeCategories, showAllCategories]);

  const categories = useMemo(() => {
    if (showAllCategories || !storeCategories.length) {
      return allCategories;
    }
    return storeCategories;
  }, [allCategories, storeCategories, showAllCategories]);

  const handleCategoryChange = (
    selectedOption: { value: string; label: string } | null
  ) => {
    const category = selectedOption?.value || "";
    setSelectedCategory(category);
    if (category) {
      localStorage.setItem("selectedCategory", category);
    } else {
      localStorage.removeItem("selectedCategory");
    }
  };

  const handleToggleAllCategories = () => {
    setShowAllCategories((prev) => !prev);
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
        <div className="w-full space-y-3">
          {storeRequired &&
            storeCategories.length > 0 &&
            allCategories.length > 0 && (
              <label className="flex items-center space-x-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={showAllCategories}
                  onChange={handleToggleAllCategories}
                  className="w-6 h-6 appearance-none rounded border border-neutral-700 bg-neutral-900 checked:bg-blue-600 checked:border-blue-600 focus:outline-1 cursor-pointer transition-colors"
                />
                <span>Shfaq të gjitha kategoritë</span>
              </label>
            )}
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
        </div>
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
