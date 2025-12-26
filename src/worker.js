export default {
  async fetch(request, env) {
    const body = await request.json();
    console.log("Incoming TradingView payload:", body);

    if (body.secret !== env.TRADINGVIEW_SECRET) {
      console.log("Invalid secret:", body.secret);
      return new Response("invalid secret", { status: 401 });
    }

    console.log("Secret validated");
    // ... your routing logic
  }
};
