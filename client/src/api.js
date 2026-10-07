export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch("/api" + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const CATEGORIES = ["Books", "Electronics", "Furniture", "Clothing", "Cycles", "Stationery", "Other"];
export const formatPrice = (p) => "₹" + Number(p).toLocaleString("en-IN");