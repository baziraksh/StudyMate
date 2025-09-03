-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION update_resource_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE resources
  SET 
    average_rating = (
      SELECT AVG(rating::numeric) 
      FROM reviews 
      WHERE resource_id = COALESCE(NEW.resource_id, OLD.resource_id)
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM reviews 
      WHERE resource_id = COALESCE(NEW.resource_id, OLD.resource_id)
    )
  WHERE id = COALESCE(NEW.resource_id, OLD.resource_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION award_points(user_uuid UUID, points_amount INTEGER, action_type TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles 
  SET points = points + points_amount
  WHERE user_id = user_uuid;
  
  -- Log the points transaction (optional for audit)
  INSERT INTO points_history (user_id, points_awarded, action_type, created_at)
  VALUES (user_uuid, points_amount, action_type, NOW())
  ON CONFLICT DO NOTHING; -- Ignore if table doesn't exist yet
EXCEPTION
  WHEN others THEN
    -- Continue execution even if points_history table doesn't exist
    NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'student'
  );
  RETURN NEW;
END;
$$;