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
