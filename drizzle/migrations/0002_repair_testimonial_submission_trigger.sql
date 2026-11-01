CREATE OR REPLACE FUNCTION public.limit_submissions()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF tg_table_name = 'enquiries' THEN
    IF (SELECT count(*) FROM public.enquiries WHERE lower(email) = lower(new.email) AND created_at > now() - interval '1 hour') >= 5 THEN
      RAISE EXCEPTION 'Too many submissions. Please try again later.';
    END IF;
  ELSIF tg_table_name = 'testimonials' THEN
    IF (SELECT count(*) FROM public.testimonials WHERE created_at > now() - interval '1 hour' AND status = 'pending') >= 30 THEN
      RAISE EXCEPTION 'Too many submissions. Please try again later.';
    END IF;
  END IF;
  RETURN new;
END $$;