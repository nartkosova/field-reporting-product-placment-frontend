import { useEffect, useState } from "react";
import photoService from "../../services/photoService";
import userService from "../../services/userService";
import storeService from "../../services/storeServices";
import Select from "react-select";
import { PhotoSchema } from "../../types/photoInterface";
import PhotoTable from "./PhotoReportTable";
import ActionButton from "../../components/Buttons/ActionButtons";

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
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

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
      const [userList, storeList, photoResponse] = await Promise.all([
        userService.getAllUsers(),
        storeService.getStoresWithUserId(),
        photoService.getAllReportPhotos(pageSize, page * pageSize),
      ]);

      setUsers(userList);
      setStores(storeList);
      setPhotos(photoResponse.data);
      setTotalPhotos(photoResponse.total);

      const cats = Array.from(
        new Set(photoResponse.data.map((p) => p.category))
      );
      setCategories(cats);
    };

    fetchData();
  }, [page, pageSize]);

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
    const uploadMonth = new Date(p.created_at).getMonth() + 1;
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
  const photoFilterConfigs = [
    {
      key: "user_ids",
      options: userOptions,
      placeholder: "Zgjidh përdoruesin",
    },
    {
      key: "store_ids",
      options: storeOptions,
      placeholder: "Zgjidh dyqanin",
      className: "md:w-1/2 w-full",
    },
    {
      key: "categories",
      options: categoryOptions,
      placeholder: "Zgjidh kategorinë",
    },
    {
      key: "months",
      options: monthOptions,
      placeholder: "Zgjidh muajin",
    },
    {
      key: "photo_types",
      options: photoTypeOptions,
      placeholder: "Zgjidh llojin e fotos",
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Photo Report</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {photoFilterConfigs.map(
          ({ key, options, placeholder, className = "" }) => (
            <Select
              key={key}
              isMulti
              options={options}
              placeholder={placeholder}
              className={className}
              onChange={(opts) =>
                setFilters((prev) => ({
                  ...prev,
                  [key]: opts?.map((o) => o.value) || [],
                }))
              }
            />
          )
        )}
      </div>
      <div className="flex justify-between items-center mt-4 text-sm mb-4">
        <div className="flex items-center gap-2">
          <span>
            Page {page + 1} of {Math.ceil(totalPhotos / pageSize)}
          </span>
          <ActionButton
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            variant="outline"
          >
            Prev
          </ActionButton>
          <ActionButton
            onClick={() =>
              setPage((p) => ((p + 1) * pageSize < totalPhotos ? p + 1 : p))
            }
            disabled={(page + 1) * pageSize >= totalPhotos}
            variant="outline"
          >
            Next
          </ActionButton>
        </div>

        <div className="flex items-center gap-2">
          <label>Rows per page:</label>
          <select
            className="border rounded p-1"
            value={pageSize}
            onChange={(e) => {
              setPage(0);
              setPageSize(Number(e.target.value));
            }}
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <PhotoTable data={filteredPhotos} />
    </div>
  );
};

export default PhotoReportHeader;
