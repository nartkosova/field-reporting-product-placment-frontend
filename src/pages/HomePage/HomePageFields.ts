import { Store } from "../../types/storeInterface";

export const userNavItems = (storeInfo: Store | null) => [
  {
    to: `/ppl-store/${storeInfo?.store_id || ""}`,
    label: "PPL",
    disabled: !storeInfo,
    ariaLabel: "PPL Store",
  },
  { to: "/edit-ppl", label: "Edito PPL" },
  {
    to: `/photos/${storeInfo?.store_id || ""}`,
    label: "Krijo Foto",
    disabled: !storeInfo,
  },
  { to: "/photos/edit", label: "Edito Fotot" },
  { to: "/reports", label: "Raporte" },
];

export const adminNavItems = [
  { to: "/reports", label: "Raporte" },
  { to: "/settings", label: "Krijo/Edito" },
];
