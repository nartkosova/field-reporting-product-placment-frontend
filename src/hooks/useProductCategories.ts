import { useEffect, useState } from "react";
import productServices from "../services/productServices";

export const useProductCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [businessUnits, setBusinessUnits] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = (await productServices.getProducts()) as {
          category: string;
          business_unit?: string;
        }[];

        const uniqueCategories = Array.from(
          new Set(products.map((p) => p.category))
        );

        const uniqueBusinessUnits = Array.from(
          new Set(
            products.map((p) => p.business_unit).filter((b): b is string => !!b)
          )
        );

        setCategories(uniqueCategories);
        setBusinessUnits(uniqueBusinessUnits);
      } catch (err) {
        console.error("Error fetching product categories:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { categories, businessUnits, isLoading, error };
};
