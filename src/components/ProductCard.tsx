import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Product, categories } from "@/data/products";
import { productImages } from "@/data/productImages";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { items, addToCart, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.product.id === product.id);
  const image = productImages[product.id];

  return (
    <div className="bg-card rounded-xl card-shadow hover:card-hover-shadow transition-all duration-300 overflow-hidden flex flex-col">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          width={512}
          height={512}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h4 className="text-sm font-semibold text-foreground leading-tight">{product.name}</h4>
        <div className="flex items-end justify-between mt-auto pt-2">
          <div>
            <p className="text-base font-bold text-primary">Rs. {product.price}</p>
            <p className="text-[11px] text-muted-foreground">per {product.unit}</p>
          </div>
          {cartItem ? (
            <div className="flex items-center gap-1 bg-primary rounded-full px-0.5 py-0.5">
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors text-primary-foreground"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold text-primary-foreground min-w-[16px] text-center">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors text-primary-foreground"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product)}
              className="flex items-center gap-1 bg-primary text-primary-foreground px-2.5 py-1.5 rounded-full text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
