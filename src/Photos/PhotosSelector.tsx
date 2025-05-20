import CategorySelector from "../Components/CategorySelector/CategorySelector";

const PhotoSelector = () => {
  return (
    <CategorySelector
      routeBase="/photos"
      buttonLinks={[
        { label: "Primare", path: "/primare" },
        { label: "Sekondare", path: "/sekondare" },
        { label: "Terciare", path: "/terciare" },
      ]}
    />
  );
};

export default PhotoSelector;
