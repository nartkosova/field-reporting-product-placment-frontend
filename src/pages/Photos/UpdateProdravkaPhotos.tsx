import { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import photoService from "../../services/photoService";
import storeServices from "../../services/storeServices";
import { useProductCategories } from "../../hooks/useProductCategories";
import { PhotoSchema } from "../../types/photoInterface";
import { AxiosError } from "axios";
import { Store } from "../../types/storeInterface";
import SubmitButton from "../../components/Buttons/SubmitButton";
import darkSelectStyles from "../../utils/darkSelectStyles";

const UpdatePhotoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    photo_type: "",
    category: "",
    store_id: "",
    photo_description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeOptions, setStoreOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const { categories } = useProductCategories();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const photoData: PhotoSchema =
          await photoService.getReportPhotosByPhotoId(id!);
        setFormState({
          photo_type: photoData.photo_type,
          category: photoData.category,
          store_id: String(photoData.store_id),
          photo_description: photoData.photo_description || "",
        });

        const stores = await storeServices.getStoresByUserId(photoData.user_id);
        setStoreOptions(
          stores.map((s: Store) => ({
            value: String(s.store_id),
            label: s.store_name,
          }))
        );
      } catch (err) {
        const axiosError = err as AxiosError<{ error: string }>;
        alert(axiosError.response?.data?.error || "Gabim gjatë ngarkimit.");
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("photo_type", formState.photo_type);
      data.append("category", formState.category);
      data.append("store_id", formState.store_id);
      data.append("photo_description", formState.photo_description);
      if (file) data.append("photo", file);

      await photoService.updateReportPhoto(id!, data);
      alert("Foto u përditësua me sukses!");
      navigate("/photos");
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      alert(axiosError.response?.data?.error || "Gabim gjatë përditësimit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields: {
    name: keyof typeof formState;
    label: string;
    type: string;
    options?: { value: string; label: string }[];
  }[] = [
    {
      name: "photo_type",
      label: "Tipi i fotos",
      type: "select",
      options: [
        { value: "regular_shelf", label: "Regular Shelf" },
        { value: "secondary_position", label: "Secondary Position" },
        { value: "fletushka", label: "Fletushka" },
        { value: "korporative", label: "Korporative" },
      ],
    },
    {
      name: "category",
      label: "Kategoria",
      type: "select",
      options: categories.map((c) => ({ value: c, label: c })),
    },
    {
      name: "store_id",
      label: "Dyqani",
      type: "select",
      options: storeOptions,
    },
    {
      name: "photo_description",
      label: "Përshkrimi",
      type: "text",
    },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center flex-1 py-8">
        <div className="w-full bg-neutral-900 p-8 border border-neutral-800 rounded-2xl shadow-lg space-y-4">
          <h2 className="text-2xl font-bold text-white">
            Përditëso foton e raportit
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ name, label, type, options }) => (
              <div
                key={name}
                className="p-4 border border-neutral-800 rounded-xl bg-black"
              >
                <label className="block mb-2 font-medium text-gray-200">
                  {label}
                </label>
                {type === "select" && options ? (
                  <Select
                    options={options}
                    value={
                      options.find(
                        (opt) =>
                          opt.value ===
                          formState[name as keyof typeof formState]
                      ) || null
                    }
                    onChange={(selected) =>
                      handleChange(name, selected?.value ?? "")
                    }
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isClearable
                    styles={darkSelectStyles}
                  />
                ) : (
                  <input
                    type="text"
                    value={formState[name] ?? ""}
                    onChange={(e) => handleChange(name, e.target.value)}
                    className="w-full border border-neutral-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-600 bg-neutral-900 text-white"
                  />
                )}
              </div>
            ))}

            <div className="p-4 border border-neutral-800 rounded-xl bg-black">
              <label className="block mb-2 font-medium text-gray-200">
                Zëvendëso foton (opsionale)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-dashed border-neutral-700 rounded px-3 py-2 bg-neutral-900 text-white cursor-pointer"
              />
              {file && (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="rounded border mt-2 object-cover max-h-64"
                />
              )}
            </div>

            <SubmitButton
              loading={isSubmitting}
              label="Përditëso Fotot"
              loadingLabel="Duke u përditësuar..."
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePhotoPage;
