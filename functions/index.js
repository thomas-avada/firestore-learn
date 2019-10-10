const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const serviceAccount = require("./serviceAccountKey.json");
const updateCouponHandler = require("./handlers/updateCouponHandler");
const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();


const firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://test-node-firebase-b9cd0.firebaseio.com"
});

// Setup
const db = firebaseApp.firestore();
// const app = express.Router();
const campaignRef = db.collection("campaigns");
const userRef = db.collection("users");

// Middleware
app.use(bodyParser.json());

// API
app.get('/campaigns', async (req, res) => {
    let campaignStartDocRef = db.collection('campaigns').doc('bj0ZVr3eIdYiLhocfcQv');
    const campaigns = campaignStartDocRef.get().then(snapshot => {
        let startAtSnapshot = db.collection('campaigns')
            .orderBy('createdAt')
            .startAt(snapshot);

        return startAtSnapshot.limit(5).get();
    });
    let data = [];
    campaigns.then(snapshot => {
        snapshot.forEach(doc => {
            data.push({
                id: doc.id,
                name: doc.data().name
            })
        });
        return res.send({
            data,
            size: data.length
        });
    })

});


exports.app = functions.https.onRequest(app);

exports.updateCoupon = functions
    .firestore
    .document("coupons/{couponId}")
    .onUpdate(updateCouponHandler);
