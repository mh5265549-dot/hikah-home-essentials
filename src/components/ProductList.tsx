import { products, categories } from "@/data/products";
import ProductCard from "./ProductCard";
import { forwardRef } from "react";

interface ProductListProps {
  selectedCategory: string | null;
}

const ProductList = forwardRef<HTMLDivElement, ProductListProps>(
  ({ selectedCategory }, ref) => {
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
              {filteredProducts.length} items
            </span>
          </div>
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
        </div>
      </section>
    );
  }
);

ProductList.displayName = "ProductList";

export default ProductList;
