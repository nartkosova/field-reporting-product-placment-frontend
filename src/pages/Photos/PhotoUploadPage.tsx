import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import photoService from "../../services/photoService";
import { PhotoInput } from "../../types/photoInterface";
import storeServices from "../../services/storeServices";
import { sanitizeFilename } from "../../utils/utils";
import { useSelectedStore } from "../../hooks/useSelectStore";
import ActionButton from "../../components/Buttons/ActionButtons";
import { isOnline } from "../../utils/cacheManager";
import { queuePhoto } from "../../db/db";
import imageCompression from "browser-image-compression";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useUser } from "../../hooks/useUser";

interface Props {
  photoType: PhotoInput["photo_type"];
}

const PhotoUploadPage: React.FC<Props> = ({ photoType }) => {
  const storeInfo = useSelectedStore();
  const storeId = storeInfo?.store_id || 0;
  const location = useLocation();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [photoDescription, setPhotoDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const category = new URLSearchParams(location.search).get("category");
  const { company } = useParams<{ company: string }>();
  const { user } = useUser();
  const userId = user?.user_id;
  const [storeName, setStoreName] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;
    storeServices.getStoreById(Number(storeId)).then((res) => {
      setStoreName(res.store_name);
    });
  }, [storeId]);

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!file || !storeId || !userId)
      return alert("Ju lutem plotësoni të gjitha fushat.");
    const safeName = sanitizeFilename(String(storeName));
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
    const customName = `${safeName}-${
      category || photoType
    }-${company}-${timestamp}`.toLowerCase();

    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    });

    const formData = new FormData();
    formData.append("photo", compressedFile, customName);
    formData.append("photo_type", photoType);
    formData.append("category", category || photoType);
    formData.append("company", company || "podravka");
    formData.append("user_id", String(userId));
    formData.append("store_id", storeId.toString());
    formData.append("photo_description", photoDescription);

    try {
      if (isOnline()) {
        await photoService.createPhoto(formData);
        alert("Fotoja u ngarkua me sukses");
      } else {
        await queuePhoto(formData);
        alert("Nuk ka internet. Fotoja u ruajt për ngarkim më vonë.");
      }
      navigate(-1);
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
    <div className="w-full flex items-center justify-center bg-black p-2 sm:p-0 overflow-auto">
      <div className="p-4 sm:p-6 space-y-6 max-w-xl w-full bg-neutral-900 rounded-2xl shadow-md border border-neutral-800 max-h-[90vh] overflow-y-auto">
        {category && (
          <div className="text-lg font-medium pb-2 text-white">
            Kategoria: <span className="text-blue-400">{category}</span>
          </div>
        )}{" "}
        {!category && (
          <div className="text-lg font-medium pb-2 text-white">
            Fotografia Korporative
          </div>
        )}
        <label className="block bg-neutral-800 text-center py-3 rounded border border-dashed border-neutral-700 cursor-pointer hover:bg-neutral-700 transition text-white">
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
                className="object-cover rounded border border-neutral-800 max-h-60 w-full"
              />
            </div>

            <textarea
              value={photoDescription}
              onChange={(e) => setPhotoDescription(e.target.value)}
              placeholder="Përshkrimi i fotos (opsionale)"
              className="w-full border border-neutral-700 bg-neutral-900 text-white rounded p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-neutral-600 placeholder-gray-500"
            />

            <ActionButton
              onClick={handleSubmit}
              disabled={isLoading}
              className="h-[41px]"
              fullWidth
            >
              {isLoading ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                `Dërgo ${photoType}`
              )}
            </ActionButton>
            <ActionButton onClick={clearState} fullWidth>
              Largo foton
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUploadPage;
