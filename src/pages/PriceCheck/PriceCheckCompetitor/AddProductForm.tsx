import { useState } from "react";
import competitorServices from "../../../services/competitorServices";

interface Props {
  competitor_id: number;
  category: string;
  user_id: number;
  onProductAdded: () => void;
}

const AddProductForm = ({
  competitor_id,
  category,
  user_id,
  onProductAdded,
}: Props) => {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState<number | undefined>();

  const handleSubmit = async () => {
    if (!name) return;
    await competitorServices.createCompetitorProduct({
      name,
      weight,
      category,
      competitor_id,
      created_by: user_id,
    });
    setName("");
    setWeight(undefined);
    onProductAdded();
  };

  return (
    <div className="flex space-x-2 mt-4">
      <input
        type="text"
        className="border p-2 w-1/2"
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        className="border p-2 w-1/4"
        placeholder="Weight (optional)"
        value={weight ?? ""}
        onChange={(e) => setWeight(Number(e.target.value))}
      />
      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2"
      >
        Add Product
      </button>
    </div>
  );
};

export default AddProductForm;
