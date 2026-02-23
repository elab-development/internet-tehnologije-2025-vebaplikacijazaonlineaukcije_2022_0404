export async function fetchRates(base = 'EUR') {
  const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
  if (!res.ok) throw new Error('Failed to fetch currency rates');
  const data = await res.json();

  // format: { result: "success", rates: { RSD: 117..., USD: ... } }
  if (!data?.rates) throw new Error('Invalid rates response');
  return data;
}
