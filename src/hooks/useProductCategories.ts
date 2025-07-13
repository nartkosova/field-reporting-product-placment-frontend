import { useEffect, useState, useCallback } from "react";
import productServices from "../services/productServices";

export const useProductCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [businessUnits, setBusinessUnits] = useState<string[]>([]);
  const [unitToCategoriesMap, setUnitToCategoriesMap] = useState<
    Record<string, string[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = (await productServices.getProductCategories()) as {
          category: string;
          business_unit?: string;
        }[];

        // category list
        const allCategories = new Set<string>();
        // BU → categories
        const map: Record<string, Set<string>> = {};

        for (const p of products) {
          if (p.category) allCategories.add(p.category);
          if (p.business_unit) {
            if (!map[p.business_unit]) map[p.business_unit] = new Set();
            map[p.business_unit].add(p.category);
          }
        }

        const uniqueBusinessUnits = Object.keys(map);
        const unitCategoryMap: Record<string, string[]> = {};
        for (const unit of uniqueBusinessUnits) {
          unitCategoryMap[unit] = Array.from(map[unit]);
        }

        setCategories(Array.from(allCategories));
        setBusinessUnits(uniqueBusinessUnits);
        setUnitToCategoriesMap(unitCategoryMap);
      } catch (err) {
        console.error("Error fetching product categories:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoriesForBusinessUnit = useCallback(
    (unit: string) => unitToCategoriesMap[unit] ?? [],
    [unitToCategoriesMap]
  );

  return {
    categories,
    businessUnits,
    getCategoriesForBusinessUnit,
    isLoading,
    error,
  };
};
