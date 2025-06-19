import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import photoService from "../../services/photoService";
import { PhotoInput } from "../../types/photoInterface";
import storeServices from "../../services/storeServices";
import { sanitizeFilename } from "../../utils/utils";
import { useSelectedStore } from "../../hooks/useSelectStore";
interface Props {
  photoType: PhotoInput["photo_type"];
}

const PhotoUploadPage: React.FC<Props> = ({ photoType }) => {
  const storeInfo = useSelectedStore();
  const storeId = storeInfo?.store_id || 0;
  const location = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [photoDescription, setPhotoDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const category = new URLSearchParams(location.search).get("category");
  const { company } = useParams<{ company: string }>();
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userId = user.id;
  const [storeName, setStoreName] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;
    storeServices.getStoreById(Number(storeId)).then((res) => {
      setStoreName(res.store_name);
    });
  }, [storeId]);

  const handleSubmit = async () => {
    if (!file || !storeId || !userId)
      return alert("Ju lutem plotësoni të gjitha fushat.");
    const safeName = sanitizeFilename(String(storeName));
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
    const customName = `${safeName}-${
      category || photoType
    }-${company}-${timestamp}`.toLowerCase();

    const formData = new FormData();
    formData.append("photo", file, customName);
    formData.append("photo_type", photoType);
    formData.append("category", category || photoType);
    formData.append("company", company || "podravka");
    formData.append("user_id", userId);
    formData.append("store_id", storeId.toString());
    formData.append("photo_description", photoDescription);

    try {
      setIsLoading(true);
      await photoService.createPhoto(formData);
      alert("Fotoja u ngarkua me sukses");
      clearState();
    } catch (e) {
      alert("Fotoja nuk u ngarkua, provo perseri.");
      console.error("Error uploading photo:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const clearState = () => {
    setFile(null);
    setPhotoDescription("");
  };

  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto mt-8 bg-white rounded shadow-md">
      {category && (
        <div className="text-lg font-medium pb-2">
          Kategoria: <span className="text-blue-600">{category}</span>
        </div>
      )}{" "}
      {!category && (
        <div className="text-lg font-medium pb-2">Fotografia Korporative</div>
      )}
      <label className="block bg-gray-100 text-center py-3 rounded border border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition">
        Krijo Foto
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />
      </label>
      {file && (
        <div className="flex flex-col space-y-4">
          <div className="w-full">
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="object-cover"
            />
          </div>

          <textarea
            value={photoDescription}
            onChange={(e) => setPhotoDescription(e.target.value)}
            placeholder="Përshkrimi i fotos (opsionale)"
            className="w-full border border-gray-300 rounded p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`bg-blue-600 text-white px-4 py-2 rounded w-full ${
              isLoading ? "opacity-50 cursor-not-allowed" : "!cursor-pointer"
            }`}
          >
            {isLoading ? "Uploading..." : `Upload ${photoType}`}
          </button>
          <button
            onClick={clearState}
            className="bg-blue-600 text-white px-4 py-2 rounded !cursor-pointer w-full"
          >
            Largo foton
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoUploadPage;
