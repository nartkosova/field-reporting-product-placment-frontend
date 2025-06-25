import { EntityList } from "../../../components/EntityList/EntityList";
import productServices from "../../../services/productServices";
import { CompetitorProduct } from "../../../types/productInterface";

const CompetitorProductList = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center flex-1 py-8">
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
          itemLabel="produktiS"
        />
      </div>
    </div>
  );
};

export default CompetitorProductList;
