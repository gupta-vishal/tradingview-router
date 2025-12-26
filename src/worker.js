export default {
  async fetch(request, env) {
    // 1. Handle GET requests (browser visits)
    if (request.method === "GET") {
      return new Response("TradingView Router Worker is running", {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    }

    // 2. Only POST requests should reach here
    let body;
    try {
      body = await request.json();
    } catch (err) {
      console.log("Invalid or missing JSON body");
      return new Response("Invalid JSON", { status: 400 });
    }

    console.log("Incoming TradingView payload:", body);

    // 3. Validate secret
    if (body.secret !== env.TRADINGVIEW_SECRET) {
      console.log("Invalid secret:", body.secret);
      return new Response("invalid secret", { status: 401 });
    }

    console.log("Secret validated");

    try {
      const result = await sendIronbeamWithProtection(json, env);
      return new Response(result, { status: 200 });
    } catch (err) {
      console.log("Ironbeam error:", err.message);
      return new Response("Ironbeam error: " + err.message, { status: 500 });
    }

  }
};

async function sendIronbeamWithProtection(body, env) {
  return circuitBreaker(env, "ironbeam", () =>
    retry(() => sendIronbeamOrder(body, env), 5, 300)
  );
}


async function sendIronbeamOrder(body, env) {
  const endpoint = "https://demo.ironbeam.com/v1/order"; // replace with demo/live

  const timestamp = Date.now().toString();
  const payload = JSON.stringify({
    symbol: body.symbol,
    side: body.side.toUpperCase(), // buy → BUY
    quantity: Number(body.qty),
    type: "MARKET",
    time_in_force: "GTC"
  });

  // HMAC signature
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(env.IRONBEAM_API_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(timestamp + payload)
  );

  const signature = [...new Uint8Array(signatureBuffer)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": env.IRONBEAM_API_KEY,
      "X-API-TIMESTAMP": timestamp,
      "X-API-SIGNATURE": signature
    },
    body: payload
  });

  const text = await res.text();
  console.log("Ironbeam response:", text);

  if (!res.ok) {
    throw new Error(`Ironbeam error: ${text}`);
  }

  return text;
}

async function retry(fn, retries = 5, baseDelay = 300) {
  let attempt = 0;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;

      console.log(`Retry attempt ${attempt} failed: ${err.message}`);

      if (attempt >= retries) {
        throw err;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

async function circuitBreaker(env, key, fn) {
  const stateKey = `cb:${key}`;
  const now = Date.now();

  // Load state
  const stateRaw = await env.CB.get(stateKey);
  const state = stateRaw ? JSON.parse(stateRaw) : {
    failures: 0,
    openedAt: 0,
    open: false
  };

  // If breaker is open, block calls
  if (state.open && now - state.openedAt < 5000) {
    throw new Error("Circuit breaker open");
  }

  try {
    const result = await fn();

    // Success → reset breaker
    state.failures = 0;
    state.open = false;
    await env.CB.put(stateKey, JSON.stringify(state));

    return result;

  } catch (err) {
    state.failures++;

    if (state.failures >= 3) {
      state.open = true;
      state.openedAt = now;
    }

    await env.CB.put(stateKey, JSON.stringify(state));

    throw err;
  }
}

