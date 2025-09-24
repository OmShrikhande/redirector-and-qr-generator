# Redirector and QR Generator

A simple React + Node.js (Express) app to create short links with constant QR codes (slug is immutable, only destination changes). Backend uses MongoDB.

## Setup

1) Requirements
- **Node.js**: 18+
- **MongoDB**: local or cloud URI

2) Backend
- Copy `server/.env.example` to `server/.env` and set values:
```
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/redirector
BASE_URL=http://localhost:3000
```
- Install deps and run:
```
cd server
npm install
npm run dev
```

3) Frontend
- In project root, run:
```
npm install
npm run dev
```
- Vite proxies `/api` and `/r` to `http://localhost:3000`.

## API (summary)
- POST `/api/links` { destinationUrl, slug? } → create
- GET `/api/links` → list
- GET `/api/links/:slug` → details
- PATCH `/api/links/:slug` { destinationUrl } → update destination
- POST `/api/links/:slug/change-slug` { newSlug } → change slug and retire old one
- GET `/api/links/:slug/qr` → PNG QR of `BASE_URL/r/:slug`
- GET `/r/:slug` → 302 redirect to destination

## Notes
- The QR encodes the short URL: `BASE_URL/r/:slug`. This QR remains constant as long as the slug remains unchanged.
- Changing slug creates a new short URL; the old slug stops working.
