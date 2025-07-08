type Variant = "primary" | "secondary" | "danger" | "gray" | "icon" | "fut";

type ActionButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: Variant;
  fullWidth?: boolean;
  className?: string;
  scrollToTop?: boolean; // allow opt-out if needed
};

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-neutral-800 text-white hover:bg-neutral-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-neutral-700 ",
  secondary:
    "bg-neutral-900 text-gray-200 hover:bg-neutral-800 border border-neutral-800 cursor-pointer disabled:opacity-50",
  danger:
    "bg-red-600 text-white hover:bg-red-700 cursor-pointer disabled:opacity-50",

  gray: "bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-800 text-gray-100 px-4 py-2 rounded border border-neutral-600 shadow-inner hover:brightness-110 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
  icon: "p-2 cursor-pointer text-sm text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800",
  fut: "bg-neutral-900 text-white border-2 border-white font-bold px-6 py-2 rounded-lg shadow hover:bg-neutral-800 hover:border-neutral-400 transition-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
};

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  children,
  disabled = false,
  type = "button",
  variant = "primary",
  fullWidth = false,
  className = "",
  scrollToTop = true,
}) => {
  const handleClick = () => {
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    onClick?.();
  };

  return (
    <button
      type={type}
      onClick={handleClick}
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
