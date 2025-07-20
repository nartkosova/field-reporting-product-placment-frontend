import CategorySelector from "../../components/CategorySelector/CategorySelector";

const PhotoSelector = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center flex-1 py-8">
        <CategorySelector
          routeBase="/photos"
          buttonLinks={[
            { label: "Primare", path: "/primare" },
            { label: "Sekondare", path: "/sekondare" },
            { label: "Produkt i Ri", path: "/produkt-i-ri" },
            { label: "Aksion", path: "/aksion" },
            { label: "Fletushka", path: "/fletushka" },
            { label: "Korporative", path: "/korporative" },
          ]}
          categoryRequired={true}
        />
      </div>
    </div>
  );
};

export default PhotoSelector;
