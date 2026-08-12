import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: log } = await supabase
      .from("analytics_sync_log")
      .insert({ source: "gsc", status: "running" })
      .select()
      .single();

    const gscSiteUrl = Deno.env.get("GSC_SITE_URL");
    const ga4Credentials = Deno.env.get("GA4_SERVICE_ACCOUNT_KEY");

    if (!gscSiteUrl || !ga4Credentials) {
      await supabase
        .from("analytics_sync_log")
        .update({ status: "skipped", error_message: "GSC credentials not configured", completed_at: new Date().toISOString() })
        .eq("id", log?.id);

      return new Response(
        JSON.stringify({ ok: true, message: "GSC credentials not configured. Set GSC_SITE_URL and GA4_SERVICE_ACCOUNT_KEY." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const creds = JSON.parse(ga4Credentials);
    const accessToken = await getAccessToken(creds);

    // Fetch search analytics
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const response = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(gscSiteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ["date", "page"],
          rowLimit: 5000,
        }),
      }
    );

    const data = await response.json();
    let rowsSynced = 0;

    if (data.rows) {
      for (const row of data.rows) {
        const date = row.keys?.[0];
        const page = row.keys?.[1];

        await supabase.from("analytics_snapshots").upsert(
          {
            date,
            page_url: page,
            impressions: Math.round(row.impressions || 0),
            clicks: Math.round(row.clicks || 0),
            ctr: row.ctr || 0,
            avg_position: row.position || 0,
          },
          { onConflict: "date,page_url" }
        );
        rowsSynced++;
      }
    }

    await supabase
      .from("analytics_sync_log")
      .update({ status: "success", completed_at: new Date().toISOString(), rows_synced: rowsSynced })
      .eq("id", log?.id);

    return new Response(
      JSON.stringify({ ok: true, synced: rowsSynced }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function getAccessToken(creds: { client_email: string; private_key: string; token_uri: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: creds.client_email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: creds.token_uri,
    iat: now,
    exp: now + 3600,
  };

  const encoder = new TextEncoder();
  const headerBase64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadBase64 = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const unsignedJwt = `${headerBase64}.${payloadBase64}`;

  const privateKeyPem = creds.private_key.replace(/-----BEGIN PRIVATE KEY-----/, "").replace(/-----END PRIVATE KEY-----/, "").replace(/\s/g, "");
  const privateKeyBuffer = Uint8Array.from(atob(privateKeyPem), (c) => c.charCodeAt(0));

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, encoder.encode(unsignedJwt));
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const jwt = `${unsignedJwt}.${signatureBase64}`;

  const tokenResponse = await fetch(creds.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const { access_token } = await tokenResponse.json();
  return access_token;
}
