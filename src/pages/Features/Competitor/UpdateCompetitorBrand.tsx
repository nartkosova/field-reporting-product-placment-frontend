import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import competitorServices from "../../../services/competitorServices";
import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";

const UpdateCompetitorBrand = () => {
  const { id } = useParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const brand = await competitorServices.getCompetitorBrandById(
          Number(id)
        );
        setInitialValues({ brand_name: brand.brand_name });
      } catch (err) {
        console.error("Failed to load brand", err);
        alert("Error loading brand data");
      } finally {
        setLoading(false);
      }
    };

    fetchBrand();
  }, [id]);

  const handleUpdate = async (data: Record<string, string | number>) => {
    if (!id) return;
    await competitorServices.updateCompetitorBrand(Number(id), {
      brand_name: data.brand_name as string,
    });
    alert("Koknkurrenca u perditua me sukses.");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <CreateUpdateForm
      title="Update Competitor Brand"
      fields={[{ name: "brand_name", label: "Brand Name" }]}
      initialValues={initialValues}
      onSubmit={handleUpdate}
      submitText="Update Brand"
    />
  );
};

export default UpdateCompetitorBrand;
