import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require admin password — this function performs privileged writes
    // and consumes AI credits, so it must never be callable anonymously.
    const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");
    if (!ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "Admin password not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const provided = req.headers.get("x-admin-password") ?? "";
    if (provided !== ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current products
    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select("id, name, price, category, unit, seasonal");

    if (fetchError) throw fetchError;

    // Get current month for seasonal awareness
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "long" });
    const season = getSeason(now.getMonth());

    const prompt = `You are a Pakistani grocery market price expert. It is ${month} 2026, which is ${season} season.

For these grocery products, estimate today's realistic Pakistani market retail prices in PKR (Pakistani Rupees). Consider:
- Current season and weather effects on produce
- Inflation trends in Pakistan
- Supply/demand for seasonal items
- Prices should vary slightly day to day (±2-5% from baseline)

Also update the seasonal status for fruits and vegetables based on the current month (${month}):
- seasonal: true/false
- season_label: "In Season", "Spring", "Coming Soon", "Last Stock", "Early Season", or null

Current products:
${JSON.stringify(products, null, 2)}

Return ONLY a JSON array with objects containing: id, price (number), seasonal (boolean), season_label (string or null). No explanation.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a market price estimator. Return only valid JSON arrays." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error(`AI gateway returned ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) throw new Error("No AI response content");

    let priceUpdates: Array<{ id: string; price: number; seasonal: boolean; season_label: string | null }>;
    try {
      const parsed = JSON.parse(content);
      priceUpdates = Array.isArray(parsed) ? parsed : parsed.products || parsed.data || Object.values(parsed)[0];
    } catch {
      throw new Error("Failed to parse AI response as JSON");
    }

    // Update prices in database
    let updated = 0;
    for (const update of priceUpdates) {
      const currentProduct = products?.find((p: { id: string }) => p.id === update.id);
      if (!currentProduct) continue;

      const oldPrice = Number(currentProduct.price);
      const newPrice = Math.round(Number(update.price));

      if (oldPrice !== newPrice) {
        // Record price history
        await supabase.from("price_history").insert({
          product_id: update.id,
          old_price: oldPrice,
          new_price: newPrice,
        });
      }

      const { error: updateError } = await supabase
        .from("products")
        .update({
          price: newPrice,
          seasonal: update.seasonal,
          season_label: update.season_label,
          last_price_update: new Date().toISOString(),
        })
        .eq("id", update.id);

      if (!updateError) updated++;
    }

    return new Response(
      JSON.stringify({ success: true, updated, total: priceUpdates.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Price update error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getSeason(month: number): string {
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Autumn";
  return "Winter";
}
