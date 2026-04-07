import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Product, categories } from "@/data/products";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { items, addToCart, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.product.id === product.id);
  const category = categories.find((c) => c.id === product.category);

  return (
    <div className="bg-card rounded-xl card-shadow hover:card-hover-shadow transition-all duration-300 p-4 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <span className="text-xs text-muted-foreground font-medium">
            {category?.emoji} {category?.name}
          </span>
          <h4 className="text-base font-semibold text-foreground mt-0.5">{product.name}</h4>
        </div>
      </div>
      <div className="flex items-end justify-between mt-auto">
        <div>
          <p className="text-lg font-bold text-primary">Rs. {product.price}</p>
          <p className="text-xs text-muted-foreground">per {product.unit}</p>
        </div>
        {cartItem ? (
          <div className="flex items-center gap-1.5 bg-primary rounded-full px-1 py-0.5">
            <button
              onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors text-primary-foreground"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-bold text-primary-foreground min-w-[20px] text-center">
              {cartItem.quantity}
            </span>
            <button
              onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors text-primary-foreground"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(product)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
