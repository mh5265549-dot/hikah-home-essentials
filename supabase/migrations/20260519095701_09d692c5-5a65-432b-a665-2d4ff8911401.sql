
CREATE OR REPLACE FUNCTION public.recalculate_order_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  computed_total NUMERIC := 0;
  item JSONB;
  prod_price NUMERIC;
  item_qty NUMERIC;
  item_name TEXT;
BEGIN
  IF NEW.items IS NULL OR jsonb_typeof(NEW.items) <> 'array' THEN
    RAISE EXCEPTION 'Order items must be a JSON array';
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    item_name := item->>'name';
    item_qty := COALESCE((item->>'quantity')::NUMERIC, 0);

    IF item_name IS NULL OR item_qty <= 0 THEN
      RAISE EXCEPTION 'Invalid order item: %', item;
    END IF;

    SELECT price INTO prod_price
    FROM public.products
    WHERE name = item_name
    LIMIT 1;

    IF prod_price IS NULL THEN
      RAISE EXCEPTION 'Unknown product: %', item_name;
    END IF;

    computed_total := computed_total + (prod_price * item_qty);
  END LOOP;

  NEW.total := computed_total;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS recalculate_order_total_trigger ON public.orders;
CREATE TRIGGER recalculate_order_total_trigger
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_order_total();
