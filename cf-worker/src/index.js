/* =====================================================================
   YARN360 — WHATSAPP NOTIFICATION WORKER
   ---------------------------------------------------------------------
   Holds your WhatsApp Cloud API credentials privately and calls Meta's
   Graph API on behalf of the static site (which can never hold secrets).

   Secrets to set (via `wrangler secret put <NAME>`, never in this file):
     WHATSAPP_ACCESS_TOKEN       - permanent access token from Meta
     WHATSAPP_PHONE_NUMBER_ID    - your WhatsApp Business phone number ID
     STORE_OWNER_WHATSAPP_NUMBER - where order alerts get sent, e.g. 91XXXXXXXXXX

   Endpoints:
     POST /notify-order   - sends you a WhatsApp text with a new order's details
     POST /send-template  - sends an approved template message to any number
   ===================================================================== */

const GRAPH_API_VERSION = "v21.0";

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === "/notify-order") {
        return await handleNotifyOrder(request, env, corsHeaders);
      }
      if (url.pathname === "/send-template") {
        return await handleSendTemplate(request, env, corsHeaders);
      }
      return new Response("Not found", { status: 404, headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};

async function callGraphAPI(env, payload) {
  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "WhatsApp API request failed");
  return data;
}

/* Sends the store owner a WhatsApp message summarising a new order.
   Requires the owner's number to have messaged the business number within
   the last 24 hours (WhatsApp's free-form messaging window) — otherwise
   use /send-template with an approved template instead. */
async function handleNotifyOrder(request, env, corsHeaders) {
  const order = await request.json();
  const lines = (order.items || [])
    .map(i => `• ${i.name} × ${i.qty} — ₹${(i.price * i.qty).toLocaleString("en-IN")}`)
    .join("\n");

  const message = [
    "🛍️ New order on YARN360",
    order.orderNumber ? `Order #${order.orderNumber}` : "",
    "",
    lines,
    "",
    `Total: ₹${Number(order.total || 0).toLocaleString("en-IN")}`,
    order.customerName ? `Customer: ${order.customerName}` : "",
    order.customerPhone ? `Phone: ${order.customerPhone}` : "",
    order.address ? `Address: ${order.address}` : "",
    order.landmark ? `Landmark: ${order.landmark}` : "",
    order.pincode ? `PIN Code: ${order.pincode}` : "",
  ].filter(Boolean).join("\n");

  const data = await callGraphAPI(env, {
    messaging_product: "whatsapp",
    to: env.STORE_OWNER_WHATSAPP_NUMBER,
    type: "text",
    text: { body: message },
  });

  return new Response(JSON.stringify({ ok: true, data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/* Sends an approved WhatsApp template message — the only reliable way to
   reach a customer outside the 24-hour window (order confirmations,
   shipping updates, broadcasts). Create the template in Meta Business
   Manager first and get it approved before calling this. */
async function handleSendTemplate(request, env, corsHeaders) {
  const { to, template, languageCode = "en_US", params = [] } = await request.json();

  if (!to || !template) {
    return new Response(JSON.stringify({ error: "'to' and 'template' are required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const data = await callGraphAPI(env, {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: template,
      language: { code: languageCode },
      components: params.length
        ? [{ type: "body", parameters: params.map(p => ({ type: "text", text: String(p) })) }]
        : [],
    },
  });

  return new Response(JSON.stringify({ ok: true, data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
