import { useNavigate } from "react-router-dom";

export interface NavButtonProps {
  to: string;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: "default" | "card";
  scrollToTop?: boolean;
}

export const NavButton: React.FC<NavButtonProps> = ({
  to,
  children,
  disabled = false,
  variant = "default",
  scrollToTop = true,
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Delay navigation slightly to allow smooth scroll to start
    setTimeout(() => navigate(to), 0);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={
        variant === "card"
          ? "w-full h-full bg-neutral-900 border border-neutral-800 shadow-lg rounded-2xl px-6 py-8 text-xl font-semibold text-white flex items-center justify-center transition-none cursor-pointer hover:border-white/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          : "bg-neutral-800 text-white px-4 py-2 rounded cursor-pointer w-full hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed border border-neutral-700"
      }
    >
      {children}
    </button>
  );
};
