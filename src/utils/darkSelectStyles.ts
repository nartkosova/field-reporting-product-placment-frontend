/* eslint-disable @typescript-eslint/no-explicit-any */
const darkSelectStyles = {
  control: (provided: any) => ({
    ...provided,
    backgroundColor: "#18181b",
    borderColor: "#27272a",
    color: "#fff",
    minHeight: 48,
    fontSize: 18,
    borderRadius: 12,
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "#18181b",
    color: "#fff",
    borderRadius: 12,
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#27272a"
      : state.isFocused
      ? "#27272a"
      : "#18181b",
    color: "#fff",
    fontSize: 16,
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "#fff",
  }),
  multiValue: (provided: any) => ({
    ...provided,
    backgroundColor: "#27272a",
    color: "#fff",
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: "#fff",
  }),
  input: (provided: any) => ({
    ...provided,
    color: "#fff",
  }),
};

export default darkSelectStyles;
