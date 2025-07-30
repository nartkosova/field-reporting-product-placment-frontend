import { useCallback, useEffect, useState } from "react";
import photoService from "../../services/photoService";
import userService from "../../services/userService";
import storeService from "../../services/storeServices";
import GenericReportHeader from "../../components/BaseTableHeader/BaseTableHeader";
import { PhotoSchema } from "../../types/photoInterface";
import { User, Store } from "../../types/reportInterface";
import PhotoTable from "./PhotoReportTable";
import { useProductCategories } from "../../hooks/useProductCategories";
import ExcelJS from "exceljs";
import { useUser } from "../../hooks/useUser";
import { saveAs } from "file-saver";

const PhotoReportHeader = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [photoReport, setPhotoReport] = useState<PhotoSchema[]>([]);
  const { categories } = useProductCategories();
  const { user, userRole } = useUser();

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
    { value: "new_product", label: "Produkt i Ri" },
    { value: "sale", label: "Aksion" },
    { value: "fletushka", label: "Fletushka" },
    { value: "korporative", label: "Korporative" },
  ];

  const companyOptions = [
    { value: "podravka", label: "Podravka" },
    { value: "competitor", label: "Competitor" },
  ];

  const filterConfigs = [
    {
      key: "photo_types",
      options: photoTypeOptions,
      placeholder: "Zgjidh llojin e fotos",
    },
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
      setPhotoReport(res.data);
      return {
        data: res.data,
        total: res.total,
      };
    },
    []
  );

  const getImageBuffer = async (url: string): Promise<ArrayBuffer> => {
    const response = await fetch(url);
    return await response.arrayBuffer();
  };

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Photo Report");

    worksheet.columns = [
      { header: "User", key: "user" },
      { header: "Store", key: "store_name" },
      { header: "Category", key: "category" },
      { header: "Description", key: "photo_description" },
      { header: "Company", key: "company" },
      { header: "Date", key: "created_at" },
      { header: "Photo", key: "photo" },
    ];

    for (let i = 0; i < photoReport.length; i++) {
      const row = photoReport[i];
      const excelRow = worksheet.addRow({
        user: row.user,
        store_name: row.store_name,
        category: row.category,
        photo_description: row.photo_description,
        company: row.company,
        created_at: new Date(row.created_at).toLocaleDateString(),
      });

      try {
        const imgBuffer = await getImageBuffer(row.photo_url);

        const imageId = workbook.addImage({
          buffer: imgBuffer,
          extension: "jpeg",
        });

        worksheet.getRow(excelRow.number).height = 120;
        worksheet.getColumn(7).width = 16;

        worksheet.addImage(imageId, {
          tl: { col: 6, row: excelRow.number - 1 },
          ext: { width: 80, height: 120 },
        });
      } catch {
        console.warn("Could not load image:", row.photo_url);
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `photo_report_${Date.now()}.xlsx`);
  };

  return (
    <div className="py-4">
      <GenericReportHeader
        title="Raporti i Fotove"
        filtersConfig={filterConfigs}
        fetchData={fetchData}
        renderTable={(data) => <PhotoTable data={data} />}
        exportExcel={handleExportExcel}
        userRole={userRole}
        user={user}
      />
    </div>
  );
};

export default PhotoReportHeader;
