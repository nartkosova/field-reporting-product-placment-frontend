import { useCallback } from "react";
import { AxiosError } from "axios";
import { ApiResponse } from "../types/common";
import { toast } from "../components/Toast/toast";

export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown, fallbackMessage?: string) => {
    console.error("Error occurred:", error);
    
    let message = fallbackMessage || "Ndodhi një gabim. Provo përsëri.";
    
    if (error instanceof AxiosError) {
      const apiResponse = error.response?.data as ApiResponse;
      message = apiResponse?.error || error.message || message;
    } else if (error instanceof Error) {
      message = error.message || message;
    } else if (typeof error === "string") {
      message = error;
    }
    
    toast.error(message);
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    fallbackMessage?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, fallbackMessage);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
  };
}; 