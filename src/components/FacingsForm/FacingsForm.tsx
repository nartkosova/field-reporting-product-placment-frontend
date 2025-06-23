import React from "react";
import SubmitButton from "../Buttons/SubmitButton";

interface Entry {
  id: number | string;
  label: string;
  value: number;
}

interface Props {
  title: string;
  category: string;
  entries: Entry[];
  onChange: (id: Entry["id"], value: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  productsLoading: boolean;
  loading: boolean;
}

const FacingsForm = ({
  title,
  category,
  entries,
  onChange,
  onSubmit,
  productsLoading,
  loading,
}: Props) => {
  const total = entries.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 border border-gray-200 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>

      <p className="text-gray-700">
        Kategoria e zgjedhur:{" "}
        <span className="text-blue-600 font-medium">{category}</span>
      </p>

      {productsLoading ? (
        <p className="text-gray-600">Duke i ngarkuar produktet...</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 border border-gray-300 rounded-md"
            >
              <label className="block mb-2 font-medium text-gray-700">
                {entry.label}
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Numri i facings"
                min={0}
                value={entry.value || ""}
                onChange={(e) => onChange(entry.id, Number(e.target.value))}
              />
            </div>
          ))}

          <div className="text-left font-semibold text-gray-700">
            Total i facings për kategorinë{" "}
            <span className="text-red-600">{total}</span>
          </div>

          <SubmitButton
            loading={loading}
            label="Dërgo Facings"
            loadingLabel="Duke dërguar..."
          />
        </form>
      )}
    </div>
  );
};

export default FacingsForm;
