/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { User, Store } from "../../types/reportInterface";
import { PodravkaFacingReport } from "../../types/podravkaFacingInterface";
import podravkaFacingsService from "../../services/podravkaFacingsService";
import userService from "../../services/userService";
import storeService from "../../services/storeServices";
import GenericReportHeader from "../../components/BaseTableHeader/BaseTableHeader";
import ProductFacingsReportTable from "./ProductFacingsReportTable";
import { useProductCategories } from "../../hooks/useProductCategories";
import { useUser } from "../../hooks/useUser";

const ProductFacingsReportHeader = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [facings, setFacings] = useState<PodravkaFacingReport[]>([]);
  const {
    categories: productCategories,
    businessUnits,
    getCategoriesForBusinessUnit,
  } = useProductCategories();
  const [selectedBU, setSelectedBU] = useState<string | null>(null);
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

  const filteredCategories = useMemo(() => {
    const cleanBU = selectedBU?.trim();
    return cleanBU ? getCategoriesForBusinessUnit(cleanBU) : productCategories;
  }, [selectedBU, getCategoriesForBusinessUnit, productCategories]);

  const filterConfigs = useMemo(() => {
    interface FilterOption {
      value: string;
      label: string;
    }

    interface FilterConfig {
      key: string;
      options: FilterOption[];
      placeholder: string;
      className?: string;
      onChange?: (selected: FilterOption[]) => void;
    }

    return [
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
        options: filteredCategories.map((c) => ({ value: c, label: c })),
        placeholder: "Zgjedh kategorinë",
      },
      {
        key: "business_unit",
        options: businessUnits.map((unit) => ({
          value: unit,
          label: unit,
        })),
        placeholder: "Zgjedh njesinë e biznesit",
        onChange: (selected) => {
          setSelectedBU(selected[0]?.value ?? null);
        },
      },
    ] as FilterConfig[];
  }, [userOptions, storeOptions, filteredCategories, businessUnits]);

  const fetchData = useCallback(
    async (pageSize: number, offset: number, filters: Record<string, any>) => {
      const {
        user_ids,
        store_ids,
        categories,
        start_date,
        business_unit,
        end_date,
        report_month,
      } = filters;

      const query: Record<string, string | string[]> = {};

      if (user_ids?.length > 0) query.user_ids = user_ids;
      if (store_ids?.length > 0) query.store_ids = store_ids;
      if (categories?.length > 0) query.categories = categories;
      if (business_unit?.length > 0) {
        query.business_unit = business_unit[0];
      }
      if (start_date && end_date) {
        query.start_date = start_date;
        query.end_date = end_date;
      } else if (report_month?.length > 0) {
        const year = new Date().getFullYear();
        const monthIndex = parseInt(report_month[0], 10) - 1;
        const start = new Date(year, monthIndex, 1);
        const end = new Date(year, monthIndex + 1, 0);
        query.start_date = start.toISOString().split("T")[0];
        query.end_date = end.toISOString().split("T")[0];
      }

      const res = await podravkaFacingsService.getPodravkaFacingsReport(
        query,
        pageSize,
        offset
      );

      const typedData = res.data as PodravkaFacingReport[];
      setFacings(typedData);

      return {
        data: typedData,
        total: res.total,
      };
    },
    []
  );

  const handleExportExcel = () => {
    const dataToExport = facings.map((row) => ({
      Product: row.product_name,
      Category: row.product_category,
      "Business Unit": row.business_unit,
      "Podravka Facings": row.facings_count,
      Date: new Date(row.created_at).toLocaleDateString(),
      Store: row.store_name,
      Reporter: row.reported_by,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Podravka Report");

    const blob = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });

    const buf = new ArrayBuffer(blob.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < blob.length; i++) {
      view[i] = blob.charCodeAt(i) & 0xff;
    }

    saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      `podravka_report_${Date.now()}.xlsx`
    );
  };

  return (
    <div className="py-4">
      <GenericReportHeader
        title="Raporti i Podravkës"
        filtersConfig={filterConfigs}
        fetchData={fetchData}
        dateNeeded={false}
        renderTable={(data) => (
          <ProductFacingsReportTable
            data={data as PodravkaFacingReport[]}
            categories={productCategories}
          />
        )}
        exportExcel={handleExportExcel}
        user={user}
        userRole={userRole}
      />
    </div>
  );
};

export default ProductFacingsReportHeader;
