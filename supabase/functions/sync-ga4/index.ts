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

    // Log sync start
    const { data: log } = await supabase
      .from("analytics_sync_log")
      .insert({ source: "ga4", status: "running" })
      .select()
      .single();

    const ga4PropertyId = Deno.env.get("GA4_PROPERTY_ID");
    const ga4Credentials = Deno.env.get("GA4_SERVICE_ACCOUNT_KEY");

    if (!ga4PropertyId || !ga4Credentials) {
      await supabase
        .from("analytics_sync_log")
        .update({ status: "skipped", error_message: "GA4 credentials not configured", completed_at: new Date().toISOString() })
        .eq("id", log?.id);

      return new Response(
        JSON.stringify({ ok: true, message: "GA4 credentials not configured. Set GA4_PROPERTY_ID and GA4_SERVICE_ACCOUNT_KEY." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse service account credentials
    const creds = JSON.parse(ga4Credentials);

    // Get access token using JWT
    const accessToken = await getAccessToken(creds);

    // Fetch GA4 data
    const report = await fetchGA4Report(ga4PropertyId, accessToken, {
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "date" }, { name: "pagePath" }],
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }, { name: "sessions" }],
      limit: 1000,
    });

    // Store in Supabase
    let rowsSynced = 0;
    if (report.rows) {
      for (const row of report.rows) {
        const date = row.dimensionValues?.[0]?.value;
        const pagePath = row.dimensionValues?.[1]?.value;
        const activeUsers = parseInt(row.metricValues?.[0]?.value || "0");
        const pageviews = parseInt(row.metricValues?.[1]?.value || "0");

        await supabase.from("analytics_snapshots").upsert(
          {
            date: `${date?.slice(0, 4)}-${date?.slice(4, 6)}-${date?.slice(6, 8)}`,
            page_url: pagePath,
            impressions: activeUsers,
            clicks: pageviews,
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

  // Create JWT
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: creds.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: creds.token_uri,
    iat: now,
    exp: now + 3600,
  };

  const encoder = new TextEncoder();
  const headerBase64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadBase64 = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const unsignedJwt = `${headerBase64}.${payloadBase64}`;

  // Import private key
  const privateKeyPem = creds.private_key.replace(/-----BEGIN PRIVATE KEY-----/, "").replace(/-----END PRIVATE KEY-----/, "").replace(/\s/g, "");
  const privateKeyBuffer = Uint8Array.from(atob(privateKeyPem), (c) => c.charCodeAt(0));

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Sign JWT
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, encoder.encode(unsignedJwt));
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const jwt = `${unsignedJwt}.${signatureBase64}`;

  // Exchange for access token
  const tokenResponse = await fetch(creds.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const { access_token } = await tokenResponse.json();
  return access_token;
}

async function fetchGA4Report(propertyId: string, accessToken: string, body: object) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  return response.json();
}
