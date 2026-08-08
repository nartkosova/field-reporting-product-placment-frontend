export type ReportSelectorField = {
  path: string;
  label: string;
  adminOnly?: boolean;
};

export const reportSelectorFields: ReportSelectorField[] = [
  { path: "/ppl-reports", label: "Raportet PPL" },
  { path: "/photo-reports", label: "Raportet e Fotove" },
  { path: "/product-facings", label: "Raportet e Produkteve" },
  { path: "/presence", label: "Raport Presence" },
  { path: "/work-days", label: "Raporti i Dites se Punes", adminOnly: true },
];
