import { EntityList } from "../../../components/EntityList/EntityList";
import productServices from "../../../services/productServices";
import { PodravkaProduct } from "../../../types/productInterface";

const PodravkaProductList = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center flex-1 py-8">
        <EntityList
          title="Produktet e Podravkës"
          fetchAll={async () => {
            const products = await productServices.getProducts();
            return products.map((p: PodravkaProduct) => ({
              id: p.product_id,
              name: p.name,
            }));
          }}
          onDelete={productServices.deletePodravkaProduct}
          editPath="/settings/edit/podravka-products"
          itemLabel="produkti"
        />
      </div>
    </div>
  );
};

export default PodravkaProductList;
