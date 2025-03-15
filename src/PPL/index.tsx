import { useState } from "react";
import podravkaFacingsService from "../Services/podravkaFacingsService";

const PodravkaFacingsFormPage = () => {
  const [form, setForm] = useState({
    store_id: "",
    product_id: "",
    facings_count: "",
    report_date: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const userId = userInfo?.id;

    const data = {
      user_id: userId,
      store_id: Number(form.store_id),
      product_id: Number(form.product_id),
      facings_count: Number(form.facings_count),
      report_date: form.report_date,
    };

    try {
      await podravkaFacingsService.createPodravkaFacing(data);
      alert("Facings submitted successfully!");
      setForm({
        store_id: "",
        product_id: "",
        facings_count: "",
        report_date: "",
      });
    } catch (err) {
      alert("Error submitting facings");
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">Submit Podravka Facings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="store_id"
          className="border p-2 w-full"
          placeholder="Store ID"
          value={form.store_id}
          onChange={handleChange}
        />
        <input
          name="product_id"
          className="border p-2 w-full"
          placeholder="Product ID"
          value={form.product_id}
          onChange={handleChange}
        />
        <input
          name="facings_count"
          className="border p-2 w-full"
          placeholder="Facings Count"
          value={form.facings_count}
          onChange={handleChange}
        />
        <input
          name="report_date"
          className="border p-2 w-full"
          type="date"
          value={form.report_date}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 w-full rounded hover:bg-indigo-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default PodravkaFacingsFormPage;
