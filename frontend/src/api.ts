export interface Product {
  id: string;
  title: string;
  price: number;
  quantity: number;
  category: string;
  description: string;
  imageUrl: string | null;
  sellerName: string | null;
  sellerLocation: string | null;
  createdAt: string;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "");

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalidResponse(context: string): ApiError {
  return new ApiError(`Invalid API response for ${context}`, 502);
}

function parseProduct(value: unknown, context: string): Product {
  if (!isRecord(value)) throw invalidResponse(context);

  const {
    id,
    title,
    price,
    quantity,
    category,
    description,
    imageUrl,
    sellerName,
    sellerLocation,
    createdAt,
  } = value;

  const validRequiredStrings =
    typeof id === "string" && id.length > 0 &&
    typeof title === "string" && title.length > 0 &&
    typeof category === "string" && category.length > 0 &&
    typeof description === "string" &&
    typeof createdAt === "string" && !Number.isNaN(Date.parse(createdAt));
  const validNumbers =
    typeof price === "number" && Number.isInteger(price) && price >= 0 &&
    typeof quantity === "number" && Number.isInteger(quantity) && quantity >= 1;
  const validImage =
    imageUrl === null ||
    (typeof imageUrl === "string" && /^\/media\/[^/]+$/.test(imageUrl));
  const validSeller =
    (sellerName === null || typeof sellerName === "string") &&
    (sellerLocation === null || typeof sellerLocation === "string");

  if (!validRequiredStrings || !validNumbers || !validImage || !validSeller) {
    throw invalidResponse(context);
  }

  return {
    id,
    title,
    price,
    quantity,
    category,
    description,
    imageUrl,
    sellerName,
    sellerLocation,
    createdAt,
  };
}

async function requestJson(path: string, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  const abortFromCaller = (): void => controller.abort();

  if (signal?.aborted) controller.abort();
  else signal?.addEventListener("abort", abortFromCaller, { once: true });

  const timeout = globalThis.setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(buildUrl(path), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new ApiError("The marketplace request failed", response.status);
    }

    try {
      return await response.json() as unknown;
    } catch {
      throw invalidResponse(path);
    }
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error;
    if (signal?.aborted && error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    if (controller.signal.aborted) {
      throw new ApiError("The marketplace request timed out", 0);
    }
    throw new ApiError("The marketplace service is unavailable", 0);
  } finally {
    globalThis.clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}

export async function getProducts(signal?: AbortSignal): Promise<Product[]> {
  const payload = await requestJson("/api/products", signal);
  if (!Array.isArray(payload)) throw invalidResponse("product list");
  return payload.map((product, index) => parseProduct(product, `product list item ${index}`));
}

export async function getProduct(id: string, signal?: AbortSignal): Promise<Product> {
  const payload = await requestJson(`/api/products/${encodeURIComponent(id)}`, signal);
  return parseProduct(payload, "product detail");
}

export function toAssetUrl(path: string): string {
  return buildUrl(path);
}
