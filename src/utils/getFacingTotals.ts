import { PodravkaFacingReport } from "../types/podravkaFacingInterface";
import { Facing } from "../types/reportInterface";

export const getFacingTotals = (rows: Facing[]) => {
  const podravka = rows.reduce(
    (sum, row) => sum + Number(row.total_facings),
    0
  );

  const competitor = rows.reduce((sum, row) => {
    return (
      sum +
      Object.values(row.competitors || {}).reduce(
        (innerSum, val) => innerSum + Number(val),
        0
      )
    );
  }, 0);

  return {
    podravka,
    competitor,
    total: podravka + competitor,
  };
};

export const getPodravkaOnlyFacingTotals = (rows: PodravkaFacingReport[]) => {
  let podravka = 0;
  let estimatedTotal = 0;

  for (const row of rows) {
    const pf = Number(row.total_facings);
    const percent = Number(row.facing_percentage_in_category ?? 0);

    podravka += pf;

    if (percent > 0) {
      estimatedTotal += pf / (percent / 100);
    }
  }

  return {
    podravka,
    total: estimatedTotal,
  };
};
