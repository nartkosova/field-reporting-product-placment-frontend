/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useCallback } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import podravkaFacingsService from "../../services/podravkaFacingsService";
import { PodravkaProduct } from "../../types/productInterface";
import { Store } from "../../types/storeInterface";
import GenericReportHeader from "../../components/BaseTableHeader/BaseTableHeader";
import { useUser } from "../../hooks/useUser";

interface PresenceReportResponse {
  stores: Store[];
  products: PodravkaProduct[];
  data: Record<string, Record<string, string>>;
  pagination: {
    totalProducts: number;
    currentPage: number;
    totalPages: number;
  };
}

const PresenceReport = () => {
  const { user, userRole } = useUser();
  // We keep 'stores' and 'matrix' in local state because they are specific
  // to this report's layout, while 'products' will be managed by GenericReportHeader.
  const [stores, setStores] = useState<Store[]>([]);
  const [matrix, setMatrix] = useState<Record<string, Record<string, string>>>(
    {}
  );

  // 1. ADAPTER: Connects GenericHeader's request logic to your specific API
  const fetchData = useCallback(
    async (pageSize: number, offset: number, filters: Record<string, any>) => {
      try {
        // Calculate page number (1-based) from offset
        const page = Math.floor(offset / pageSize) + 1;

        const res = (await podravkaFacingsService.getPodravkaPresenceReport(
          page,
          pageSize,
          filters
        )) as PresenceReportResponse;

        // Update local state for columns and cell data
        setStores(res.stores || []);
        setMatrix(res.data || {});

        // Return the specific shape GenericReportHeader expects
        return {
          data: res.products || [],
          total: res.pagination?.totalProducts || 0,
        };
      } catch (error) {
        console.error("Error fetching report", error);
        return { data: [], total: 0 };
      }
    },
    []
  );

  // Memoize columns to prevent unnecessary re-renders
  const storeColumns = useMemo(
    () =>
      stores.map((s) => ({
        key: String(s.store_id),
        label: `${s.store_name} (${s.store_code})`,
      })),
    [stores]
  );

  // 2. RENDERER: The custom table logic
  const renderTable = (products: PodravkaProduct[]) => (
    <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl shadow-lg overflow-hidden z-0 relative">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-sm text-left text-neutral-200 border-separate border-spacing-0">
          <thead className="bg-neutral-900 text-neutral-400 uppercase text-xs">
            <tr>
              {/* Sticky Column 1: Podravka Code */}
              <th
                className="px-4 py-3 sticky left-0 bg-neutral-900 z-30 border-b border-neutral-800"
                style={{ width: "120px", minWidth: "120px" }}
              >
                Podravka Code
              </th>

              {/* Sticky Column 2: Elkos Code */}
              <th
                className="px-4 py-3 sticky bg-neutral-900 z-30 border-b border-neutral-800"
                style={{ left: "120px", width: "100px", minWidth: "100px" }}
              >
                Elkos Code
              </th>

              {/* Sticky Column 3: Product Name */}
              <th
                className="px-4 py-3 sticky bg-neutral-900 z-30 border-b border-r border-neutral-800 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.5)]"
                style={{ left: "220px", width: "220px", minWidth: "220px" }}
              >
                Produkti
              </th>

              {/* Scrollable Columns */}
              <th className="px-4 py-3 border-b border-neutral-800 whitespace-nowrap bg-neutral-900">
                Kategoria
              </th>
              {storeColumns.map((store) => (
                <th
                  key={store.key}
                  className="px-4 py-3 whitespace-nowrap border-b border-neutral-800 bg-neutral-900"
                >
                  {store.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-800">
            {products.map((p) => (
              <tr
                key={p.product_id}
                className="group hover:bg-neutral-900/40 transition-colors"
              >
                {/* Sticky Cell 1 */}
                <td
                  className="px-4 py-3 sticky left-0 bg-neutral-900/95 group-hover:bg-neutral-900 transition-colors z-20 border-b border-neutral-800"
                  style={{ width: "120px", minWidth: "120px" }}
                >
                  {p.podravka_code}
                </td>

                {/* Sticky Cell 2 */}
                <td
                  className="px-4 py-3 sticky bg-neutral-900/95 group-hover:bg-neutral-900 transition-colors z-20 border-b border-neutral-800"
                  style={{ left: "120px", width: "100px", minWidth: "100px" }}
                >
                  {p.elkos_code}
                </td>

                {/* Sticky Cell 3 */}
                <td
                  className="px-4 py-3 font-medium text-white sticky bg-neutral-900/95 group-hover:bg-neutral-900 transition-colors z-20 border-b border-r border-neutral-800 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.5)]"
                  style={{ left: "220px", width: "220px", minWidth: "220px" }}
                >
                  <div className="truncate" title={p.name}>
                    {p.name}
                  </div>
                </td>

                {/* Regular Cells */}
                <td className="px-4 py-3 text-neutral-400 whitespace-nowrap border-b border-neutral-800">
                  {p.category}
                </td>

                {storeColumns.map((store) => {
                  const row = matrix[String(p.product_id)] || {};
                  const rawValue = row[store.key] || "-";

                  // Default values
                  let displayValue = rawValue;
                  let colorClass = "text-neutral-500";

                  // Logic for 1 vs 0
                  if (rawValue === "Listed") {
                    displayValue = "1";
                    colorClass =
                      "text-emerald-400 font-bold  rounded px-3 py-0.5 inline-block";
                  } else if (rawValue === "Not listed") {
                    displayValue = "0";
                    colorClass =
                      "text-red-400 font-bold  rounded px-3 py-0.5 inline-block";
                  } else if (rawValue === "Product not in store") {
                    colorClass = "text-neutral-600 italic text-xs";
                    displayValue = "Nuk është në market";
                  } else if (rawValue === "Not Yet Recorded") {
                    colorClass = "text-gray text-xs";
                    displayValue = "Nuk ka të dhëna";
                  }

                  return (
                    <td
                      key={store.key}
                      className="px-4 py-3 whitespace-nowrap border-b border-neutral-800 text-center"
                    >
                      <span className={colorClass}>{displayValue}</span>
                    </td>
                  );
                })}
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td
                  colSpan={4 + storeColumns.length}
                  className="px-4 py-12 text-center text-neutral-500 italic"
                >
                  Nuk ka të dhëna për raportin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center justify-center bg-black min-h-screen">
      <div className="w-full max-w-[95%] flex flex-col flex-1 py-8">
        <GenericReportHeader<PodravkaProduct>
          title="Raport Presence (VFS & PROEX)"
          dateNeeded={false}
          filtersConfig={[
            {
              key: "storeType",
              placeholder: "Zgjidhni Tipin e Marketit",
              options: [
                { value: "VFS", label: "VFS Markets" },
                { value: "PROEX", label: "PROEX Markets" },
              ],
            },
          ]}
          fetchData={fetchData}
          renderTable={renderTable}
          user={user}
          userRole={userRole}
          exportExcel={(data) => {
            // Map the data for export
            const dataToExport = (data as PodravkaProduct[]).map((p) => {
              // 1. Basic Product Info
              const row: Record<string, string | number> = {
                "Podravka Code": p.podravka_code,
                "Elkos Code": p.elkos_code,
                Product: p.name,
                Category: p.category,
              };

              // 2. Presence Data Logic
              const rowData = matrix[String(p.product_id)] || {};

              storeColumns.forEach((store) => {
                const rawValue = rowData[store.key];

                // Logic: Listed = 1, Not listed = 0, Everything else = text
                if (rawValue === "Listed") {
                  row[store.label] = 1;
                } else if (rawValue === "Not listed") {
                  row[store.label] = 0;
                } else {
                  // Keeps "Product not in store", "Not Yet Recorded", or defaults to "-"
                  row[store.label] = rawValue || "-";
                }
              });

              return row;
            });

            // 3. Create Workbook
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
              workbook,
              worksheet,
              "Presence Report"
            );

            // 4. Write File
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
              `presence_report_${Date.now()}.xlsx`
            );
          }}
        />

        <div className="mt-2 text-xs text-neutral-500 text-center">
          Shtyllat janë marketet dhe rreshtat janë produktet.
        </div>
      </div>
    </div>
  );
};

export default PresenceReport;
