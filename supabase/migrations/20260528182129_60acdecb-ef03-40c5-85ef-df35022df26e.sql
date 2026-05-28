CREATE OR REPLACE FUNCTION public.create_order(
  _customer_name text,
  _phone text,
  _address text,
  _items jsonb,
  _payment_method text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.orders (customer_name, phone, address, items, total, payment_method)
  VALUES (_customer_name, _phone, _address, _items, 0, _payment_method)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order(text, text, text, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order(text, text, text, jsonb, text) TO anon, authenticated;