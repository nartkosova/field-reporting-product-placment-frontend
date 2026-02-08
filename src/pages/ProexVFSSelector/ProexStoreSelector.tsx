import PresencePage from "./PresencePage";
import storeServices from "../../services/storeServices";

const ProexStoreSelector = () => {
  return (
    <PresencePage
      title="Proex Presence"
      fetchStores={storeServices.getProexStores}
      recordType="PRESENCE"
    />
  );
};

export default ProexStoreSelector;
