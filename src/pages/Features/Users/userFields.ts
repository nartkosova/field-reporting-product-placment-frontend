export const userFields = [
  { name: "user", label: "Username" },
  { name: "password", label: "Password", type: "password" },
  {
    name: "role",
    label: "Role",
    type: "select",
    options: [
      { label: "Admin", value: "admin" },
      { label: "Employee", value: "employee" },
    ],
  },
];
