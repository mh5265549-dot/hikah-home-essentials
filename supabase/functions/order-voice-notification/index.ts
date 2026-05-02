import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderPayload {
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
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

    const order: OrderPayload = await req.json();

    if (!order?.customerName || !Array.isArray(order.items) || order.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid order payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize all user-supplied fields before injecting into TTS text to
    // prevent content-injection attacks where a malicious customer could
    // craft fields that get spoken as fake instructions.
    const sanitizeText = (s: unknown, max: number) =>
      String(s ?? "")
        .replace(/[^\p{L}\p{N}\s,.\-'\/]/gu, " ")
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