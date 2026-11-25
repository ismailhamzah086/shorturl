import { getStore } from "@netlify/blobs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req) => {
  const adminPassword = Netlify.env.get("ADMIN_PASSWORD");
  if (!adminPassword) return json({ error: "ADMIN_PASSWORD belum diatur di Netlify" }, 500);
  if (req.headers.get("x-password") !== adminPassword) return json({ error: "Kata sandi salah" }, 401);

  const store = getStore("links");
  const { blobs } = await store.list();
  const origin = new URL(req.url).origin;

  const items = await Promise.all(
    blobs.map(async ({ key }) => {
      const entry = await store.get(key, { type: "json" });
      return entry ? { slug: key, shortUrl: `${origin}/${key}`, ...entry } : null;
    })
  );

  const links = items.filter(Boolean).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  return json({ links });
};
