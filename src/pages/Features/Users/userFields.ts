export const userFields = [
  { name: "user", label: "Username" },
  { name: "password", label: "Fjalëkalimi", type: "password" },
  {
    name: "role",
    label: "Role",
    type: "select",
    required: true,
    options: [
      { label: "Admin", value: "admin" },
      { label: "Employee", value: "employee" },
      { label: "View Only", value: "viewer" },
    ],
  },
];

export const updateUserFields = [
  { name: "user", label: "Emri i përdoruesit" },
  { name: "password", label: "Fjalëkalimi i ri", type: "password" },
  {
    name: "role",
    label: "Roli",
    type: "select",
    required: true,
    options: [
      { label: "Admin", value: "admin" },
      { label: "Employee", value: "employee" },
      { label: "View Only", value: "viewer" },
    ],
  },
];
