import CategorySelector from "../../components/CategorySelector/CategorySelector";

const PhotoCompanySelector = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-0 sm:p-0">
      <CategorySelector
        routeBase="/photos"
        buttonLinks={[
          { label: "Foto Podravka", path: `/podravka` },
          { label: "Foto Konkurrenca", path: `/competitor` },
        ]}
        categoryRequired={false}
      />
    </div>
  );
};

export default PhotoCompanySelector;
