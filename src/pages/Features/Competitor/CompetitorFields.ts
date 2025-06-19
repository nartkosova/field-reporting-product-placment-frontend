export const competitorFields = ({
  categoryOptions,
}: {
  categoryOptions: { label: string; value: string }[];
}) => [
  { name: "brand_name", label: "Emri i Konkurrencës" },
  {
    name: "categories",
    label: "Kategoritë",
    type: "select",
    isMulti: true,
    options: categoryOptions,
  },
];
