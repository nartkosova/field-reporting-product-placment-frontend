import { useParams, useLocation } from "react-router-dom";
import { useState } from "react";
import photoService from "../Services/photoService";
import { PhotoInput } from "../types/photoInterface";

interface Props {
  photoType: PhotoInput["photo_type"];
}

const PhotoUploadPage: React.FC<Props> = ({ photoType }) => {
  const { storeId } = useParams<{ storeId: string }>();
  const location = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const category = new URLSearchParams(location.search).get("category");
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userId = user.id;

  const handleSubmit = async () => {
    if (!file || !category || !storeId || !userId) return;

    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
    const customName = `${storeId}-${category}-${timestamp}`.toLowerCase();

    const formData = new FormData();
    formData.append("photo", file, customName);
    formData.append("photo_type", photoType);
    formData.append("category", category);
    formData.append("user_id", userId);
    formData.append("store_id", storeId);

    try {
      setIsLoading(true);
      await photoService.createPhoto(formData);
      alert("Fotoja u ngarkua me sukses");
      setFile(null);
    } catch (e) {
      alert("Fotoja nuk u ngarkua, provo perseri.");
      console.error("Error uploading photo:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const clearState = () => {
    setFile(null);
  };

  return (
    <div className="p-6 space-y-4 max-w-xl mx-auto">
      <p className="text-lg font-medium">Kategoria: {category}</p>
      <label className="block bg-gray-200 text-center py-2 rounded cursor-pointer">
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
        <div className="flex flex-col items-center space-y-4">
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="w-full max-h-64 object-contain rounded"
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
            Remove Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoUploadPage;
