ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id uuid;

GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (user_id IS NOT NULL AND user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.create_order_authed(
  _customer_name text,
  _phone text,
  _address text,
  _items jsonb,
  _payment_method text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_id uuid;
  computed_total numeric := 0;
  item jsonb;
  prod_price numeric;
  item_qty numeric;
  item_name text;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF _items IS NULL OR jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'Order items must be a non-empty JSON array';
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(_items)
  LOOP
    item_name := item->>'name';
    item_qty := COALESCE((item->>'quantity')::numeric, 0);

    IF item_name IS NULL OR item_qty <= 0 THEN
      RAISE EXCEPTION 'Invalid order item: %', item;
    END IF;

    SELECT price INTO prod_price FROM public.products WHERE name = item_name LIMIT 1;

    IF prod_price IS NULL THEN
      RAISE EXCEPTION 'Unknown product: %', item_name;
    END IF;

    computed_total := computed_total + (prod_price * item_qty);
  END LOOP;

  INSERT INTO public.orders (customer_name, phone, address, items, total, payment_method, user_id)
  VALUES (_customer_name, _phone, _address, _items, computed_total, _payment_method, uid)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_order_authed(text, text, text, jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_order_authed(text, text, text, jsonb, text) TO authenticated;