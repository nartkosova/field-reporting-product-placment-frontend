import SubmitButton from "../Buttons/SubmitButton";

interface Field {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  options?: { value: string; label: string }[];
}
type Entry = {
  [key: string]: string | number | undefined;
};
interface BaseFormProps {
  entries: Entry[];
  fields: Field[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (index: number, key: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  submitButtonLabel: string;
}

const BaseForm: React.FC<BaseFormProps> = ({
  entries,
  fields,
  onChange,
  onSubmit,
  title,
  submitButtonLabel,
}) => {
  return (
    <div className="flex flex-col p-6 space-y-4 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg mt-8">
      <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
        {title}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {entries.map((entry, index) => (
          <div
            key={index}
            className="flex flex-col space-y-2 border border-neutral-800 bg-black rounded-xl p-4"
          >
            {fields.map((field) =>
              field.type === "select" ? (
                <select
                  key={field.key}
                  className="border border-neutral-700 bg-neutral-900 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-neutral-600"
                  value={entry[field.key] || ""}
                  onChange={(e) => onChange(index, field.key, e.target.value)}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      className="bg-neutral-900 text-white"
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  key={field.key}
                  type={field.type}
                  placeholder={field.label}
                  className="border border-neutral-700 bg-neutral-900 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-neutral-600"
                  value={entry[field.key] || ""}
                  onChange={(e) =>
                    onChange(
                      index,
                      field.key,
                      field.type === "number"
                        ? Number(e.target.value)
                        : e.target.value
                    )
                  }
                />
              )
            )}
          </div>
        ))}

        <SubmitButton label={submitButtonLabel} />
      </form>
    </div>
  );
};

export default BaseForm;
