import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
const supabaseUrl = "https://sbpwgzxbzdherkhzxbmd.supabase.co";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const challengeToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();
    
    // Insert challenge via REST API
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/admin_auth_challenges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        challenge_token: challengeToken,
        status: "pending",
        expires_at: expiresAt,
      }),
    });

    if (!insertRes.ok) {
      throw new Error("Failed to create challenge");
    }

    // Get the created challenge
    const listRes = await fetch(
      `${supabaseUrl}/rest/v1/admin_auth_challenges?challenge_token=eq.${challengeToken}&select=id`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );
    
    const challenges = await listRes.json();
    const challenge = challenges[0];

    const verificationUrl = `https://andhrauniresults.com/admin/verify?challenge=${challenge.id}&token=${challengeToken}`;

    return new Response(
      JSON.stringify({
        success: true,
        challengeId: challenge.id,
        challengeToken: challengeToken,
        expiresAt: expiresAt,
        verificationUrl: verificationUrl,
        qrUrl: verificationUrl,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});