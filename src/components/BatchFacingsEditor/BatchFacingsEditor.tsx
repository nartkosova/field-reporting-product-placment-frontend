import SubmitButton from "../Buttons/SubmitButton";

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
    <div className="w-full bg-neutral-900 p-8 border border-neutral-800 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-white">{title}</h2>

      {loading ? (
        <p className="text-gray-400">Duke u ngarkuar...</p>
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
              <div
                key={key}
                className="p-4 border border-neutral-800 rounded-xl bg-black"
              >
                <label className="block mb-2 font-medium text-gray-200">
                  {m.label}
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full border border-neutral-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-600 bg-neutral-900 text-white"
                  placeholder="Numri i facings"
                  value={counts[key] ?? ""}
                  onChange={(e) => change(key, +e.target.value)}
                />
              </div>
            );
          })}

          <div className="text-left font-semibold text-gray-200">
            Total i facings: <span className="text-red-400">{total}</span>
          </div>

          <SubmitButton
            loading={submitting}
            label="Përditëso Facings"
            loadingLabel="Duke u përditësuar..."
          />
        </form>
      )}
    </div>
  );
};
