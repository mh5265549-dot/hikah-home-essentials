import { useState, useRef } from "react";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import CategoryGrid from "@/components/CategoryGrid";
import ProductList from "@/components/ProductList";
import CheckoutFlow from "@/components/CheckoutFlow";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const productRef = useRef<HTMLDivElement>(null);

  const scrollToProducts = () => {
    productRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCategorySelect = (id: string | null) => {
    setSelectedCategory(id);
    setTimeout(() => productRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setShowCheckout(true)} />
      <HeroBanner onShopNow={scrollToProducts} />
      <CategoryGrid selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} />
      <ProductList ref={productRef} selectedCategory={selectedCategory} />

      {/* Footer */}
      <footer className="bg-foreground text-primary-foreground py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="font-bold text-lg mb-1">HIKAH</p>
          <p className="text-sm opacity-70">Fresh Groceries, Delivered with Love 💚</p>
          <p className="text-xs opacity-50 mt-4">© 2026 HIKAH. All rights reserved.</p>
        </div>
      </footer>

      {showCheckout && <CheckoutFlow onClose={() => setShowCheckout(false)} />}
    </div>
  );
};

export default Index;
