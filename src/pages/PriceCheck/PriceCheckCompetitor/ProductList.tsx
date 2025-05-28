import { CompetitorProduct } from "../../../types/productInterface";

interface Props {
  products: CompetitorProduct[];
  prices: {
    [key: number]: {
      regular_price?: number;
      deal_price?: number;
      discount_description?: string;
    };
  };
  onPriceChange: (id: number, field: string, value: string | number) => void;
}

const ProductList = ({ products, prices, onPriceChange }: Props) => {
  return (
    <>
      {products.map((p) => (
        <div
          key={p.competitor_product_id}
          className="border p-2 rounded space-y-2"
        >
          <label className="font-medium block">
            {p.name} ({p.category}) - {p.weight}g
          </label>
          <input
            type="number"
            className="border p-2 w-full"
            placeholder="Regular Price"
            step="0.01"
            value={prices[p.competitor_product_id]?.regular_price ?? ""}
            onChange={(e) =>
              onPriceChange(
                p.competitor_product_id,
                "regular_price",
                parseFloat(e.target.value)
              )
            }
            min="0"
            required
          />
          <input
            type="number"
            className="border p-2 w-full"
            placeholder="Deal Price (optional)"
            step="0.01"
            value={prices[p.competitor_product_id]?.deal_price ?? ""}
            onChange={(e) =>
              onPriceChange(
                p.competitor_product_id,
                "discount_description",
                e.target.value
              )
            }
            min="0"
          />
          <input
            type="text"
            className="border p-2 w-full"
            placeholder="Discount Description (optional)"
            value={prices[p.competitor_product_id]?.discount_description ?? ""}
            onChange={(e) =>
              onPriceChange(
                p.competitor_product_id,
                "discount_description",
                e.target.value
              )
            }
          />
        </div>
      ))}
    </>
  );
};

export default ProductList;
