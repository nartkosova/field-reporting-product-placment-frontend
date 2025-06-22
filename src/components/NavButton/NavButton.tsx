import { NavLink } from "react-router-dom";

export interface NavButtonProps {
  to: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const NavButton: React.FC<NavButtonProps> = ({
  to,
  children,
  disabled = false,
}) => (
  <NavLink to={to}>
    <button
      disabled={disabled}
      className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer w-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  </NavLink>
);
