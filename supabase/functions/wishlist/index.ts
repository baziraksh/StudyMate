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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    if (req.method === "GET") {
      // Get user's wishlist
      const { data: wishlist, error } = await supabase
        .from("wishlist")
        .select(`
          *,
          resources (
            id,
            title,
            description,
            subject,
            category,
            price,
            is_free,
            thumbnail_url,
            average_rating,
            download_count
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch wishlist: ${error.message}`);
      }

      console.log(`Fetched ${wishlist?.length || 0} wishlist items for user ${user.id}`);

      return new Response(
        JSON.stringify({
          success: true,
          wishlist: wishlist || []
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );

    } else if (req.method === "POST") {
      // Add to wishlist
      const { resourceId } = await req.json();

      if (!resourceId) {
        throw new Error("Resource ID is required");
      }

      // Check if already in wishlist
      const { data: existing } = await supabase
        .from("wishlist")
        .select("*")
        .eq("user_id", user.id)
        .eq("resource_id", resourceId)
        .single();

      if (existing) {
        throw new Error("Resource already in wishlist");
      }

      const { data: wishlistItem, error } = await supabase
        .from("wishlist")
        .insert({
          user_id: user.id,
          resource_id: resourceId
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add to wishlist: ${error.message}`);
      }

      console.log("Added to wishlist:", resourceId);

      return new Response(
        JSON.stringify({
          success: true,
          wishlistItem,
          message: "Added to wishlist successfully!"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201
        }
      );

    } else if (req.method === "DELETE") {
      // Remove from wishlist
      const url = new URL(req.url);
      const resourceId = url.searchParams.get("resourceId");

      if (!resourceId) {
        throw new Error("Resource ID is required");
      }

      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("resource_id", resourceId);

      if (error) {
        throw new Error(`Failed to remove from wishlist: ${error.message}`);
      }

      console.log("Removed from wishlist:", resourceId);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Removed from wishlist successfully!"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }

  } catch (error) {
    console.error("Wishlist error:", error);
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