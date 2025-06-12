export const userFields = ({
  userOptions,
}: {
  userOptions: { label: string; value: number }[];
}) => [
  {
    name: "store_name",
    label: "Emri i dyqanit",
  },
  {
    name: "store_code",
    label: "Kodi i dyqanit",
    type: "number",
  },
  {
    name: "store_channel",
    label: "Kanali i dyqanit",
    type: "select",
    options: [
      { label: "MT", value: "MT" },
      { label: "TT", value: "TT" },
    ],
  },
  {
    name: "store_category",
    label: "Kategoria e dyqanit",
    type: "select",
    options: [
      { label: "A", value: "A" },
      { label: "B", value: "B" },
      { label: "C", value: "C" },
      { label: "D", value: "D" },
      { label: "E", value: "E" },
      { label: "F", value: "F" },
      { label: "G", value: "G" },
    ],
  },
  {
    name: "user_id",
    label: "Përdoresi",
    type: "select",
    options: userOptions,
  },
  {
    name: "sales_rep",
    label: "Përfaqësuesi i Shitjes",
  },
  {
    name: "location",
    label: "Lokacioni",
  },
];
