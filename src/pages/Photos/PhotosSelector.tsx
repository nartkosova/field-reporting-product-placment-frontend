import CategorySelector from "../../components/CategorySelector/CategorySelector";

const PhotoSelector = () => {
  return (
    <CategorySelector
      routeBase="/photos"
      buttonLinks={[
        { label: "Primare", path: "/primare" },
        { label: "Sekondare", path: "/sekondare" },
        { label: "Fletushka e Podravkes", path: "/feltushka" },
        { label: "Korporative", path: "/korporative" },
      ]}
      categoryRequired={true}
    />
  );
};

export default PhotoSelector;
