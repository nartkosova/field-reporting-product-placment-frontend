import React from "react";

type Variant = "primary" | "secondary" | "danger" | "outline" | "gray" | "icon";

type ActionButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: Variant;
  fullWidth?: boolean;
  className?: string;
};

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "bg-gray-200 hover:bg-gray-300 text-black cursor-pointer disabled:opacity-50",
  danger:
    "bg-red-600 text-white hover:bg-red-700 cursor-pointer disabled:opacity-50",
  outline: "border px-2 py-1 cursor-pointer rounded disabled:opacity-50",
  gray: "bg-gray-200 px-4 py-1 rounded hover:bg-gray-300 cursor-pointer",
  icon: "p-2 cursor-pointer text-sm",
};

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  children,
  disabled = false,
  type = "button",
  variant = "primary",
  fullWidth = false,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded ${variantStyles[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
};

export default ActionButton;
