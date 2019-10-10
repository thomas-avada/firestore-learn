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
    console.log(userDoc.id)
    let campaignQuery = campaignRef.where("user", "==", userDoc);
    const campaignDocs = await campaignQuery.get();
    let campaigns = campaignDocs.docs.map(campaign => {
        console.log(campaign.id)
        const { name, createdAt } = campaign.data();
        return {
            id: campaign.id,
            name,
            createdAt
        }
    });

    return res.send({
        campaigns
    });
});


exports.app = functions.https.onRequest(app);

exports.updateCoupon = functions
    .firestore
    .document("coupons/{couponId}")
    .onUpdate(updateCouponHandler);
