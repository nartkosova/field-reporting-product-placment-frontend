import React from "react";

type SubmitButtonProps = {
  loading?: boolean;
  label: string;
  loadingLabel?: string;
  className?: string;
};

const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading = false,
  label,
  loadingLabel = "Submitting...",
  className = "",
}) => {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`bg-neutral-800 text-white px-4 py-2 w-full rounded hover:bg-neutral-700 border border-neutral-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? loadingLabel : label}
    </button>
  );
};

export default SubmitButton;
