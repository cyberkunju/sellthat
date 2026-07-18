import { Hono } from "hono";
import { z } from "zod";

import { handleInboundMessage } from "./agent";
import { config, configSummary } from "./config";
import { getImage, getProduct, listProducts } from "./products";
import { createWhatsAppWebhookRouter } from "./whatsapp/webhook";

const UuidSchema = z.string().uuid();

const app = new Hono();

app.get("/api/health", (context) => context.json({ ok: true }));

app.get("/api/products", async (context) => {
  const products = await listProducts();
  return context.json(products);
});

app.get("/api/products/:id", async (context) => {
  const parsedId = UuidSchema.safeParse(context.req.param("id"));
  if (!parsedId.success) {
    return context.json({ error: "Not found" }, 404);
  }

  const product = await getProduct(parsedId.data);
  return product ? context.json(product) : context.json({ error: "Not found" }, 404);
});

app.get("/media/:id", async (context) => {
  const parsedId = UuidSchema.safeParse(context.req.param("id"));
  if (!parsedId.success) {
    return context.text("Not found", 404);
  }

  const image = await getImage(parsedId.data);
  if (!image) {
    return context.text("Not found", 404);
  }

  return context.body(image.bytes, 200, {
    "content-type": image.mime,
    "cache-control": "public, max-age=86400",
    "x-content-type-options": "nosniff",
  });
});

app.route(
  "/",
  createWhatsAppWebhookRouter({
    verifyToken: config.whatsappVerifyToken,
    appSecret: config.whatsappAppSecret,
    onMessage: handleInboundMessage,
    onWabaId: async (wabaId) => {
      // This is deliberately the only WABA logging point. It contains no
      // credentials and lets deployers perform the surgical webhook flip.
      console.info(`[webhook] received WABA id: ${wabaId}`);
    },
    logger: console,
  }),
);

app.onError((error, context) => {
  const reason = error instanceof Error && error.name ? error.name : "unknown";
  console.warn(`[server] request failed (${reason})`);
  return context.json({ error: "Internal server error" }, 500);
});

console.info("SellThat backend starting", configSummary());

Bun.serve({
  port: config.port,
  fetch: app.fetch,
});

export { app };
