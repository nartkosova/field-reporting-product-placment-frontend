import { useState } from "react";
import Select from "react-select";
import { EntityList } from "../../../components/EntityList/EntityList";
import storeServices from "../../../services/storeServices";
import { Store } from "../../../types/storeInterface";
import darkSelectStyles from "../../../utils/darkSelectStyles";

const channelOptions = [
  { value: "MT", label: "MT" },
  { value: "TT", label: "TT" },
];

const Stores = () => {
  const [channel, setChannel] = useState("MT");

  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center flex-1 py-8 space-y-4">
        <div className="w-full">
          <Select
            options={channelOptions}
            defaultValue={channelOptions[0]}
            onChange={(option) => option && setChannel(option.value)}
            styles={darkSelectStyles}
          />
        </div>

        <EntityList
          title="Lista e Dyqaneve"
          fetchAll={async () => {
            const stores = await storeServices.getAllStores(channel);
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
