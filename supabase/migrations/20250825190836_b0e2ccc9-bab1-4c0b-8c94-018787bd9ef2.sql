-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('resources', 'resources', false),
  ('previews', 'previews', true),
  ('avatars', 'avatars', true);

-- Create storage policies for resources bucket
CREATE POLICY "Authenticated users can upload resources" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'resources' AND 
  auth.uid() IS NOT NULL AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own resources" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'resources' AND 
  auth.uid() IS NOT NULL AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own resources" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'resources' AND 
  auth.uid() IS NOT NULL AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policies for previews bucket (public)
CREATE POLICY "Anyone can view previews" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'previews');

CREATE POLICY "Authenticated users can upload previews" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'previews' AND 
  auth.uid() IS NOT NULL
);

-- Create storage policies for avatars bucket (public)
CREATE POLICY "Anyone can view avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid() IS NOT NULL AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' AND 
  auth.uid() IS NOT NULL AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add trigger for updating resource ratings
CREATE OR REPLACE FUNCTION update_resource_rating()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create triggers for rating updates
CREATE TRIGGER update_rating_on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_resource_rating();

CREATE TRIGGER update_rating_on_review_update
  AFTER UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_resource_rating();

CREATE TRIGGER update_rating_on_review_delete
  AFTER DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_resource_rating();

-- Add points reward function
CREATE OR REPLACE FUNCTION award_points(user_uuid UUID, points_amount INTEGER, action_type TEXT)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql;