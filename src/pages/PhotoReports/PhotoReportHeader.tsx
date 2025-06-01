import { useEffect, useState } from "react";
import photoService from "../../services/photoService";
import userService from "../../services/userService";
import storeService from "../../services/storeServices";
import Select from "react-select";
import { PhotoSchema } from "../../types/photoInterface";
import PhotoTable from "./PhotoReportTable";

const photoTypeOptions = [
  { value: "regular_shelf", label: "Regular Shelf" },
  { value: "secondary_position", label: "Secondary Position" },
  { value: "fletushka", label: "Fletushka" },
  { value: "korporative", label: "Korporative" },
];

const PhotoReportHeader = () => {
  const [users, setUsers] = useState<{ user_id: number; user: string }[]>([]);
  const [stores, setStores] = useState<
    { store_id: number; store_name: string }[]
  >([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [photos, setPhotos] = useState<PhotoSchema[]>([]);

  const [filters, setFilters] = useState({
    user_ids: [] as string[],
    store_ids: [] as string[],
    categories: [] as string[],
    months: [] as string[],
    photo_types: [] as string[],
  });

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const val = String(i + 1).padStart(2, "0");
    return {
      value: val,
      label: new Date(0, i).toLocaleString("default", { month: "long" }),
    };
  });

  useEffect(() => {
    const fetchData = async () => {
      const [userList, storeList, photoList] = await Promise.all([
        userService.getAllUsers(),
        storeService.getAllStores(),
        photoService.getAllReportPhotos(),
      ]);

      setUsers(userList);
      setStores(storeList);
      setPhotos(photoList);

      const cats = Array.from(new Set(photoList.map((p) => p.category)));
      setCategories(cats);
    };

    fetchData();
  }, []);

  const userOptions = users.map((u) => ({
    value: String(u.user_id),
    label: u.user,
  }));
  const storeOptions = stores.map((s) => ({
    value: String(s.store_id),
    label: s.store_name,
  }));
  const categoryOptions = categories.map((c) => ({ value: c, label: c }));

  const filteredPhotos = photos.filter((p) => {
    const uploadMonth = new Date(p.uploaded_at).getMonth() + 1;
    const uploadMonthStr = String(uploadMonth).padStart(2, "0");

    return (
      (filters.user_ids.length === 0 ||
        filters.user_ids.includes(String(p.user_id))) &&
      (filters.store_ids.length === 0 ||
        filters.store_ids.includes(String(p.store_id))) &&
      (filters.categories.length === 0 ||
        filters.categories.includes(p.category)) &&
      (filters.months.length === 0 ||
        filters.months.includes(uploadMonthStr)) &&
      (filters.photo_types.length === 0 ||
        filters.photo_types.includes(p.photo_type))
    );
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Photo Report</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <Select
          isMulti
          options={userOptions}
          placeholder="Select user(s)"
          onChange={(opts) =>
            setFilters((prev) => ({
              ...prev,
              user_ids: opts?.map((o) => o.value) || [],
            }))
          }
        />
        <Select
          className="md:w-1/2 w-full"
          isMulti
          options={storeOptions}
          placeholder="Select store(s)"
          onChange={(opts) =>
            setFilters((prev) => ({
              ...prev,
              store_ids: opts?.map((o) => o.value) || [],
            }))
          }
        />
        <Select
          isMulti
          options={categoryOptions}
          placeholder="Select category(s)"
          onChange={(opts) =>
            setFilters((prev) => ({
              ...prev,
              categories: opts?.map((o) => o.value) || [],
            }))
          }
        />
        <Select
          isMulti
          options={monthOptions}
          placeholder="Select month(s)"
          onChange={(opts) =>
            setFilters((prev) => ({
              ...prev,
              months: opts?.map((o) => o.value) || [],
            }))
          }
        />
        <Select
          isMulti
          options={photoTypeOptions}
          placeholder="Select photo type(s)"
          onChange={(opts) =>
            setFilters((prev) => ({
              ...prev,
              photo_types: opts?.map((o) => o.value) || [],
            }))
          }
        />
      </div>

      <PhotoTable data={filteredPhotos} />
    </div>
  );
};

export default PhotoReportHeader;
