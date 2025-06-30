import SubmitButton from "../Buttons/SubmitButton";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

interface Entry {
  id: number | string;
  label: string;
  value: number;
  isCustom?: boolean;
}

interface Props {
  title: string;
  category: string;
  entries: Entry[];
  onChange: (id: Entry["id"], value: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  productsLoading: boolean;
  loading: boolean;
  onRemoveProduct?: (id: Entry["id"]) => void;
}

const FacingsForm = ({
  title,
  category,
  entries,
  onChange,
  onSubmit,
  productsLoading,
  loading,
  onRemoveProduct,
}: Props) => {
  const total = entries.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="w-full bg-neutral-900 p-8 border border-neutral-800 rounded-2xl shadow-lg space-y-4">
      <h2 className="text-2xl font-bold text-white">{title}</h2>

      <p className="text-gray-300">
        Kategoria e zgjedhur:{" "}
        <span className="text-blue-400 font-medium">{category}</span>
      </p>
      <p className="text-gray-300">
        Ju lutemi plotësoni numrin e facings për secilin produkt. Lërini bosh
        fushat për produktet pa facings. Përdorni "Shto produkt" për të shtuar
        produkte të reja ose ikonën ✕ për t’i larguar.
      </p>

      {productsLoading ? (
        <LoadingSpinner text="Duke i ngarkuar produktet..." />
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="relative p-4 border border-neutral-800 rounded-xl bg-black"
            >
              {onRemoveProduct && (
                <button
                  type="button"
                  onClick={() => onRemoveProduct(entry.id)}
                  className="absolute top-2 right-2 text-white bg-opacity-60 px-2 py-1 rounded cursor-pointer"
                  aria-label="Remove product"
                >
                  ✕
                </button>
              )}

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
