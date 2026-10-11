import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

const VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"; // George - clear male voice

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    // Anti-abuse: require a valid, recently-created order ID. We look it up
    // server-side with the service role and only allow the voice notification
    // to fire once per order. This prevents anonymous callers from burning
    // ElevenLabs credits with crafted payloads.
    const body = await req.json().catch(() => null);
    const orderId = body?.orderId;
    if (typeof orderId !== "string" || !/^[0-9a-f-]{36}$/i.test(orderId)) {
      return new Response(
        JSON.stringify({ error: "Invalid orderId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: orderRow, error: lookupErr } = await admin
      .from("orders")
      .select("id, customer_name, phone, address, items, total, payment_method, created_at, voice_notified_at")
      .eq("id", orderId)
      .maybeSingle();

    if (lookupErr) throw lookupErr;
    if (!orderRow) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only allow notification within 5 minutes of order creation, and only once.
    const ageMs = Date.now() - new Date(orderRow.created_at).getTime();
    if (ageMs > 5 * 60 * 1000) {
      return new Response(
        JSON.stringify({ error: "Order too old for notification" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (orderRow.voice_notified_at) {
      return new Response(
        JSON.stringify({ error: "Already notified" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Atomically claim the notification slot to prevent concurrent duplicate calls.
    const { data: claimed, error: claimErr } = await admin
      .from("orders")
      .update({ voice_notified_at: new Date().toISOString() })
      .eq("id", orderId)
      .is("voice_notified_at", null)
      .select("id")
      .maybeSingle();
    if (claimErr) throw claimErr;
    if (!claimed) {
      return new Response(
        JSON.stringify({ error: "Already notified" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const order = {
      customerName: orderRow.customer_name,
      phone: orderRow.phone,
      address: orderRow.address,
      items: (orderRow.items as OrderItem[]) ?? [],
      total: orderRow.total,
      paymentMethod: orderRow.payment_method,
    };

    // Sanitize all user-supplied fields before injecting into TTS text to
    // prevent content-injection attacks where a malicious customer could
    // craft fields that get spoken as fake instructions.
    const sanitizeText = (s: unknown, max: number) =>
      String(s ?? "")
        .replace(/[^\p{L}\p{N}\s,.\-'/]/gu, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max);
    const sanitizePhone = (s: unknown) =>
      String(s ?? "").replace(/[^\d+\-\s]/g, "").slice(0, 20);
    const sanitizeNumber = (n: unknown) => {
      const v = Number(n);
      return Number.isFinite(v) ? Math.max(0, Math.min(v, 9_999_999)) : 0;
    };

    const safeName = sanitizeText(order.customerName, 60);
    const safeAddress = sanitizeText(order.address, 120);
    const safePhone = sanitizePhone(order.phone);
    const safePayment = sanitizeText(order.paymentMethod, 30);
    const safeTotal = sanitizeNumber(order.total);

    const itemsText = order.items
      .slice(0, 20)
      .map((i) => {
        const qty = sanitizeNumber(i.quantity);
        const name = sanitizeText(i.name, 40);
        return `${qty} ${name}`;
      })
      .join(", ");

    if (!safeName || !safeAddress || !safePhone || !itemsText) {
      return new Response(
        JSON.stringify({ error: "Invalid order payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const announcement =
      `Attention HIKMAH shop! New order received. ` +
      `Customer ${safeName} ordered ${itemsText}. ` +
      `Total amount is ${safeTotal} rupees. ` +
      `Payment method: ${safePayment}. ` +
      `Deliver to ${safeAddress}. Phone number ${safePhone}. ` +
      `Please prepare the order quickly.`;

    const ttsResp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: announcement,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!ttsResp.ok) {
      const errText = await ttsResp.text();
      throw new Error(`ElevenLabs TTS failed [${ttsResp.status}]: ${errText}`);
    }

    const audioBuffer = await ttsResp.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "X-Announcement": encodeURIComponent(announcement),
      },
    });
  } catch (err) {
    console.error("order-voice-notification error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});