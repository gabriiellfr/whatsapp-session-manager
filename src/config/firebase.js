// src/config/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceAccountKey.json');

const { firebaseDB } = require('./config');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: firebaseDB,
});

const db = admin.firestore();

module.exports = { admin, db };
