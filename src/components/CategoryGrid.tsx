import { categories } from "@/data/products";

interface CategoryGridProps {
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

const CategoryGrid = ({ selectedCategory, onSelectCategory }: CategoryGridProps) => {
  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        <h3 className="text-2xl font-bold text-foreground mb-6">Shop by Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() =>
                onSelectCategory(selectedCategory === cat.id ? null : cat.id)
              }
              className={`group relative overflow-hidden rounded-xl transition-all duration-300 animate-fade-in ${
                selectedCategory === cat.id
                  ? "ring-2 ring-primary ring-offset-2 scale-[1.02]"
                  : "card-shadow hover:card-hover-shadow hover:scale-[1.02]"
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  width={640}
                  height={640}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <span className="text-sm font-semibold text-primary-foreground drop-shadow-md">
                  {cat.emoji} {cat.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
