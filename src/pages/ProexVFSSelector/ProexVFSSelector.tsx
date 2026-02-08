import CategorySelector from "../../components/CategorySelector/CategorySelector";

const proexVfsLinks = [
  { label: "VFS", path: "/vfs" },
  { label: "Proex", path: "/proex" },
];

const ProexVFSSelector = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center flex-1 py-8">
        <CategorySelector
          routeBase="/proex-vfs"
          buttonLinks={proexVfsLinks}
          categoryRequired={false}
          textRendered={false}
          storeRequired={false}
        />
      </div>
    </div>
  );
};

export default ProexVFSSelector;
