import { ShoppingCart, Leaf } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onCartClick: () => void;
}

const Header = ({ onCartClick }: HeaderProps) => {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">HIKMAH</h1>
            <p className="text-xs text-muted-foreground -mt-0.5">Fresh Groceries</p>
          </div>
        </div>

        <button
          onClick={onCartClick}
          className="relative p-2.5 rounded-xl bg-accent hover:bg-primary hover:text-primary-foreground transition-all duration-200"
        >
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 h-5 min-w-5 flex items-center justify-center p-0 text-[10px] bg-secondary text-secondary-foreground border-2 border-card">
              {totalItems}
            </Badge>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
