import React from "react";
import SubmitButton from "../Buttons/SubmitButton";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

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
    <div className="w-full bg-neutral-900 p-8 border border-neutral-800 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-white">{title}</h2>

      <p className="text-gray-300">
        Kategoria e zgjedhur:{" "}
        <span className="text-blue-400 font-medium">{category}</span>
      </p>

      {productsLoading ? (
        <LoadingSpinner text="Duke i ngarkuar produktet..." />
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 border border-neutral-800 rounded-xl bg-black"
            >
              <label className="block mb-2 font-medium text-gray-200">
                {entry.label}
              </label>
              <input
                type="number"
                className="w-full border border-neutral-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-600 bg-neutral-900 text-white"
                placeholder="Numri i facings"
                min={0}
                value={entry.value || ""}
                onChange={(e) => onChange(entry.id, Number(e.target.value))}
              />
            </div>
          ))}

          <div className="text-left font-semibold text-gray-200">
            Total i facings për kategorinë{" "}
            <span className="text-blue-400">{total}</span>
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
