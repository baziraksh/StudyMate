import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role for profile access to bypass RLS restrictions
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (req.method === "GET") {
      // Get reviews for a resource
      const url = new URL(req.url);
      const resourceId = url.searchParams.get("resourceId");

      if (!resourceId) {
        throw new Error("Resource ID is required");
      }

      const { data: reviews, error } = await supabase
        .from("reviews")
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq("resource_id", resourceId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch reviews: ${error.message}`);
      }

      console.log(`Fetched ${reviews?.length || 0} reviews for resource ${resourceId}`);

      return new Response(
        JSON.stringify({
          success: true,
          reviews: reviews || []
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );

    } else if (req.method === "POST") {
      // Add a review
      const authHeader = req.headers.get("Authorization")!;
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        throw new Error("Unauthorized");
      }

      const { resourceId, rating, comment } = await req.json();

      if (!resourceId || !rating) {
        throw new Error("Resource ID and rating are required");
      }

      if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      // Check if user already reviewed this resource
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", user.id)
        .eq("resource_id", resourceId)
        .single();

      if (existingReview) {
        throw new Error("You have already reviewed this resource");
      }

      // Check if user has purchased this resource
      const { data: purchase } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("resource_id", resourceId)
        .eq("status", "completed")
        .single();

      if (!purchase) {
        throw new Error("You must purchase this resource before reviewing it");
      }

      const { data: review, error } = await supabase
        .from("reviews")
        .insert({
          user_id: user.id,
          resource_id: resourceId,
          rating,
          comment: comment || null
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create review: ${error.message}`);
      }

      // Award points for reviewing
      await supabase.rpc("award_points", {
        user_uuid: user.id,
        points_amount: 3,
        action_type: "review"
      });

      console.log("Review created:", review.id);

      return new Response(
        JSON.stringify({
          success: true,
          review,
          message: "Review added successfully!"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201
        }
      );
    }

  } catch (error) {
    console.error("Reviews error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});