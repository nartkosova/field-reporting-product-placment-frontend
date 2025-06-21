import { Store } from "../../types/storeInterface";

export const userNavItems = (storeInfo: Store | null) => [
  {
    to: `/ppl-store/${storeInfo?.store_id || ""}`,
    label: "PPL",
    disabled: !storeInfo,
    ariaLabel: "PPL Store",
  },
  { to: "/ppl-podravka", label: "Edito PPL Podravka" },
  { to: "/ppl-konkurrenca", label: "Edito PPL Konkurrenca" },
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
  { to: "/photos/report", label: "Raportet e Fotove" },
  { to: "/settings", label: "Krijo/Edito" },
];
