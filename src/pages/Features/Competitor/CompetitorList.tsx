import React from "react";
import { EntityList } from "../../../components/EntityList/EntityList";
import competitorServices from "../../../services/competitorServices";

interface CompetitorBrand {
  competitor_id: number;
  brand_name: string;
  created_at: string;
}

const CompetitorList = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center flex-1 py-8">
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
    </div>
  );
};

export default CompetitorList;
