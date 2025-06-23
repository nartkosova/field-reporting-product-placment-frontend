import CategorySelector from "../../components/CategorySelector/CategorySelector";

const PhotoSelector = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-0 sm:p-0">
      <CategorySelector
        routeBase="/photos"
        buttonLinks={[
          { label: "Primare", path: "/primare" },
          { label: "Sekondare", path: "/sekondare" },
          { label: "Fletushka", path: "/fletushka" },
          { label: "Korporative", path: "/korporative" },
        ]}
        categoryRequired={true}
      />
    </div>
  );
};

export default PhotoSelector;
