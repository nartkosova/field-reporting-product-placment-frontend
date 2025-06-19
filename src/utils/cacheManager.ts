import { Product } from "../types/productInterface";

export const clearApiCache = async () => {
  if ("caches" in window) {
    try {
      const cacheNames = await caches.keys();
      const apiCache = cacheNames.find(
        (name) => name === "podravka-api-cache-v1"
      );
      if (apiCache) {
        await caches.delete(apiCache);
      }
    } catch (error) {
      console.error("Error clearing API cache:", error);
    }
  }
};

export const isOnline = () => {
  return navigator.onLine;
};

export const handleOfflineError = (error: Error) => {
  if (!isOnline()) {
    return {
      error: "You are offline. Please check your internet connection.",
      isOffline: true,
    };
  }
  return {
    error: error.message || "An error occurred",
    isOffline: false,
  };
};

export const getCachedStoreProducts = (storeId: number) => {
  try {
    const cachedProducts = localStorage.getItem(`store_${storeId}_products`);
    console.log("Cached products retrieved successfully", cachedProducts);
    return cachedProducts ? JSON.parse(cachedProducts) : null;
  } catch (error) {
    console.error("Error retrieving cached products:", error);
    return null;
  }
};

export const cacheStoreProducts = async (
  storeId: number,
  products: Product[]
) => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("store_") &&
        key.endsWith("_products") &&
        key !== `store_${storeId}_products`
      ) {
        localStorage.removeItem(key);
      }
    });

    localStorage.setItem(`store_${storeId}_products`, JSON.stringify(products));
    return true;
  } catch (error) {
    console.error("Error caching products:", error);
    return false;
  }
};
