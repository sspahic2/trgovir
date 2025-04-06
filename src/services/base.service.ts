export async function post<T>(url: string, payload?: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`POST ${url} failed`);
  const data = await res.json();
  return data.result ?? data.success;
}