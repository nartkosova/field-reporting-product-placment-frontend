import competitorServices from "../../../services/competitorServices";
import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";
import { competitorFields } from "./CompetitorFields";
import { useProductCategories } from "../../../hooks/useProductCategories";
const CreateCompetitorBrand = () => {
  const { categories } = useProductCategories();

  return (
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
      submitText="Create Brand"
    />
  );
};

export default CreateCompetitorBrand;
