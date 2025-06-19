type HookResult = {
  meta: { facings_count: number; label: string; _key: string }[];
  counts: Record<string, number>;
  loading: boolean;
  submitting: boolean;
  total: number;
  change: (key: string, value: number) => void;
  submit: () => void;
};

type Props = {
  title: string;
  hook: HookResult;
};

export const BatchFacingsEditor = ({ title, hook }: Props) => {
  const { meta, counts, loading, submitting, total, change, submit } = hook;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 border border-gray-200 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>

      {loading ? (
        <p className="text-gray-600">Duke u ngarkuar...</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-6"
        >
          {meta.map((m) => {
            const key = m._key;

            return (
              <div key={key} className="p-4 border border-gray-300 rounded-md">
                <label className="block mb-2 font-medium text-gray-700">
                  {m.label}
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Numri i facings"
                  value={counts[key] ?? ""}
                  onChange={(e) => change(key, +e.target.value)}
                />
              </div>
            );
          })}

          <div className="text-left font-semibold text-gray-700">
            Total i facings: <span className="text-red-600">{total}</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 w-full cursor-pointer rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Duke u përditësuar..." : "Përditëso Facings"}
          </button>
        </form>
      )}
    </div>
  );
};
