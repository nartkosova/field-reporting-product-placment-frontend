import { useState, useEffect } from "react";
import Select from "react-select";

interface Field {
  name: string;
  label: string;
  type?: string;
  options?: { label: string; value: string | number }[];
}

interface CreateUpdateFormProps {
  title: string;
  fields: Field[];
  onSubmit: (data: Record<string, string | number>) => Promise<void>;
  initialValues?: Record<string, string | number>;
  submitText?: string;
}

export function CreateUpdateForm({
  title,
  fields,
  onSubmit,
  initialValues = {},
  submitText = "Submit",
}: CreateUpdateFormProps) {
  const [formState, setFormState] =
    useState<Record<string, string | number>>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormState(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (name: string, value: string | number) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formState);
      alert(`${submitText} successful.`);
      if (!initialValues || Object.keys(initialValues).length === 0) {
        setFormState({});
      }
    } catch (err: unknown) {
      console.error("Submit error:", err);
      if (typeof err === "object" && err && "response" in err) {
        const res = err as { response?: { data?: { error?: string } } };
        alert(res.response?.data?.error || "Error, provo perseri.");
      } else {
        alert("Error, provo perseri.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[400px] w-full mx-auto mt-10 bg-white p-8 border border-gray-200 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map(({ name, label, type = "text", options }) => (
          <div key={name} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            {type === "select" && options ? (
              <Select
                options={options}
                value={
                  options.find((opt) => opt.value === formState[name]) || null
                }
                onChange={(selected) =>
                  handleChange(name, selected?.value ?? "")
                }
                className="react-select-container"
                classNamePrefix="react-select"
                isClearable
              />
            ) : (
              <input
                type={type}
                value={formState[name] ?? ""}
                onChange={(e) => handleChange(name, e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 w-full rounded hover:bg-blue-700"
        >
          {isSubmitting ? "Submitting..." : submitText}
        </button>
      </form>
    </div>
  );
}
