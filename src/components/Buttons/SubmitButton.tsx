import React from "react";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import { ButtonVariant } from "../../types/common";

type SubmitButtonProps = {
  loading?: boolean;
  label: string;
  loadingLabel?: string;
  className?: string;
  variant?: ButtonVariant;
};

const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading = false,
  label,
  loadingLabel = "Duke u ngarkuar...",
  className = "",
  variant = "primary",
}) => {
  const variantClasses = {
    primary: "bg-neutral-800 hover:bg-neutral-700 border-neutral-700",
    secondary: "bg-neutral-700 hover:bg-neutral-600 border-neutral-600",
    danger: "bg-red-600 hover:bg-red-700 border-red-700",
    success: "bg-green-600 hover:bg-green-700 border-green-700",
  };

  return (
    <button
      type="submit"
      disabled={loading}
      className={`text-white px-4 py-2 w-full rounded border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <LoadingSpinner
          text={loadingLabel}
          size="sm"
          className="!flex-row space-x-2"
        />
      ) : (
        label
      )}
    </button>
  );
};

export default SubmitButton;
