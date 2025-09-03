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

    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const subject = url.searchParams.get("subject");
    const semester = url.searchParams.get("semester");
    const year = url.searchParams.get("year");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = supabase
      .from("resources")
      .select(`
        *,
        profiles:uploader_id (
          display_name,
          avatar_url
        )
      `)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq("category", category);
    }
    if (subject) {
      query = query.ilike("subject", `%${subject}%`);
    }
    if (semester) {
      query = query.eq("semester", parseInt(semester));
    }
    if (year) {
      query = query.eq("year", parseInt(year));
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,subject.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: resources, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch resources: ${error.message}`);
    }

    // Get total count for pagination
    let countQuery = supabase
      .from("resources")
      .select("*", { count: "exact", head: true })
      .eq("is_approved", true);

    if (category) countQuery = countQuery.eq("category", category);
    if (subject) countQuery = countQuery.ilike("subject", `%${subject}%`);
    if (semester) countQuery = countQuery.eq("semester", parseInt(semester));
    if (year) countQuery = countQuery.eq("year", parseInt(year));
    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,subject.ilike.%${search}%`);
    }

    const { count } = await countQuery;

    console.log(`Fetched ${resources?.length || 0} resources`);

    return new Response(
      JSON.stringify({
        success: true,
        resources: resources || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("Fetch resources error:", error);
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