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

    // 4. Your routing logic goes here
    // Example:
    // await sendOrderToIronbeam(body, env);

    return new Response("ok", { status: 200 });
  }
};
