type RateLimitEntry = {
  count: number;
  resetAt: number;
};

/**
 * Süreç içi (in-memory) sayaç. Tek instance için yeterlidir; yatay ölçeklemede
 * her instance kendi sayacını tuttuğu için limitler instance başına uygulanır.
 * Çok-instance dağıtımda paylaşımlı bir store (ör. Redis) ile değiştirilmelidir.
 */
const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}
