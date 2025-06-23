import competitorServices from "../../../services/competitorServices";
import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";
import { competitorFields } from "./CompetitorFields";
import { useProductCategories } from "../../../hooks/useProductCategories";
const CreateCompetitorBrand = () => {
  const { categories } = useProductCategories();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-0 sm:p-0">
      <div className="max-w-xl w-full">
        <CreateUpdateForm
          title="Krijo Konkurrencen"
          fields={competitorFields({
            categoryOptions: categories.map((cat) => ({ label: cat, value: cat })),
          })}
          onSubmit={(data) =>
            competitorServices.createCompetitorBrand({
              brand_name: data.brand_name as string,
              categories: data.categories as string[],
            })
          }
          submitText="Krijo Konkurrent"
        />
      </div>
    </div>
  );
};

export default CreateCompetitorBrand;
