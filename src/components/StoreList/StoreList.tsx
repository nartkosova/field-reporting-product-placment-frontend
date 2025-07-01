import { NavLink } from "react-router-dom";
import { StoreListProps } from "../../types/storeInterface";

const StoreList = ({ stores, user, showLocation = true }: StoreListProps) => {
  return (
    <div className="flex flex-col p-6 max-w-xl space-y-4 mx-auto">
      <h1 className="text-3xl font-bold">Marketet per perdoruesin: {user}</h1>
      <ul className="space-y-4">
        {stores.map((store) => (
          <NavLink key={store.store_id} to={`${store.store_id}`}>
            <li className="bg-blue-600 text-white cursor-pointer font-medium px-4 mb-4 py-2 rounded hover:bg-blue-800">
              <strong>{store.store_name}</strong> ({store.store_code}) (
              {store.store_category}){showLocation && <p>{store.location}</p>}
            </li>
          </NavLink>
        ))}
      </ul>
    </div>
  );
};

export default StoreList;
