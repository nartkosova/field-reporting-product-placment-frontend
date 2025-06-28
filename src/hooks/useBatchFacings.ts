import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

export interface BatchFacingsConfig<TMeta, TInput> {
  fetchBatch: (batchId: string) => Promise<TMeta[]>;
  makeKey: (meta: TMeta) => string;
  makeLabel: (meta: TMeta) => string;
  makePayload: (meta: TMeta, count: number) => TInput;
  submitBatch: (batchId: string, payload: TInput[]) => Promise<void>;
}

export const useBatchFacings = <
  TMeta extends { facings_count: number },
  TInput
>(
  batchId: string,
  config: BatchFacingsConfig<TMeta, TInput>
) => {
  const navigate = useNavigate();
  const [meta, setMeta] = useState<(TMeta & { label: string; _key: string })[]>(
    []
  );
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await config.fetchBatch(batchId);
        const enriched = data.map((m) => ({
          ...m,
          label: config.makeLabel(m),
          _key: config.makeKey(m), // internal use only
        }));
        setMeta(enriched);

        const initial = data.reduce<Record<string, number>>((acc, item) => {
          acc[config.makeKey(item)] = item.facings_count;
          return acc;
        }, {});
        setCounts(initial);
      } catch (err) {
        const msg =
          (err as AxiosError<{ error: string }>)?.response?.data?.error ??
          "Gabim gjatë ngarkimit.";
        alert(msg);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [batchId, config]);

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  const change = useCallback((key: string, value: number) => {
    setCounts((prev) => ({ ...prev, [key]: value }));
  }, []);

  const submit = useCallback(async () => {
    setSubmitting(true);
    try {
      const payload = meta.map((item) =>
        config.makePayload(item, counts[config.makeKey(item)] ?? 0)
      );
      await config.submitBatch(batchId, payload);
      alert("Përditësimi u krye me sukses.");
      navigate(-1);
    } catch (err) {
      const msg =
        (err as AxiosError<{ error: string }>)?.response?.data?.error ??
        "Gabim gjatë përditësimit.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  }, [meta, counts, batchId, config, navigate]);

  return { meta, counts, loading, submitting, total, change, submit };
};
