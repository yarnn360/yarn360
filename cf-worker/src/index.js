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
     POST /notify-order      - sends you a WhatsApp text with a new order's details
     POST /send-template     - sends an approved template message to any number
     POST /notify-customer   - sends the customer an order-received text +
                                the payment QR image (works within the 24-hour
                                window opened by their own "Place order" message)
     POST /confirm-order     - sends the customer a final "order confirmed,
                                dispatching soon" text after they submit their
                                payment screenshot
   ===================================================================== */

const GRAPH_API_VERSION = "v21.0";

export default {
  async fetch(request, env) {
    // Allow both the live site and local dev testing (127.0.0.1:5500 / Live Server).
    const allowedOrigins = [env.ALLOWED_ORIGIN, "http://127.0.0.1:5500", "http://localhost:5500"].filter(Boolean);
    const requestOrigin = request.headers.get("Origin");
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0],
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
      if (url.pathname === "/notify-customer") {
        return await handleNotifyCustomer(request, env, corsHeaders);
      }
      if (url.pathname === "/confirm-order") {
        return await handleConfirmOrder(request, env, corsHeaders);
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

/* Uploads a PNG image (as base64) to Meta's media endpoint and returns its
   media ID, which can then be referenced in an image message. */
async function uploadImageMedia(env, base64Png) {
  const binary = atob(base64Png);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", "image/png");
  form.append("file", new Blob([bytes], { type: "image/png" }), "payment-qr.png");

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/media`,
    { method: "POST", headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}` }, body: form }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Media upload failed");
  return data.id;
}

/* Sends the customer an order confirmation text plus the payment QR image.
   Only works within WhatsApp's 24-hour free-form window — which the
   customer opens themselves by messaging the business first (e.g. tapping
   "Place order on WhatsApp"), so no approved template is needed here. */
async function handleNotifyCustomer(request, env, corsHeaders) {
  const { to, orderNumber, amount, dispatchDays, qrImageBase64 } = await request.json();

  if (!to || !orderNumber || !qrImageBase64) {
    return new Response(JSON.stringify({ error: "'to', 'orderNumber', and 'qrImageBase64' are required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const message = [
    `✅ Your order has been received!`,
    "",
    `Order Number: ${orderNumber}`,
    `Total: ₹${Number(amount || 0).toLocaleString("en-IN")}`,
    "",
    "Scan the QR image below with any UPI app to pay, then send us your payment screenshot on this chat.",
    "",
    `We'll dispatch your order within ${dispatchDays || "2-3"} days of payment confirmation.`,
  ].join("\n");

  const textResult = await callGraphAPI(env, {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: message },
  });

  const mediaId = await uploadImageMedia(env, qrImageBase64);
  const imageResult = await callGraphAPI(env, {
    messaging_product: "whatsapp",
    to,
    type: "image",
    image: { id: mediaId, caption: `Scan to pay for order ${orderNumber}` },
  });

  return new Response(JSON.stringify({ ok: true, text: textResult, image: imageResult }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/* Sends the customer a final "order confirmed" text after they've submitted
   their payment screenshot — a separate, shorter message from the initial
   order-received + QR message sent by /notify-customer. */
async function handleConfirmOrder(request, env, corsHeaders) {
  const { to, orderNumber, dispatchDays } = await request.json();

  if (!to || !orderNumber) {
    return new Response(JSON.stringify({ error: "'to' and 'orderNumber' are required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const message = [
    `✅ Order ${orderNumber} confirmed!`,
    "",
    "Thank you for shopping with YARN360.",
    `We'll verify your payment and dispatch your order within ${dispatchDays || "2-3"} days. Tracking will be shared here on WhatsApp.`,
  ].join("\n");

  const data = await callGraphAPI(env, {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: message },
  });

  return new Response(JSON.stringify({ ok: true, data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
