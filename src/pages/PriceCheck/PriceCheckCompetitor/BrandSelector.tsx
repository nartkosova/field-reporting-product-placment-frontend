/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import competitorServices from "../../../services/competitorServices";
import Select from "react-select";
import React from "react";

interface Brand {
  competitor_id: number;
  brand_name: string;
}

interface Props {
  selectedBrandId: number | null;
  onBrandSelect: (id: number) => void;
}

const BrandSelector = ({ selectedBrandId, onBrandSelect }: Props) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [newBrand, setNewBrand] = useState("");

  useEffect(() => {
    const fetchBrands = async () => {
      const res = await competitorServices.getAllCompetitorBrands();
      setBrands(res);
    };
    fetchBrands();
  }, []);

  const handleAddBrand = async () => {
    if (!newBrand.trim()) return;
    const res = await competitorServices.createCompetitorBrand({
      brand_name: newBrand,
    });
    const newEntry = { competitor_id: res.id, brand_name: newBrand };
    setBrands((prev) => [...prev, newEntry]);
    onBrandSelect(res.id);
    setNewBrand("");
  };

  return (
    <div className="space-y-2">
      <label className="block font-medium">Select Brand</label>
      <Select
        className="w-full"
        options={brands.map((b) => ({
          value: b.competitor_id,
          label: b.brand_name,
        }))}
        value={
          selectedBrandId
            ? {
                value: selectedBrandId,
                label:
                  brands.find((b) => b.competitor_id === selectedBrandId)
                    ?.brand_name || "",
              }
            : null
        }
        onChange={(option) => option && onBrandSelect(option.value)}
        isClearable
        placeholder="Choose a brand..."
        styles={{
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
        }}
      />

      <div className="flex space-x-2">
        <input
          type="text"
          className="border p-2 w-full"
          placeholder="New Brand Name"
          value={newBrand}
          onChange={(e) => setNewBrand(e.target.value)}
        />
        <button
          onClick={handleAddBrand}
          className="bg-blue-600 text-white px-4 py-2"
          type="button"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default BrandSelector;
