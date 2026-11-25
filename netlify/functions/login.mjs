const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Gunakan metode POST" }, 405);

  const adminPassword = Netlify.env.get("ADMIN_PASSWORD");
  if (!adminPassword) return json({ error: "ADMIN_PASSWORD belum diatur di Netlify" }, 500);

  let body = {};
  try { body = await req.json(); } catch {}

  if (body.password !== adminPassword) return json({ error: "Kata sandi salah" }, 401);
  return json({ ok: true });
};
