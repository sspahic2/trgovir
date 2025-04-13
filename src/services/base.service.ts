function getAbsoluteUrl(url: string): string {
  if (typeof window !== "undefined") return url; // Client-side
  // Server-side fallback
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return `${base}${url}`;
}

export async function post<T>(url: string, payload?: any): Promise<T> {
  const fullUrl = getAbsoluteUrl(url);

  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`POST ${url} failed`);
  const data = await res.json();
  return data.result ?? data.success;
}

export async function get<T>(url: string): Promise<T> {
  const fullUrl = getAbsoluteUrl(url);

  const res = await fetch(fullUrl);
  if (!res.ok) throw new Error(`GET ${url} failed`);
  return res.json().then((d) => d.result);
}

export async function put<T>(url: string, body: unknown): Promise<T> {
  const fullUrl = getAbsoluteUrl(url);

  const res = await fetch(fullUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`PUT ${url} failed`);
  return res.json().then((d) => d.result);
}

export async function remove<T>(url: string, body?: unknown): Promise<T> {
  const fullUrl = getAbsoluteUrl(url);

      const res = await fetch(fullUrl, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`DELETE ${url} failed`);
    return res.json().then((d) => d.result);
}