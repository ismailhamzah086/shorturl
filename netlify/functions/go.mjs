import { getStore } from "@netlify/blobs";

export default async (req) => {
  const slug = new URL(req.url).searchParams.get("slug");
  const store = getStore("links");
  const entry = slug ? await store.get(slug, { type: "json" }) : null;

  if (!entry) {
    return new Response("<h1>404</h1><p>Tautan tidak ditemukan.</p>", {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  entry.clicks = (entry.clicks || 0) + 1;
  await store.setJSON(slug, entry);

  return new Response(null, { status: 302, headers: { Location: entry.url } });
};
