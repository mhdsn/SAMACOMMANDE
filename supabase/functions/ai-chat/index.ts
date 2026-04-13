// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function errorResponse(status, error) {
  return new Response(
    JSON.stringify({ error }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // --- Auth check: verify the user is logged in ---
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return errorResponse(401, "Missing Authorization header");
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return errorResponse(401, "Unauthorized");
  }

  // --- Check Pro plan ---
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sub || sub.plan_id !== "pro") {
    return errorResponse(403, "Pro plan required");
  }

  // --- API key check ---
  if (!ANTHROPIC_API_KEY) {
    return errorResponse(500, "ANTHROPIC_API_KEY not configured");
  }

  try {
    const { system, messages } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      let code = "API_ERROR";
      if (status === 400) code = "BAD_REQUEST";
      if (status === 401 || status === 403) code = "INVALID_API_KEY";
      if (status === 429) code = "RATE_LIMIT";
      if (status === 500 || status === 503) code = "OVERLOADED";
      return errorResponse(status, code);
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return errorResponse(502, "NETWORK_ERROR");
  }
});
