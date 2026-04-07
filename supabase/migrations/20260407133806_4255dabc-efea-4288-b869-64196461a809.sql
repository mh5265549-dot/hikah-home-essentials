
-- Products table with dynamic pricing
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  seasonal BOOLEAN DEFAULT false,
  season_label TEXT,
  last_price_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Allow everyone to read products (public store)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);

-- Price history for tracking changes
CREATE TABLE public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  old_price NUMERIC NOT NULL,
  new_price NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view price history" ON public.price_history FOR SELECT USING (true);
