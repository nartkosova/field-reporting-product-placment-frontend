import { useParams } from "react-router-dom";
import CategorySelector from "../../components/CategorySelector/CategorySelector";

const PhotoCompanySelector = () => {
  const { storeId } = useParams<{ storeId: string }>();
  return (
    <CategorySelector
      routeBase="/photos"
      buttonLinks={[
        { label: "Foto Podravka", path: `/${storeId}/podravka` },
        { label: "Foto Konkurrenca", path: `/${storeId}/competitor` },
      ]}
      categoryRequired={false}
    />
  );
};

export default PhotoCompanySelector;
