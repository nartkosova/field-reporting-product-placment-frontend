import CategorySelector from "../../components/CategorySelector/CategorySelector";

const PhotoCompanySelector = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center flex-1 py-8">
        <CategorySelector
          routeBase="/photos"
          buttonLinks={[
            { label: "Foto Podravka", path: `/podravka` },
            { label: "Foto Konkurrenca", path: `/competitor` },
          ]}
          categoryRequired={false}
        />
      </div>
    </div>
  );
};

export default PhotoCompanySelector;
