/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import SubmitButton from "../Buttons/SubmitButton";
import darkSelectStyles from "../../utils/darkSelectStyles";

interface Field {
  name: string;
  label: string;
  type?: string;
  options?: { label: string; value: string | number }[];
  isMulti?: boolean;
  step?: string;
}

interface CreateUpdateFormProps {
  title: string;
  fields: Field[];
  onSubmit: (
    data: Record<string, string | number | (string | number)[]>
  ) => Promise<void>;
  initialValues?: Record<string, string | number | (string | number)[]>;
  submitText?: string;
}

export function CreateUpdateForm({
  title,
  fields,
  onSubmit,
  initialValues = {},
  submitText = "Vazhdo",
}: CreateUpdateFormProps) {
  const [formState, setFormState] =
    useState<Record<string, string | number | (string | number)[]>>(
      initialValues
    );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setFormState(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    name: string,
    value: string | number | (string | number)[]
  ) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formState);
      if (!initialValues || Object.keys(initialValues).length === 0) {
        setFormState({});
      }
      alert("Veprimi u krye me sukses!");
      navigate(-1);
    } catch (err: unknown) {
      console.error("Submit error:", err);

      if (
        typeof err === "object" &&
        err !== null &&
        "isAxiosError" in err &&
        (err as any).isAxiosError
      ) {
        const axiosErr = err as import("axios").AxiosError<any>;
        const message =
          axiosErr.response?.data?.error ||
          axiosErr.response?.data?.message ||
          axiosErr.response?.statusText ||
          "Gabim nga serveri";
        alert(message);
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Gabim i panjohur. Provo përsëri.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-neutral-900 p-8 border border-neutral-800 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
        {title}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map(
          ({ name, label, type = "text", options, isMulti, step }) => (
            <div key={name} className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">
                {label}
              </label>
              {type === "select" && options ? (
                <Select
                  options={options}
                  isMulti={isMulti}
                  closeMenuOnSelect={!isMulti}
                  value={
                    isMulti
                      ? options.filter((opt) =>
                          Array.isArray(formState[name])
                            ? (formState[name] as (string | number)[]).includes(
                                opt.value
                              )
                            : false
                        )
                      : options.find((opt) => opt.value === formState[name]) ||
                        null
                  }
                  onChange={(selected) => {
                    if (isMulti) {
                      const values = (
                        Array.isArray(selected)
                          ? selected.map((s) => s as { value: string | number })
                          : []
                      ).map((s) => s.value);
                      handleChange(name, values);
                    } else {
                      handleChange(
                        name,
                        (selected as { value: string | number })?.value ?? ""
                      );
                    }
                  }}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isClearable
                  styles={darkSelectStyles}
                />
              ) : (
                <input
                  type={type}
                  className="border border-neutral-700 bg-neutral-900 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-neutral-600 placeholder-gray-500"
                  placeholder={label}
                  step={step}
                  value={
                    Array.isArray(formState[name])
                      ? formState[name].join(", ")
                      : formState[name] ?? ""
                  }
                  onChange={(e) =>
                    handleChange(
                      name,
                      type === "number"
                        ? Number(e.target.value)
                        : e.target.value
                    )
                  }
                />
              )}
            </div>
          )
        )}
        <SubmitButton loading={isSubmitting} label={submitText} />
      </form>
    </div>
  );
}
