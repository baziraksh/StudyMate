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

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const subject = formData.get("subject") as string;
    const category = formData.get("category") as string;
    const semester = formData.get("semester") as string;
    const year = formData.get("year") as string;
    const price = formData.get("price") as string;
    const isFree = formData.get("isFree") === "true";

    if (!file || !title || !subject || !category) {
      throw new Error("Missing required fields");
    }

    // Upload file to storage
    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("resources")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get file URL
    const { data: { publicUrl } } = supabase.storage
      .from("resources")
      .getPublicUrl(fileName);

    // Insert resource record
    const { data: resourceData, error: resourceError } = await supabase
      .from("resources")
      .insert({
        title,
        description,
        subject,
        category,
        semester: semester ? parseInt(semester) : null,
        year: year ? parseInt(year) : null,
        price: isFree ? 0 : parseFloat(price || "0"),
        is_free: isFree,
        uploader_id: user.id,
        file_url: publicUrl,
        is_approved: false // Admin approval required
      })
      .select()
      .single();

    if (resourceError) {
      console.error("Resource creation error:", resourceError);
      throw new Error(`Failed to create resource: ${resourceError.message}`);
    }

    // Award points for uploading
    await supabase.rpc("award_points", {
      user_uuid: user.id,
      points_amount: 10,
      action_type: "upload"
    });

    console.log("Resource uploaded successfully:", resourceData.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        resource: resourceData,
        message: "Resource uploaded successfully! It will be available after admin approval."
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201
      }
    );

  } catch (error) {
    console.error("Upload resource error:", error);
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