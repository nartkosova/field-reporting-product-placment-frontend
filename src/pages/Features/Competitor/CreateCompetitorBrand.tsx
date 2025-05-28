import competitorServices from "../../../services/competitorServices";
import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";

const CreateCompetitorBrand = () => {
  return (
    <CreateUpdateForm
      title="Krijo Konkurrencen"
      fields={[{ name: "brand_name", label: "Emri i Konkurrences" }]}
      onSubmit={(data) =>
        competitorServices.createCompetitorBrand({
          brand_name: data.brand_name as string,
        })
      }
      submitText="Create Brand"
    />
  );
};

export default CreateCompetitorBrand;
