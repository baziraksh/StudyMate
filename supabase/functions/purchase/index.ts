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

    const { resourceId } = await req.json();

    if (!resourceId) {
      throw new Error("Resource ID is required");
    }

    // Get resource details
    const { data: resource, error: resourceError } = await supabase
      .from("resources")
      .select("*")
      .eq("id", resourceId)
      .eq("is_approved", true)
      .single();

    if (resourceError || !resource) {
      throw new Error("Resource not found or not approved");
    }

    // Check if already purchased
    const { data: existingTransaction } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("resource_id", resourceId)
      .eq("status", "completed")
      .single();

    if (existingTransaction) {
      throw new Error("Resource already purchased");
    }

    // For free resources, just create a completed transaction
    if (resource.is_free || resource.price === 0) {
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          resource_id: resourceId,
          amount: 0,
          status: "completed"
        })
        .select()
        .single();

      if (transactionError) {
        throw new Error(`Failed to create transaction: ${transactionError.message}`);
      }

    // Update download count
    await supabase
      .from("resources")
      .update({ download_count: resource.download_count + 1 })
      .eq("id", resourceId);

    // Award points for purchase
    await supabase.rpc("award_points", {
      user_uuid: user.id,
      points_amount: 5,
      action_type: "purchase"
    });

    // Create service role client for signed URL generation
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate signed URL for secure download (private bucket)
    const fileName = resource.file_url.split('/').pop();
    const { data: signedUrl, error: signedUrlError } = await supabaseService.storage
      .from("resources")
      .createSignedUrl(fileName!, 3600); // 1 hour expiry

    if (signedUrlError) {
      console.error("Signed URL error:", signedUrlError);
      throw new Error("Failed to generate download URL");
    }

    console.log("Free resource downloaded:", resourceId);

    return new Response(
      JSON.stringify({
        success: true,
        transaction,
        downloadUrl: signedUrl.signedUrl,
        message: "Resource downloaded successfully!"
      }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }

    // For paid resources, create pending transaction (mock payment)
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        resource_id: resourceId,
        amount: resource.price,
        status: "pending"
      })
      .select()
      .single();

    if (transactionError) {
      throw new Error(`Failed to create transaction: ${transactionError.message}`);
    }

    // Mock payment success (in real app, integrate with Stripe/PayPal)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update transaction status to completed
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ status: "completed" })
      .eq("id", transaction.id);

    if (updateError) {
      throw new Error(`Failed to complete transaction: ${updateError.message}`);
    }

    // Update download count
    await supabase
      .from("resources")
      .update({ download_count: resource.download_count + 1 })
      .eq("id", resourceId);

    // Award points for purchase
    await supabase.rpc("award_points", {
      user_uuid: user.id,
      points_amount: 5,
      action_type: "purchase"
    });

    // Create service role client for signed URL generation
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate signed URL for secure download (private bucket)
    const fileName = resource.file_url.split('/').pop();
    const { data: signedUrl, error: signedUrlError } = await supabaseService.storage
      .from("resources")
      .createSignedUrl(fileName!, 3600); // 1 hour expiry

    if (signedUrlError) {
      console.error("Signed URL error:", signedUrlError);
      throw new Error("Failed to generate download URL");
    }

    console.log("Paid resource purchased:", resourceId);

    return new Response(
      JSON.stringify({
        success: true,
        transaction: { ...transaction, status: "completed" },
        downloadUrl: signedUrl.signedUrl,
        message: "Payment successful! Resource is now available for download."
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("Purchase error:", error);
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