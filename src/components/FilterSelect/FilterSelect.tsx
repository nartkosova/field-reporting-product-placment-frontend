/* eslint-disable @typescript-eslint/no-explicit-any */
import Select from "react-select";

interface Option {
  value: string;
  label: string;
}

interface FilterSelectProps {
  options: Option[];
  placeholder: string;
  selected: string[];
  onChange: (values: string[]) => void;
  className?: string;
  isClearable?: boolean;
}

const darkSelectStyles = {
  control: (provided: any) => ({
    ...provided,
    backgroundColor: "#18181b",
    borderColor: "#27272a",
    color: "#fff",
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "#18181b",
    color: "#fff",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#27272a"
      : state.isFocused
      ? "#27272a"
      : "#18181b",
    color: "#fff",
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
  input: (provided: any) => ({
    ...provided,
    color: "#fff",
  }),
};

const FilterSelect = ({
  options,
  placeholder,
  selected,
  onChange,
  className = "min-w-[200px]",
  isClearable = false,
}: FilterSelectProps) => {
  return (
    <Select
      isMulti
      isClearable={isClearable}
      options={options}
      placeholder={placeholder}
      className={className}
      value={options.filter((opt) => selected.includes(opt.value))}
      onChange={(selectedOptions) =>
        onChange(selectedOptions?.map((opt) => opt.value) || [])
      }
      styles={darkSelectStyles}
    />
  );
};

export default FilterSelect;
