import React from "react";
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
    <div className="flex flex-col p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {entries.map((entry, index) => (
          <div
            key={index}
            className="flex flex-col space-y-2 border p-2 rounded"
          >
            {fields.map((field) =>
              field.type === "select" ? (
                <select
                  key={field.key}
                  className="border p-2"
                  value={entry[field.key] || ""}
                  onChange={(e) => onChange(index, field.key, e.target.value)}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  key={field.key}
                  type={field.type}
                  placeholder={field.label}
                  className="border p-2"
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
