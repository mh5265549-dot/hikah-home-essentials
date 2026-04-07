import { categories, type Product } from "@/data/products";
import { productImages } from "@/data/productImages";
import ProductCard from "./ProductCard";
import { forwardRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProductListProps {
  selectedCategory: string | null;
}

const ProductList = forwardRef<HTMLDivElement, ProductListProps>(
  ({ selectedCategory }, ref) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchProducts = async () => {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, price, category, unit, seasonal, season_label, last_price_update");

        if (error) {
          console.error("Failed to fetch products:", error);
          // Fallback to static data
          const { products: staticProducts } = await import("@/data/products");
          setProducts(staticProducts);
        } else {
          setProducts(
            data.map((p) => ({
              id: p.id,
              name: p.name,
              price: Number(p.price),
              category: p.category,
              unit: p.unit,
              seasonal: p.seasonal || false,
              seasonLabel: p.season_label || undefined,
            }))
          );
        }
        setLoading(false);
      };

      fetchProducts();
    }, []);

    const filteredProducts = selectedCategory
      ? products.filter((p) => p.category === selectedCategory)
      : products;

    const categoryName = selectedCategory
      ? categories.find((c) => c.id === selectedCategory)?.name
      : "All Products";

    return (
      <section ref={ref} className="py-8 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-foreground">{categoryName}</h3>
            <span className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${filteredProducts.length} items`}
            </span>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }
);

ProductList.displayName = "ProductList";

export default ProductList;
