import { EntityList } from "../../../components/EntityList/EntityList";
import productServices from "../../../services/productServices";
import { CompetitorProduct } from "../../../types/productInterface";

const CompetitorProductList = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-0 sm:p-0">
      <EntityList
        title="Produktet e Konkurrencës"
        fetchAll={async () => {
          const products = await productServices.getCompetitorProducts({});
          return products.map((p: CompetitorProduct) => ({
            id: p.competitor_product_id,
            name: p.name,
            created_at: p.created_at,
            created_by: p.created_by,
          }));
        }}
        onDelete={productServices.deleteCompetitorProduct}
        editPath="/settings/edit/competitor-products"
        itemLabel="produktin"
      />
    </div>
  );
};

export default CompetitorProductList;
