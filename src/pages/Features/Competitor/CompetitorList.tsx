import { EntityList } from "../../../components/EntityList/EntityList";
import competitorServices from "../../../services/competitorServices";

interface CompetitorBrand {
  competitor_id: number;
  brand_name: string;
  created_at: string;
}

const CompetitorList = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-0 sm:p-0">
      <EntityList
        title="Konkurrnca"
        fetchAll={async () => {
          const brands = await competitorServices.getAllCompetitorBrands();
          return brands.map((b: CompetitorBrand) => ({
            id: b.competitor_id,
            name: b.brand_name,
            created_at: b.created_at,
          }));
        }}
        onDelete={competitorServices.deleteCompetitorBrand}
        editPath="/settings/edit/competitor-brands"
        itemLabel="Konkurrenca"
      />
    </div>
  );
};

export default CompetitorList;
