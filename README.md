# Short URL untuk Netlify

Struktur:
  public/index.html            halaman web
  netlify/functions/shorten.mjs  membuat tautan pendek
  netlify/functions/go.mjs       redirect /:slug ke URL asli
  netlify.toml                 konfigurasi & aturan redirect
  package.json                 dependensi (@netlify/blobs untuk penyimpanan)

Deploy: unggah ke GitHub, lalu di Netlify pilih
"Add new site > Import an existing project" dan pilih repositorinya.
Pengaturan build biasanya terbaca otomatis dari netlify.toml.
