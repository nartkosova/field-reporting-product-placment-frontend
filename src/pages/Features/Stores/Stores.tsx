import { EntityList } from "../../../components/EntityList/EntityList";
import storeServices from "../../../services/storeServices";
import { Store } from "../../../types/storeInterface";

const Stores = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center flex-1 py-8">
        <EntityList
          title="Lista e Dyqaneve"
          fetchAll={async () => {
            const stores = await storeServices.getAllStores();
            return stores.map((s: Store) => ({
              id: s.store_id,
              name: s.store_name,
              category: s.store_category,
            }));
          }}
          editPath="/settings/edit/store"
          onDelete={storeServices.deleteStore}
          itemLabel="dyqanin"
        />
      </div>
    </div>
  );
};

export default Stores;
