import { EntityList } from "../../../components/EntityList/EntityList";
import storeServices from "../../../services/storeServices";
import { Store } from "../../../types/storeInterface";

const Stores = () => {
  return (
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
  );
};

export default Stores;
