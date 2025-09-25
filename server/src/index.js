import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';
import QRCode from 'qrcode';

dotenv.config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`; // used to build short urls

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

const db = admin.firestore();

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Create short link
app.post('/api/links', async (req, res) => {
  try {
    const { userId, destinationUrl, slug, customizations } = req.body || {};
    if (!userId || !destinationUrl) return res.status(400).json({ error: 'userId and destinationUrl are required' });

    let finalSlug = slug?.trim() || nanoid(7);
    finalSlug = finalSlug.replace(/[^a-zA-Z0-9-_]/g, '-');

    // Check uniqueness
    const exists = await db.collection('links').doc(finalSlug).get();
    if (exists.exists) return res.status(409).json({ error: 'slug already exists' });

    const linkData = {
      userId,
      destinationUrl,
      customizations: customizations || { logoUrl: '', borderColor: '#000000', bgColor: '#FFFFFF', fgColor: '#000000' },
      scans: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('links').doc(finalSlug).set(linkData);

    res.status(201).json({ slug: finalSlug, ...linkData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Get links for user
app.get('/api/links', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const snapshot = await db.collection('links').where('userId', '==', userId).get();
    const links = [];
    snapshot.forEach(doc => {
      links.push({ id: doc.id, slug: doc.id, ...doc.data() });
    });
    res.json(links);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Update destination URL
app.patch('/api/links/:slug', async (req, res) => {
  try {
    const { userId, destinationUrl, customizations } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const docRef = db.collection('links').doc(req.params.slug);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    const data = doc.data();
    if (data.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const updateData = {};
    if (destinationUrl) updateData.destinationUrl = destinationUrl;
    if (customizations) updateData.customizations = customizations;
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await docRef.update(updateData);
    res.json({ slug: req.params.slug, ...data, ...updateData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Redirect endpoint with scan logging
app.get('/r/:slug', async (req, res) => {
  try {
    const docRef = db.collection('links').doc(req.params.slug);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).send('Not found');

    const data = doc.data();
    const scan = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date(),
    };

    await docRef.update({
      scans: admin.firestore.FieldValue.arrayUnion(scan),
    });

    res.redirect(302, data.destinationUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal error');
  }
});

app.listen(PORT, () => console.log(`API listening on ${PORT}`));