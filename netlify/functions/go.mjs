import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);

  // Ambil slug dari ?slug=... atau, kalau tidak ada, dari bagian akhir path
  let slug = url.searchParams.get("slug");
  if (!slug) {
    const last = url.pathname.split("/").filter(Boolean).pop() || "";
    try { slug = decodeURIComponent(last); } catch { slug = last; }
  }

  const store = getStore({ name: "links", consistency: "strong" });
  const entry = slug ? await store.get(slug, { type: "json" }) : null;
  console.log("redirect lookup:", JSON.stringify({ slug, found: !!entry, path: url.pathname }));

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
