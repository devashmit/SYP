-- Add help_type column to posts to indicate if seeking or offering help
ALTER TABLE public.posts ADD COLUMN help_type VARCHAR(20) DEFAULT 'offering' CHECK (help_type IN ('offering', 'seeking'));

-- Update existing posts to have help_type
UPDATE public.posts SET help_type = 'offering' WHERE help_type IS NULL;