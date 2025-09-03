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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      throw new Error(`Failed to fetch profile: ${profileError.message}`);
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "student";

    let dashboardData = {
      user: {
        id: user.id,
        email: user.email,
        ...profile
      }
    };

    if (type === "student") {
      // Student dashboard data
      const [purchasesResult, wishlistResult] = await Promise.all([
        supabase
          .from("transactions")
          .select("*, resources(*)")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(5),
        
        supabase
          .from("wishlist")
          .select("*, resources(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)
      ]);

      if (purchasesResult.error) {
        throw new Error(`Failed to fetch purchases: ${purchasesResult.error.message}`);
      }
      if (wishlistResult.error) {
        throw new Error(`Failed to fetch wishlist: ${wishlistResult.error.message}`);
      }

      dashboardData = {
        ...dashboardData,
        recentPurchases: purchasesResult.data || [],
        wishlistItems: wishlistResult.data || [],
        stats: {
          totalPurchases: purchasesResult.data?.length || 0,
          wishlistCount: wishlistResult.data?.length || 0,
          points: profile.points || 0
        }
      };

    } else if (type === "uploader") {
      // Uploader dashboard data
      const [resourcesResult, earningsResult] = await Promise.all([
        supabase
          .from("resources")
          .select("*")
          .eq("uploader_id", user.id)
          .order("created_at", { ascending: false }),
        
        supabase
          .from("transactions")
          .select("amount")
          .in("resource_id", (await supabase
            .from("resources")
            .select("id")
            .eq("uploader_id", user.id)
          ).data?.map(r => r.id) || [])
          .eq("status", "completed")
      ]);

      if (resourcesResult.error) {
        throw new Error(`Failed to fetch resources: ${resourcesResult.error.message}`);
      }

      const totalEarnings = earningsResult.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const approvedResources = resourcesResult.data?.filter(r => r.is_approved).length || 0;
      const pendingResources = resourcesResult.data?.filter(r => !r.is_approved).length || 0;

      dashboardData = {
        ...dashboardData,
        uploadedResources: resourcesResult.data || [],
        stats: {
          totalUploads: resourcesResult.data?.length || 0,
          approvedUploads: approvedResources,
          pendingUploads: pendingResources,
          totalEarnings,
          totalDownloads: resourcesResult.data?.reduce((sum, r) => sum + (r.download_count || 0), 0) || 0
        }
      };

    } else if (type === "admin") {
      // Admin dashboard data
      const [pendingResourcesResult, allUsersResult, recentTransactionsResult] = await Promise.all([
        supabase
          .from("resources")
          .select("*, profiles:uploader_id(display_name)")
          .eq("is_approved", false)
          .order("created_at", { ascending: false }),
        
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
        
        supabase
          .from("transactions")
          .select("*, resources(title), profiles:user_id(display_name)")
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(10)
      ]);

      if (pendingResourcesResult.error) {
        throw new Error(`Failed to fetch pending resources: ${pendingResourcesResult.error.message}`);
      }

      dashboardData = {
        ...dashboardData,
        pendingResources: pendingResourcesResult.data || [],
        recentUsers: allUsersResult.data || [],
        recentTransactions: recentTransactionsResult.data || [],
        stats: {
          pendingApprovals: pendingResourcesResult.data?.length || 0,
          totalUsers: allUsersResult.data?.length || 0,
          recentTransactions: recentTransactionsResult.data?.length || 0
        }
      };
    }

    console.log(`Fetched ${type} dashboard data for user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: dashboardData
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("Dashboard error:", error);
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