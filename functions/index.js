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
    const userDoc = userRef.doc("hRF3e4PUclm85clOuur0");
    let campaignStartDocRef = campaignRef.doc('2RNnoWHJdw9I8vSE2M8v');
    let campaignStartDoc = await campaignStartDocRef.get();
    let campaigns = await campaignRef
        .where("user", "==", userDoc)
        .orderBy('createdAt')
        .startAfter(campaignStartDoc)
        .limit(10).get();
    let hasNextPage = false;
    if (campaigns.size > 0) {
        const lastCampaign = campaigns.docs[campaigns.size - 1];
        const hasNextPageSnapshot = await campaignRef
            .where("user", "==", userDoc)
            .orderBy('createdAt', "desc")
            .startAfter(campaignStartDoc)
            .limit(1)
            .get();
        hasNextPage = hasNextPageSnapshot.size > 0;
    }
    campaigns = campaigns.docs.map(doc => {
        return {
            id: doc.id,
            name: doc.data().name
        }
    });
    return res.send({
        edges: campaigns,
        pageInfo: {
            hasNextPage,
            startAt: hasNextPage ? campaigns[campaigns.length - 1].id : null
        }
    });
});


exports.app = functions.https.onRequest(app);

exports.updateCoupon = functions
    .firestore
    .document("coupons/{couponId}")
    .onUpdate(updateCouponHandler);
