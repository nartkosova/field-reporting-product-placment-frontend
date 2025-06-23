import { EntityList } from "../../components/EntityList/EntityList";
import photoService from "../../services/photoService";
import { formattedDate } from "../../utils/utils";
import { PhotoSchema } from "../../types/photoInterface";

interface PhotoEntity {
  id: number;
  name: string;
  created_at: string;
  category: string;
  photo_type: string;
  photo_description?: string;
  photo_url: string;
}

const PhotoList = () => {
  return (
    <EntityList<PhotoEntity>
      title="Fotot nga raportet"
      fetchAll={async () => {
        const photos: PhotoSchema[] =
          await photoService.getReportPhotosByUserId();
        return photos.map((photo) => ({
          id: photo.photo_id,
          name: photo.store_name,
          created_at: photo.created_at,
          category: photo.category,
          photo_type: photo.photo_type,
          photo_description: photo.photo_description,
          photo_url: photo.photo_url,
        }));
      }}
      onDelete={async (photoId: number) => {
        await photoService.deleteReportPhoto(photoId.toString());
      }}
      editPath="/photos/edit"
      itemLabel="fotografi"
      renderDetails={(item) => (
        <div className="text-sm text-gray-600 space-y-1">
          <div>Tipi: {item.photo_type}</div>
          <div>Kategoria: {item.category}</div>
          <div>Përshkrimi: {item.photo_description || "Pa përshkrim"}</div>
          <div>Data: {formattedDate(item.created_at)}</div>
          <div>
            <img
              src={item.photo_url}
              alt="Foto"
              className="w-32 h-20 object-cover mt-2 border rounded"
            />
          </div>
        </div>
      )}
    />
  );
};

export default PhotoList;
