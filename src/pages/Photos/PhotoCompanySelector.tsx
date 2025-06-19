import CategorySelector from "../../components/CategorySelector/CategorySelector";

const PhotoCompanySelector = () => {
  return (
    <CategorySelector
      routeBase="/photos"
      buttonLinks={[
        { label: "Foto Podravka", path: `/podravka` },
        { label: "Foto Konkurrenca", path: `/competitor` },
      ]}
      categoryRequired={false}
    />
  );
};

export default PhotoCompanySelector;
