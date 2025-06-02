import { useEffect, useState } from "react";
import podravkaFacingsService from "../services/podravkaFacingsService";

export const useProductCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = (await podravkaFacingsService.getProducts()) as {
          category: string;
        }[];
        const uniqueCategories = Array.from(
          new Set(products.map((p) => p.category))
        );
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching product categories:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { categories, isLoading, error };
};
