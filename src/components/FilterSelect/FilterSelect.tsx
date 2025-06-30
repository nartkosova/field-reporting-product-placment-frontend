import Select from "react-select";
import darkSelectStyles from "../../utils/darkSelectStyles";

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
      closeMenuOnSelect={false}
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
