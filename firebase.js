const admin = require('firebase-admin');
require('dotenv').config();

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // For production (Railway, Render, etc.) — base64 encoded JSON
  serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8'));
} else {
  // Local development — place your serviceAccountKey.json in the root
  try {
    serviceAccount = require('./serviceAccountKey.json');
  } catch (e) {
    console.warn('⚠️  No serviceAccountKey.json found. Using placeholder mode (demo data).');
    serviceAccount = null;
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'phillabor-crm-a8447.firebasestorage.app'
  });
  console.log('✅ Firebase Admin initialized successfully');
} else {
  console.log('⚠️  Running in DEMO mode — using mock data from your backup');
}

module.exports = admin;