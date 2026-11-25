import { getStore } from "@netlify/blobs";

const ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const RESERVED = ["api", "index.html", "favicon.ico"];

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const isValidUrl = (str) => {
  try {
    return ["http:", "https:"].includes(new URL(str).protocol);
  } catch {
    return false;
  }
};

const randomSlug = (len = 6) =>
  Array.from(crypto.getRandomValues(new Uint8Array(len)), (b) => ALPHABET[b % ALPHABET.length]).join("");

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Gunakan metode POST" }, 405);

  const adminPassword = Netlify.env.get("ADMIN_PASSWORD");
  if (!adminPassword) return json({ error: "ADMIN_PASSWORD belum diatur di Netlify" }, 500);
  if (req.headers.get("x-password") !== adminPassword) return json({ error: "Kata sandi salah" }, 401);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Permintaan tidak valid" }, 400);
  }

  const { url, alias } = body;
  if (!isValidUrl(url)) {
    return json({ error: "URL tidak valid (harus diawali http:// atau https://)" }, 400);
  }

  const store = getStore({ name: "links", consistency: "strong" });
  let slug = (alias || "").trim();

  if (slug) {
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(slug)) {
      return json({ error: "Alias hanya boleh huruf, angka, - dan _ (3-30 karakter)" }, 400);
    }
    if (RESERVED.includes(slug) || (await store.get(slug))) {
      return json({ error: "Alias sudah dipakai" }, 409);
    }
  } else {
    do {
      slug = randomSlug();
    } while (await store.get(slug));
  }

  await store.setJSON(slug, { url, clicks: 0, createdAt: new Date().toISOString() });

  const origin = new URL(req.url).origin;
  return json({ slug, shortUrl: `${origin}/${slug}`, url }, 201);
};
