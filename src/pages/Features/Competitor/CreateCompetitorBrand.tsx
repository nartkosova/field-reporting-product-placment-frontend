import competitorServices from "../../../services/competitorServices";
import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";
import { competitorFields } from "./CompetitorFields";
import { useProductCategories } from "../../../hooks/useProductCategories";
const CreateCompetitorBrand = () => {
  const { categories } = useProductCategories();

  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center flex-1 py-8">
        <CreateUpdateForm
          title="Krijo Konkurrencen"
          fields={competitorFields({
            categoryOptions: categories.map((cat) => ({
              label: cat,
              value: cat,
            })),
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
