import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  onShopNow: () => void;
}

const HeroBanner = ({ onShopNow }: HeroBannerProps) => {
  return (
    <section className="gradient-hero text-primary-foreground py-16 px-4">
      <div className="container mx-auto text-center max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
          Fresh Groceries,
          <br />
          Delivered to Your Door
        </h2>
        <p className="text-lg opacity-90 mb-8 font-light">
          Quality products at the best prices. Shop from the comfort of your home.
        </p>
        <Button
          onClick={onShopNow}
          size="lg"
          className="bg-card text-foreground hover:bg-card/90 font-semibold text-base px-8 rounded-full"
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          Shop Now
        </Button>
      </div>
    </section>
  );
};

export default HeroBanner;
