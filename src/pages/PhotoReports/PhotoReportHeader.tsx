import { useCallback, useEffect, useState } from "react";
import photoService from "../../services/photoService";
import userService from "../../services/userService";
import storeService from "../../services/storeServices";
import GenericReportHeader from "../../components/BaseTableHeader/BaseTableHeader";
import { User, Store } from "../../types/reportInterface";
import PhotoTable from "./PhotoReportTable";
import { useProductCategories } from "../../hooks/useProductCategories";

const PhotoReportHeader = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const { categories } = useProductCategories();

  useEffect(() => {
    const fetchInitialData = async () => {
      const [userList, storeList] = await Promise.all([
        userService.getAllUsers(),
        storeService.getStoresWithUserId(),
      ]);

      setUsers(userList);
      setStores(storeList);
    };

    fetchInitialData();
  }, []);

  const userOptions = users.map((u) => ({
    value: String(u.user_id),
    label: u.user,
  }));

  const storeOptions = stores.map((s) => ({
    value: String(s.store_id),
    label: s.store_name,
  }));

  const categoryOptions = categories.map((c) => ({
    value: c,
    label: c,
  }));

  const photoTypeOptions = [
    { value: "regular_shelf", label: "Pozita Primare" },
    { value: "secondary_position", label: "Pozita Sekondare" },
    { value: "fletushka", label: "Fletushka" },
    { value: "korporative", label: "Korporative" },
  ];

  const companyOptions = [
    { value: "podravka", label: "Podravka" },
    { value: "competitor", label: "Competitor" },
  ];

  const filterConfigs = [
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
      key: "photo_types",
      options: photoTypeOptions,
      placeholder: "Zgjidh llojin e fotos",
    },
    {
      key: "company",
      options: companyOptions,
      placeholder: "Zgjedh kompanin",
    },
  ];

  const fetchData = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (pageSize: number, offset: number, filters: Record<string, any>) => {
      const res = await photoService.getAllReportPhotos(
        pageSize,
        offset,
        filters
      );

      return {
        data: res.data,
        total: res.total,
      };
    },
    []
  );

  return (
    <div className="py-4">
      <GenericReportHeader
        title="Raportet e Fotove"
        filtersConfig={filterConfigs}
        fetchData={fetchData}
        renderTable={(data) => <PhotoTable data={data} />}
      />
    </div>
  );
};

export default PhotoReportHeader;
