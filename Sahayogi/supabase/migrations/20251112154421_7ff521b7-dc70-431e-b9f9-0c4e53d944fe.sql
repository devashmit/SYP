-- Enable RLS on categories table (it was missed)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read categories
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);