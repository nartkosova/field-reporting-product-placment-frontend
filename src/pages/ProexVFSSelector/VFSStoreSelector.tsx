import PresencePage from "./PresencePage";
import storeServices from "../../services/storeServices";

const VFSStoreSelector = () => {
  return (
    <PresencePage
      title="VFS Presence"
      fetchStores={storeServices.getVFSStores}
      recordType="PRESENCE"
    />
  );
};

export default VFSStoreSelector;
