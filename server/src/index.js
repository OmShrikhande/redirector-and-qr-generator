import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';
import QRCode from 'qrcode';
import Link from './models/Link.js';

dotenv.config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`; // used to build short urls

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/redirector';
await mongoose.connect(MONGODB_URI, { autoIndex: true });

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Create short link (slug immutable)
app.post('/api/links', async (req, res) => {
  try {
    const { destinationUrl, slug } = req.body || {};
    if (!destinationUrl) return res.status(400).json({ error: 'destinationUrl is required' });

    let finalSlug = slug?.trim() || nanoid(7);
    // normalize slug
    finalSlug = finalSlug.replace(/[^a-zA-Z0-9-_]/g, '-');

    // ensure uniqueness
    const exists = await Link.findOne({ slug: finalSlug }).lean();
    if (exists) return res.status(409).json({ error: 'slug already exists' });

    const doc = await Link.create({ slug: finalSlug, destinationUrl });
    const shortUrl = `${BASE_URL}/r/${doc.slug}`;

    // Generate QR as data URL (PNG). Frontend can also request by /api/links/:slug/qr
    const qrDataUrl = await QRCode.toDataURL(shortUrl, { margin: 1, width: 256 });

    res.status(201).json({ slug: doc.slug, destinationUrl: doc.destinationUrl, shortUrl, qrDataUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Get all links (basic admin list)
app.get('/api/links', async (_req, res) => {
  const items = await Link.find().sort({ createdAt: -1 }).lean();
  res.json(items.map(i => ({ slug: i.slug, destinationUrl: i.destinationUrl, createdAt: i.createdAt, updatedAt: i.updatedAt })));
});

// Get single link
app.get('/api/links/:slug', async (req, res) => {
  const item = await Link.findOne({ slug: req.params.slug }).lean();
  if (!item) return res.status(404).json({ error: 'Not found' });
  const shortUrl = `${BASE_URL}/r/${item.slug}`;
  res.json({ slug: item.slug, destinationUrl: item.destinationUrl, shortUrl });
});

// Update destination URL (slug immutable)
app.patch('/api/links/:slug', async (req, res) => {
  try {
    const { destinationUrl } = req.body || {};
    if (!destinationUrl) return res.status(400).json({ error: 'destinationUrl is required' });

    const updated = await Link.findOneAndUpdate(
      { slug: req.params.slug },
      { $set: { destinationUrl } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'Not found' });
    const shortUrl = `${BASE_URL}/r/${updated.slug}`;
    res.json({ slug: updated.slug, destinationUrl: updated.destinationUrl, shortUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Optional: change slug AND retire old slug (as requested)
app.post('/api/links/:slug/change-slug', async (req, res) => {
  const { newSlug } = req.body || {};
  if (!newSlug) return res.status(400).json({ error: 'newSlug is required' });
  const final = newSlug.replace(/[^a-zA-Z0-9-_]/g, '-');
  const occupied = await Link.findOne({ slug: final }).lean();
  if (occupied) return res.status(409).json({ error: 'newSlug already exists' });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const current = await Link.findOne({ slug: req.params.slug }).session(session);
    if (!current) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Not found' });
    }
    const dest = current.destinationUrl;
    await Link.deleteOne({ slug: req.params.slug }).session(session);
    const created = await Link.create([{ slug: final, destinationUrl: dest }], { session });
    await session.commitTransaction();
    const shortUrl = `${BASE_URL}/r/${final}`;
    res.json({ slug: final, destinationUrl: dest, shortUrl });
  } catch (e) {
    await session.abortTransaction();
    console.error(e);
    res.status(500).json({ error: 'Internal error' });
  } finally {
    session.endSession();
  }
});

// Generate QR endpoint (always same for same slug)
app.get('/api/links/:slug/qr', async (req, res) => {
  const item = await Link.findOne({ slug: req.params.slug }).lean();
  if (!item) return res.status(404).json({ error: 'Not found' });
  const shortUrl = `${BASE_URL}/r/${item.slug}`;
  try {
    const png = await QRCode.toBuffer(shortUrl, { margin: 1, width: 256 });
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'QR generation failed' });
  }
});

// Redirect endpoint
app.get('/r/:slug', async (req, res) => {
  const item = await Link.findOne({ slug: req.params.slug }).lean();
  if (!item) return res.status(404).send('Not found');
  // 302 temporary redirect lets destination be updated later
  res.redirect(302, item.destinationUrl);
});

app.listen(PORT, () => console.log(`API listening on ${PORT}`));